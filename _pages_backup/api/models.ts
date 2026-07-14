// Returns available Gemini models
export default async function handler(req: any, res: any) {
  try {
    // Security: Only use server-side API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ status: 500, message: "GEMINI_API_KEY required" });
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
      return res.status(500).json({ status: 500, message: "Failed to fetch models" });
    }

    const data = await response.json();

    // Filter for text generation models
    const models = data.models
      ?.filter((m: any) =>
        m.supportedGenerationMethods?.includes("generateContent") &&
        (m.name.includes("gemini-3.1-flash-lite") || m.name.includes("gemini-3.1-flash-lite"))
      )
      .map((m: any) => m.name.replace("models/", ""))
      .slice(0, 5) || ["gemini-3.1-flash-lite", "gemini-3.1-flash-lite"];

    return res.status(200).json(models);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500 });
  }
}
