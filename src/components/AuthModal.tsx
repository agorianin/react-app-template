import { FormEvent, useState } from "react";

type AuthModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  isSendingVerification: boolean;
  error: string | null;
  verificationEmail: string | null;
  verificationStatus: string | null;
  onSignInSubmit: (email: string, password: string) => Promise<void>;
  onSignUpSubmit: (email: string, password: string, displayName: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
  onSendVerificationLink: () => Promise<void>;
  onClose: () => void;
};

export function AuthModal({
  isOpen,
  isSubmitting,
  isSendingVerification,
  error,
  verificationEmail,
  verificationStatus,
  onSignInSubmit,
  onSignUpSubmit,
  onGoogleLogin,
  onSendVerificationLink,
  onClose
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "signin") {
      await onSignInSubmit(email.trim(), password);
      return;
    }

    await onSignUpSubmit(email.trim(), password, displayName.trim());
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      <div className="modal">
        <div className="modal-header">
          <h2 id="auth-title">{mode === "signin" ? "Welcome back" : "Create account"}</h2>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="modal-form">
          <button
            type="button"
            className={mode === "signin" ? "select-button" : "ghost-button"}
            onClick={() => setMode("signin")}
            disabled={isSubmitting || isSendingVerification}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === "signup" ? "select-button" : "ghost-button"}
            onClick={() => setMode("signup")}
            disabled={isSubmitting || isSendingVerification}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Type any password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {mode === "signup" ? (
            <label>
              Display Name
              <input
                type="text"
                placeholder="John Doe"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
              />
            </label>
          ) : null}

          {error ? <p className="error">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <button type="button" className="ghost-button" onClick={onGoogleLogin} disabled={isSubmitting}>
            Continue with Google
          </button>

          {verificationEmail ? (
            <button
              type="button"
              className="ghost-button"
              onClick={onSendVerificationLink}
              disabled={isSendingVerification || isSubmitting}
            >
              {isSendingVerification ? "Sending verify link..." : "Send verify email link"}
            </button>
          ) : null}

          {verificationStatus ? <p className="muted">{verificationStatus}</p> : null}
        </form>
      </div>
    </div>
  );
}
