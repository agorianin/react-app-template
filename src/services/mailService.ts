export async function sendTestEmail(email: string, displayName?: string | null): Promise<void> {
  const response = await fetch("/api/mail/send-test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, displayName })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to send test email.");
  }
}
