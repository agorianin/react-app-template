import process from "process";

type OpenAIResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function getAiReply(prompt: string, email: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!apiKey) {
    return `Mock response: "${prompt}" (signed in as ${email}). Set OPENAI_API_KEY to use a real model.`;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You are a concise assistant in a ChatGPT-like demo app."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error("AI provider request failed.");
  }

  const payload = (await response.json()) as OpenAIResponse;
  const reply = payload.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    throw new Error("AI provider returned an empty answer.");
  }

  return reply;
}
