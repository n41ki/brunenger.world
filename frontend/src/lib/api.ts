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
export const getMyProfile = () => api.get("/users/me/profile");
export const updatePoints = (userId: string, points: number) =>
  api.post("/users/points", { userId, points });

// ─── Admin ─────────────────────────────────────────────────────────────────
function adminApi(key: string) {
  return axios.create({
    baseURL: `${BACKEND_URL}/api/admin`,
    headers: { "x-admin-key": key },
  });
}

export const adminGetStats     = (key: string) => adminApi(key).get("/stats");
export const adminGetItems     = (key: string) => adminApi(key).get("/items");
export const adminCreateItem   = (key: string, data: object) => adminApi(key).post("/items", data);
export const adminUpdateItem   = (key: string, id: string, data: object) => adminApi(key).put(`/items/${id}`, data);
export const adminDeleteItem   = (key: string, id: string) => adminApi(key).delete(`/items/${id}`);
export const adminGetGiveaways = (key: string) => adminApi(key).get("/giveaways");
export const adminCreateGiveaway = (key: string, data: object) => adminApi(key).post("/giveaways", data);
export const adminDrawWinner   = (key: string, id: string) => adminApi(key).post(`/giveaways/${id}/draw`);
export const adminDeleteGiveaway = (key: string, id: string) => adminApi(key).delete(`/giveaways/${id}`);

export default api;
