import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth } from "./firebase";

export type AuthUser = {
  email: string;
  getToken: () => Promise<string>;
};

export class UnverifiedEmailError extends Error {
  email: string;
  displayName: string | null;

  constructor(email: string, displayName: string | null = null) {
    super("Email is not verified.");
    this.name = "UnverifiedEmailError";
    this.email = email;
    this.displayName = displayName;
  }
}

function toAuthUser(user: User): AuthUser {
  return {
    email: user.email ?? "unknown@firebase.local",
    getToken: () => user.getIdToken()
  };
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw new UnverifiedEmailError(credential.user.email ?? email, credential.user.displayName ?? null);
  }
  return toAuthUser(credential.user);
}

export async function register(email: string, password: string, displayName?: string): Promise<never> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const safeDisplayName = displayName?.trim();
  if (safeDisplayName) {
    await updateProfile(credential.user, { displayName: safeDisplayName });
  }
  await signOut(auth);
  throw new UnverifiedEmailError(credential.user.email ?? email, safeDisplayName ?? null);
}

export async function loginWithGoogle(): Promise<AuthUser> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return toAuthUser(credential.user);
}

export function observeAuthState(onChange: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    onChange(user ? toAuthUser(user) : null);
  });
}

export async function logout() {
  await signOut(auth);
}

export async function sendVerificationLink(email: string, displayName?: string | null): Promise<void> {
  const response = await fetch("/api/auth/send-verification-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, displayName })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Failed to send verification email.");
  }
}
