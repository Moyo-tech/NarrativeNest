import { NextRequest } from 'next/server'
import { writer2Schema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Gemini API endpoint for streaming
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiMessage {
  role: string;
  parts: { text: string }[];
}

async function inference(messages: any[], apiKey: string, modelId: string, temperature: number, maxTokens: number = 500) {
  console.log("START REQUEST")
  console.log("MESSAGES", messages)

  // Convert OpenAI message format to Gemini format
  const geminiContents: GeminiMessage[] = messages.map((msg: any) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));

  // Extract system message if present
  let systemInstruction = undefined;
  const systemMsg = messages.find((msg: any) => msg.role === "system");
  if (systemMsg) {
    systemInstruction = { parts: [{ text: systemMsg.content }] };
    // Remove system message from contents
    const filteredContents = geminiContents.filter((msg) =>
      !messages.find((m: any) => m.role === "system" && m.content === msg.parts[0].text)
    );
    geminiContents.length = 0;
    geminiContents.push(...filteredContents);
  }

  // Use gemini-2.0-flash as default model
  const geminiModel = "gemini-2.0-flash";

  const payload = JSON.stringify({
    contents: geminiContents,
    ...(systemInstruction && { systemInstruction }),
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: parseFloat(String(temperature)) || 1.0,
    }
  });

  // Use streaming endpoint
  const resx = await fetch(`${GEMINI_API_URL}/${geminiModel}:streamGenerateContent?alt=sse&key=${apiKey}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: payload
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  if (resx.status !== 200) {
    const result = await resx.text();
    throw new Error(result)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const reader = resx.body?.getReader();
      if (!reader) {
        controller.close();
        return;
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              // Extract text from Gemini response format
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                const queue = encoder.encode(text);
                controller.enqueue(queue);
              }
            } catch (e) {
              // Skip parse errors for incomplete chunks
              console.log("Parse error (may be incomplete chunk):", e);
            }
          }
        }
      }
    },
  });

  return stream;
}

export async function POST(request: NextRequest) {
  // Check rate limit (20 requests per minute)
  const { allowed, resetTime } = checkRateLimit(request, { windowMs: 60000, maxRequests: 20 });
  if (!allowed) {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
    return new Response(JSON.stringify({
      status: 429,
      message: 'Too many requests. Please try again later.',
      retryAfter
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      }
    });
  }

  try {
    const body = await request.json();

    // Validate input
    const parseResult = writer2Schema.safeParse(body);
    if (!parseResult.success) {
      return new Response(JSON.stringify({
        status: 400,
        message: "Invalid input",
        errors: parseResult.error.flatten()
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { task, messages, modelId, temperature, maxTokens } = parseResult.data;

    console.log("TASK:", task);

    // Security: Only use server-side API key, never accept from client
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ status: 500, message: "GEMINI_API_KEY required" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stream = await inference(messages, apiKey, modelId || 'gemini-2.0-flash', temperature, maxTokens);

    return new Response(stream, {
      headers: { 'Transfer-Encoding': 'chunked' }
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ status: 500 }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
