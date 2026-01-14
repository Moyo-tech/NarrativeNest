// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import type { TaskType } from "@/types/data";

// Gemini API endpoint
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { task, selection, before, after } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ status: 500, message: "GEMINI_API_KEY not configured" });
    }

    const systemPrompts: Record<string, string> = {
      elaborate: `You are an expert screenwriting and story writing assistant, your task is to elaborate on the text I have highlighted, in order to facilitate a strong connection between the viewers and the characters.
      Please provide me with 2-3 different elaborations of the highlighted text.
      Make sure to use vivid sensory details, metaphors and similes to fully immerse the readers in the story.
      If the story is Nigerian based, please include relevant Nigerian cultural elements and context.`,

      rewrite: `You are an expert screenwriting and story writing assistant, your task is to help me refine a specific section of my text.
      I would like you to provide rewrite suggestions in order to improve the clarity, tone, and overall style of the selected text.
      Please provide me with 2-3 different rewrite suggestions.
      Aim to enhance the readability and impact of the text through your rewrites.`,

      dialoguesuggestion: `As a dialogue expert, your task is to help me bring my characters to life by generating engaging dialogue suggestions.
      I will provide you with a conversational dialogue or dialogue block from my script.:
      Based on the context of the script, please provide me with 2-3 different suggestions on how the dialogue could be rewritten to better engage the viewers.
      If relevant, please provide suggestions in Nigerian Pidgin, Yoruba, or Igbo, in addition to English.
      The suggestions should aim to enhance the character interactions and make the dialogue more impactful.`,

      dialoguetone: `As a dialogue and tone specialist, your task is to help me adjust the tone of a specific piece of dialogue to better match the scene's mood or the personalities of the characters involved.
      I will provide you with the dialogue I would like you to adjust, you would understand the context of the scene, story and character and provide me with 2-3 different tone adjustment suggestions for the given dialogue.
      If relevant to the story, please incorporate Nigerian cultural elements into your suggestions.`
    };

    const systemPrompt = systemPrompts[task as keyof typeof systemPrompts] || systemPrompts.elaborate;

    // Gemini API request format
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: selection }]
          }
        ],
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 1.0,
        }
      }),
    });

    const data = await response.json();
    console.log("Gemini Response:", data);

    // Transform Gemini response to match OpenAI format expected by frontend
    if (data.candidates && data.candidates[0]) {
      const content = data.candidates[0].content?.parts?.[0]?.text || "";
      return res.json({
        message: {
          role: "assistant",
          content: content
        }
      });
    } else {
      console.error("Unexpected Gemini response:", data);
      return res.status(500).json({ status: 500, message: "Invalid response from Gemini" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500 });
  }
}
