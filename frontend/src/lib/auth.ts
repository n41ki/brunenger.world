import Cookies from "js-cookie";
import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const KICK_CLIENT_ID = process.env.NEXT_PUBLIC_KICK_CLIENT_ID || "01KM3MJ0VFDX1762BKS18S3CR5";
const KICK_REDIRECT_URI = process.env.NEXT_PUBLIC_KICK_REDIRECT_URI || "http://localhost:3000/auth/callback";

export function getKickAuthUrl(): string {
  const state = Math.random().toString(36).substring(2, 15);
  if (typeof window !== "undefined") {
    sessionStorage.setItem("kick_oauth_state", state);
  }

  const params = new URLSearchParams({
    response_type: "code",
    client_id: KICK_CLIENT_ID,
    redirect_uri: KICK_REDIRECT_URI,
    scope: "user:read channel:read",
    state,
  });

  return `https://id.kick.com/oauth/authorize?${params.toString()}`;
}

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
  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}
