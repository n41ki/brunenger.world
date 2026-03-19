"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getShopItems, redeemItem } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/auth";
import { Zap, ShoppingBag, Check, X } from "lucide-react";
import LightningIcon from "@/components/ui/LightningIcon";

interface ShopItem { id: string; nombre: string; imagen: string; costo_puntos: number; descripcion?: string; disponible: boolean }
interface User { puntos: number }
type Toast = { message: string; type: "success" | "error" } | null;

export default function ShopPage() {
  const [items, setItems]     = useState<ShopItem[]>([]);
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast, setToast]     = useState<Toast>(null);

  useEffect(() => {
    Promise.all([getShopItems(), fetchCurrentUser()])
      .then(([s, u]) => { setItems(s.data); setUser(u); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRedeem = async (item: ShopItem) => {
    if (!user || user.puntos < item.costo_puntos) { showToast("Puntos insuficientes", "error"); return; }
    setRedeeming(item.id);
    try {
      await redeemItem(item.id);
      setUser((u) => u ? { ...u, puntos: u.puntos - item.costo_puntos } : u);
      showToast(`¡"${item.nombre}" canjeado!`, "success");
    } catch (e: unknown) {
      showToast((e as {response?: {data?: {error?: string}}})?.response?.data?.error || "Error al canjear", "error");
    } finally { setRedeeming(null); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display text-4xl tracking-widest text-white mb-1">TIENDA</h1>
          <p className="font-body text-sm text-[#555]">Canjea puntos por recompensas exclusivas</p>
        </div>
        {user && (
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[#1C1C1C] border border-white/6">
            <div className="lightning-glow"><LightningIcon size={16} /></div>
            <span className="font-display text-xl tracking-widest text-[#FF6B00]">{user.puntos.toLocaleString()}</span>
            <span className="text-xs font-body text-[#444]">pts</span>
          </div>
        )}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-[#111] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#333]">
          <ShoppingBag size={40} />
          <p className="font-display text-2xl tracking-widest">SIN ITEMS</p>
          <p className="font-body text-sm">Próximamente habrá recompensas disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, i) => {
            const canAfford = (user?.puntos || 0) >= item.costo_puntos;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`group rounded-2xl border bg-[#111] overflow-hidden transition-all duration-300
                  ${item.disponible
                    ? "border-white/6 hover:border-[#FF6B00]/30 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,107,0,0.12)]"
                    : "border-white/4 opacity-50"
                  }`}
              >
                {/* Image */}
                <div className="relative h-40 bg-[#161616] overflow-hidden">
                  {item.imagen ? (
                    <Image src={item.imagen} alt={item.nombre} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ShoppingBag size={32} className="text-[#2a2a2a]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                </div>

                <div className="p-4">
                  <h3 className="font-body font-semibold text-sm text-white mb-1 truncate">{item.nombre}</h3>
                  {item.descripcion && (
                    <p className="text-xs font-body text-[#444] mb-3 line-clamp-2">{item.descripcion}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap size={12} className="text-[#FF6B00]" />
                      <span className="font-display text-sm tracking-widest text-[#FF6B00]">{item.costo_puntos.toLocaleString()}</span>
                    </div>
                    <motion.button
                      onClick={() => handleRedeem(item)}
                      disabled={!item.disponible || redeeming === item.id || !canAfford}
                      className={`px-3 py-1.5 rounded-lg text-xs font-body font-semibold transition-all ${
                        !item.disponible || !canAfford
                          ? "bg-white/5 text-[#333] cursor-not-allowed"
                          : "btn-primary"
                      }`}
                      whileTap={{ scale: 0.95 }}
                    >
                      {redeeming === item.id ? "..." : "Canjear"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            className={`fixed bottom-8 left-1/2 flex items-center gap-3 px-5 py-3 rounded-xl border font-body font-medium text-sm z-50 ${
              toast.type === "success"
                ? "bg-[#111] border-[#FF6B00]/40 text-[#FF6B00]"
                : "bg-[#111] border-red-500/40 text-red-400"
            }`}
          >
            {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
