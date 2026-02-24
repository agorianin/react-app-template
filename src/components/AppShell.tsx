import { FormEvent, useEffect, useMemo, useState } from "react";
import { askAssistant } from "../services/apiClient";
import { sendTestEmail } from "../services/mailService";
import {
  login,
  register,
  loginWithGoogle,
  logout,
  observeAuthState,
  sendVerificationLink,
  UnverifiedEmailError,
  type AuthUser
} from "../services/authService";
import type { ChatMessage } from "../types/chat";
import { AuthModal } from "./AuthModal";

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

const starterMessages: ChatMessage[] = [
  {
    id: createId(),
    role: "assistant",
    content: "Hi! Ask me anything. Please sign in first to send a message."
  }
];

export function AppShell() {
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [verifySending, setVerifySending] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [verifyDisplayName, setVerifyDisplayName] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<string | null>(null);
  const [mailTestLoading, setMailTestLoading] = useState(false);
  const [mailTestStatus, setMailTestStatus] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => observeAuthState(setUser), []);

  const statusLabel = useMemo(() => {
    if (isLoading) {
      return "Assistant is thinking...";
    }
    return user ? `Signed in as ${user.email}` : "Signed out";
  }, [isLoading, user]);

  const onLoginSubmit = async (email: string, password: string) => {
    if (!email || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    setAuthError(null);
    setVerifyStatus(null);
    setAuthLoading(true);
    try {
      await login(email, password);
      setVerifyEmail(null);
      setVerifyDisplayName(null);
      setAuthOpen(false);
    } catch (error) {
      if (error instanceof UnverifiedEmailError) {
        setVerifyEmail(error.email);
        setVerifyDisplayName(error.displayName);
        setAuthError("Email is not verified. Send a verification link and verify before login.");
      } else {
        const message = error instanceof Error ? error.message : "Unable to sign in.";
        setAuthError(message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const onRegisterSubmit = async (email: string, password: string, displayName: string) => {
    if (!email || !password || !displayName.trim()) {
      setAuthError("Email, password and display name are required.");
      return;
    }

    setAuthError(null);
    setVerifyStatus(null);
    setAuthLoading(true);
    try {
      await register(email, password, displayName);
    } catch (error) {
      if (error instanceof UnverifiedEmailError) {
        setVerifyEmail(error.email);
        setVerifyDisplayName(error.displayName ?? displayName.trim());
        setAuthError("Account created. Verify your email before signing in.");
      } else {
        const message = error instanceof Error ? error.message : "Unable to create account.";
        setAuthError(message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    setAuthError(null);
    setVerifyStatus(null);
    setAuthLoading(true);
    try {
      await loginWithGoogle();
      setVerifyEmail(null);
      setVerifyDisplayName(null);
      setAuthOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in with Google.";
      setAuthError(message);
    } finally {
      setAuthLoading(false);
    }
  };

  const onSendVerificationLink = async () => {
    if (!verifyEmail) {
      return;
    }

    setVerifyStatus(null);
    setVerifySending(true);
    try {
      await sendVerificationLink(verifyEmail, verifyDisplayName);
      setVerifyStatus(`Verification link sent to ${verifyEmail}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send verification email.";
      setVerifyStatus(message);
    } finally {
      setVerifySending(false);
    }
  };

  const onPromptSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = prompt.trim();
    if (!text || isLoading) {
      return;
    }

    if (!user) {
      setAuthOpen(true);
      return;
    }

    const userMessage: ChatMessage = { id: createId(), role: "user", content: text };
    setMessages((previous) => [...previous, userMessage]);
    setPrompt("");
    setIsLoading(true);

    try {
      const reply = await askAssistant(text, user);
      const assistantMessage: ChatMessage = { id: createId(), role: "assistant", content: reply };
      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to get response.";
      setMessages((previous) => [
        ...previous,
        { id: createId(), role: "assistant", content: `Error: ${message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSendTestEmail = async () => {
    if (!user) {
      setAuthOpen(true);
      setMailTestStatus("Sign in first to send a test email.");
      return;
    }

    setMailTestStatus(null);
    setMailTestLoading(true);
    try {
      await sendTestEmail(user.email);
      setMailTestStatus(`Test email sent to ${user.email}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send test email.";
      setMailTestStatus(message);
    } finally {
      setMailTestLoading(false);
    }
  };

  const handleLogout = () => {
    void logout();
  };

  const handleCloseAuth = () => {
    setAuthOpen(false);
    setAuthError(null);
    setVerifyEmail(null);
    setVerifyStatus(null);
    setVerifyDisplayName(null);
  };

  return (
    <div className="page">
      <aside className="sidebar">
        <h1>ChatGPT Mimic</h1>
        <p className="muted">
          React front-end + backend `/api` proxy. API keys stay only on the server.
        </p>
        {user ? (
          <button type="button" className="ghost-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <button type="button" className="primary-button" onClick={() => setAuthOpen(true)}>
            Sign in
          </button>
        )}
        <button type="button" className="ghost-button" onClick={onSendTestEmail} disabled={mailTestLoading}>
          {mailTestLoading ? "Sending test email..." : "Send test email"}
        </button>
        {mailTestStatus ? <p className="muted">{mailTestStatus}</p> : null}
        <p className="muted">
          Notice that before first Sign In - you need to configure firebase in /src/services/firebase.ts
        </p>
        <p className="muted">
          If you want for app to query the AI for real add your ChatGPT key as environment variable OPENAI_API_KEY="key" in Docker or npm dev:server
        </p>
        <p className="muted">
          In order to send mail you need to configure next environment variables: SMTP_HOST,
          SMTP_PORT,
          SMTP_USER,
          SMTP_PASS,
          SMTP_FROM,
          SMTP_SECURE,
        </p>
      </aside>

      <main className="chat-panel">
        <header className="chat-header">
          <span>{statusLabel}</span>
        </header>

        <section className="messages" aria-live="polite">
          {messages.map((message) => (
            <article key={message.id} className={`message ${message.role}`}>
              <span>{message.content}</span>
            </article>
          ))}
        </section>

        <form className="composer" onSubmit={onPromptSubmit}>
          <input
            type="text"
            placeholder="Message ChatGPT mimic..."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            disabled={isLoading}
          />
          <button type="submit" className="primary-button" disabled={isLoading}>
            Send
          </button>
        </form>
      </main>

      <AuthModal
        isOpen={authOpen}
        isSubmitting={authLoading}
        isSendingVerification={verifySending}
        error={authError}
        verificationEmail={verifyEmail}
        verificationStatus={verifyStatus}
        onSignInSubmit={onLoginSubmit}
        onSignUpSubmit={onRegisterSubmit}
        onGoogleLogin={onGoogleLogin}
        onSendVerificationLink={onSendVerificationLink}
        onClose={handleCloseAuth}
      />
    </div>
  );
}
