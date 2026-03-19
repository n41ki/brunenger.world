"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getShopItems, redeemItem } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/auth";
import { Zap, ShoppingBag, CheckCircle, XCircle } from "lucide-react";

interface ShopItem {
  id: string;
  nombre: string;
  imagen: string;
  costo_puntos: number;
  descripcion?: string;
  categoria?: string;
  disponible: boolean;
}

interface User { puntos: number; username: string }

type ToastType = { message: string; type: "success" | "error" } | null;

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastType>(null);

  useEffect(() => {
    Promise.all([getShopItems(), fetchCurrentUser()])
      .then(([shopRes, userData]) => {
        setItems(shopRes.data);
        setUser(userData);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRedeem = async (item: ShopItem) => {
    if (!user || user.puntos < item.costo_puntos) {
      showToast("No tienes suficientes puntos", "error");
      return;
    }
    setRedeeming(item.id);
    try {
      await redeemItem(item.id);
      setUser((u) => u ? { ...u, puntos: u.puntos - item.costo_puntos } : u);
      showToast(`¡Canjeaste "${item.nombre}" exitosamente!`, "success");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Error al canjear";
      showToast(msg, "error");
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="font-orbitron font-black text-3xl sm:text-4xl text-white mb-2">
            <span className="text-gradient-blue-yellow">TIENDA</span>
          </h1>
          <p className="text-white/50 font-rajdhani text-lg">Canjea tus puntos por recompensas exclusivas</p>
        </div>
        {user && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <Zap size={18} className="text-yellow-400" />
            <span className="font-orbitron font-black text-xl text-yellow-400">{user.puntos.toLocaleString()}</span>
            <span className="text-white/40 text-sm">pts</span>
          </div>
        )}
      </motion.div>

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 h-72 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-white/40"
        >
          <ShoppingBag size={48} />
          <p className="font-orbitron text-xl">La tienda está vacía</p>
          <p className="font-rajdhani">Próximamente habrá items disponibles</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`group relative rounded-xl border border-blue-500/20 bg-gradient-to-b from-[#0d0d1a] to-[#050508] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50 hover:shadow-[0_20px_40px_rgba(0,102,255,0.25)] ${!item.disponible ? "opacity-50" : ""}`}
            >
              {/* Item image */}
              <div className="relative h-44 bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
                {item.imagen ? (
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingBag size={48} className="text-white/20" />
                  </div>
                )}
                {/* Glow overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent" />
                {!item.disponible && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="font-orbitron font-bold text-white/60 text-sm">AGOTADO</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-orbitron font-bold text-white text-sm mb-1 truncate">{item.nombre}</h3>
                {item.descripcion && (
                  <p className="text-white/40 text-xs font-rajdhani mb-3 line-clamp-2">{item.descripcion}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="font-orbitron font-black text-yellow-400 text-sm">{item.costo_puntos.toLocaleString()}</span>
                    <span className="text-white/30 text-xs">pts</span>
                  </div>
                  <motion.button
                    onClick={() => handleRedeem(item)}
                    disabled={!item.disponible || redeeming === item.id || (user?.puntos || 0) < item.costo_puntos}
                    className={`px-3 py-1.5 rounded-lg text-xs font-orbitron font-bold transition-all ${
                      !item.disponible || (user?.puntos || 0) < item.costo_puntos
                        ? "bg-white/10 text-white/30 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_15px_rgba(0,102,255,0.5)]"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {redeeming === item.id ? "..." : "CANJEAR"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className={`fixed bottom-8 left-1/2 flex items-center gap-3 px-6 py-3 rounded-xl border font-semibold z-50 ${
              toast.type === "success"
                ? "bg-green-500/20 border-green-500/50 text-green-400"
                : "bg-red-500/20 border-red-500/50 text-red-400"
            }`}
          >
            {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
