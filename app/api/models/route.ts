import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Security: Only use server-side API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { status: 500, message: "GEMINI_API_KEY required" },
        { status: 500 }
      );
    }

    // Gemini models list endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      return NextResponse.json(
        { status: 500, message: "Failed to fetch models" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Filter for text generation models
    const models = data.models
      ?.filter((m: any) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        (m.name.includes("gemini-2.0") || m.name.includes("gemini-1.5"))
      )
      .map((m: any) => m.name.replace("models/", ""))
      .slice(0, 5) || ["gemini-2.0-flash", "gemini-1.5-flash"];

    return NextResponse.json(models);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 500 }, { status: 500 });
  }
}
