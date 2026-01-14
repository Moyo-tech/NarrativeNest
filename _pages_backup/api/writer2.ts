// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import type { TaskType } from '@/types/data';
import { TasksMap } from '@/types/data';

// Gemini API endpoint for streaming
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiMessage {
  role: string;
  parts: { text: string }[];
}

async function inference(messages: any[], apiKey: string, modelId: string, temperature: number) {
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
      maxOutputTokens: 500,
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { task, selection, before, after, messages, modelId, temperature } = req.body;

  console.log("TASK:", task, TasksMap)

  // Security: Only use server-side API key, never accept from client
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ status: 500, message: "GEMINI_API_KEY required" })
  }

  try {
    const stream = await inference(messages, apiKey, modelId, temperature);
    res.writeHead(200, { 'Transfer-Encoding': 'chunked' })
    const reader = stream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }

    res.end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500 })
  }
}
