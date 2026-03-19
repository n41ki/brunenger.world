import axios from "axios";
import { getAuthToken } from "./auth";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const api = axios.create({ baseURL: `${BACKEND_URL}/api` });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Rankings ──────────────────────────────────────────────────────────────
export const getRankings = () => api.get("/rankings");

// ─── Shop ──────────────────────────────────────────────────────────────────
export const getShopItems = () => api.get("/shop");
export const redeemItem = (itemId: string) => api.post("/shop/redeem", { itemId });

// ─── Giveaways ─────────────────────────────────────────────────────────────
export const getGiveaways = () => api.get("/giveaways");
export const joinGiveaway = (giveawayId: string) => api.post(`/giveaways/${giveawayId}/join`);

// ─── Stream ────────────────────────────────────────────────────────────────
export const getStreamStatus = () => api.get("/stream/status");

// ─── User ──────────────────────────────────────────────────────────────────
export const getUserProfile = () => api.get("/users/me");
export const updatePoints = (userId: string, points: number) =>
  api.post("/users/points", { userId, points });

export default api;
