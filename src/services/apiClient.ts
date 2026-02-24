import type { AuthUser } from "./authService";

type ChatResponse = {
  reply: string;
};

export async function askAssistant(prompt: string, user: AuthUser): Promise<string> {
  const token = await user.getToken();

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      prompt,
      email: user.email
    })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Something went wrong.");
  }

  const payload = (await response.json()) as ChatResponse;
  return payload.reply;
}
