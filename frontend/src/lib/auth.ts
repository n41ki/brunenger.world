import Cookies from "js-cookie";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const KICK_CLIENT_ID = process.env.NEXT_PUBLIC_KICK_CLIENT_ID || "01KM3MJ0VFDX1762BKS18S3CR5";
const KICK_REDIRECT_URI = process.env.NEXT_PUBLIC_KICK_REDIRECT_URI || "http://localhost:3000/auth/callback";

// ─── PKCE helpers ────────────────────────────────────────────────────────────

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => chars[b % chars.length]).join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// ─── Auth URL ────────────────────────────────────────────────────────────────

export async function getKickAuthUrl(): Promise<string> {
  const codeVerifier = generateRandomString(64);
  const state = generateRandomString(16);

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(hashed);

  sessionStorage.setItem("kick_code_verifier", codeVerifier);
  sessionStorage.setItem("kick_oauth_state", state);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: KICK_CLIENT_ID,
    redirect_uri: KICK_REDIRECT_URI,
    scope: "user:read channel:read",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  // Kick OAuth 2.0 PKCE - Authorization endpoint
  return `https://id.kick.com/oauth/authorize?${params.toString()}`;
}

// ─── Token management ────────────────────────────────────────────────────────

export function setAuthToken(token: string): void {
  Cookies.set("auth_token", token, { expires: 7, secure: true, sameSite: "strict" });
}

export function getAuthToken(): string | undefined {
  return Cookies.get("auth_token");
}

export function removeAuthToken(): void {
  Cookies.remove("auth_token");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export async function fetchCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const res = await axios.get(`${BACKEND_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch {
    removeAuthToken();
    return null;
  }
}

export async function logout(): Promise<void> {
  removeAuthToken();
  if (typeof window !== "undefined") window.location.href = "/";
}
