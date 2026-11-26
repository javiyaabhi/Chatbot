import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTutorResponse } from "./ai.js";

const fetchMock = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

function requestPrompt() {
  const request = fetchMock.mock.calls[0]?.[1];
  const body = JSON.parse(String(request?.body)) as {
    systemInstruction: { parts: Array<{ text: string }> };
  };
  return body.systemInstruction.parts[0]?.text ?? "";
}

describe("getTutorResponse learning modes", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.stubEnv("GEMINI_MODEL", "test-model");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: "A clear answer." }] } }],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("limits specialized answers to the selected subject", async () => {
    const result = await getTutorResponse({
      question: "Explain derivatives.",
      language: "en",
      teachingMode: "beginner",
      learningMode: "specialized",
      subject: "Mathematics",
    });

    expect(result.provider).toBe("gemini");
    expect(requestPrompt()).toContain('The selected subject is "Mathematics"');
    expect(requestPrompt()).toContain("Answer only questions that are clearly related to this subject");
    expect(requestPrompt()).toContain("do not answer it");
  });

  it("allows questions across subjects in regular mode", async () => {
    await getTutorResponse({
      question: "Explain photosynthesis.",
      language: "en",
      teachingMode: "beginner",
      learningMode: "regular",
      subject: "General",
    });

    expect(requestPrompt()).toContain("Answer questions across subjects");
    expect(requestPrompt()).not.toContain("do not answer it");
  });
});
