export interface TutorInput {
  question: string;
  language: "en" | "hi" | "gu";
  teachingMode: "beginner" | "intermediate" | "advanced" | "step-by-step";
}

const languageNames = { en: "English", hi: "Hindi", gu: "Gujarati" } as const;

export async function getTutorResponse(input: TutorInput): Promise<{ content: string; provider: "gemini" | "unavailable" }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      provider: "unavailable",
      content: `Live AI responses are not available because GEMINI_API_KEY is not configured. Your question was received in ${languageNames[input.language]}, but no AI provider answer is being simulated.`,
    };
  }

  const configuredModel = process.env.GEMINI_MODEL ?? "gemini-3.5-flash";
  const models = [...new Set([configuredModel, "gemini-3.5-flash-lite", "gemini-flash-lite-latest"])];

  for (const model of models) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are EduVaani, a student-first tutor. Respond only in ${languageNames[input.language]}. Teaching level: ${input.teachingMode}.

Format every answer for a student:
- Start with a short plain-language summary.
- Use clear Markdown headings (##) for major sections.
- Use short bullets or numbered lists.
- Use a Markdown table only when a table genuinely compares or organizes data.
- Put code in fenced code blocks with the language name.
- Keep paragraphs short and remove decorative separators such as repeated "---".
- Include one practical example and a short final recap.
- Never invent citations or sources.
- State uncertainty clearly instead of guessing.` }],
          },
          contents: [{ role: "user", parts: [{ text: input.question }] }],
        }),
      },
    );

    if (response.ok) {
      const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
      const content = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n").trim();
      if (content) return { provider: "gemini", content };
    } else {
      const message = await response.text();
      console.error("Gemini provider error", model, response.status, message.slice(0, 500));
    }
  }

  return { provider: "unavailable", content: "The AI provider could not answer this question right now. Please try again shortly." };
}
