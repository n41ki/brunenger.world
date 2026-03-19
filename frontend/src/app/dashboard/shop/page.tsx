"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getShopItems, redeemItem } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/auth";
import { Zap, ShoppingBag, Check, X } from "lucide-react";
import LightningIcon from "@/components/ui/LightningIcon";

interface Item { id: string; nombre: string; imagen: string; costo_puntos: number; descripcion?: string; disponible: boolean }
interface User { puntos: number }
type Toast = { msg: string; ok: boolean } | null;

export default function ShopPage() {
  const [items,     setItems]     = useState<Item[]>([]);
  const [user,      setUser]      = useState<User | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast,     setToast]     = useState<Toast>(null);

  useEffect(() => {
    Promise.all([getShopItems(), fetchCurrentUser()])
      .then(([s, u]) => { setItems(s.data); setUser(u); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const notify = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const redeem = async (item: Item) => {
    if (!user || user.puntos < item.costo_puntos) { notify("Puntos insuficientes", false); return; }
    setRedeeming(item.id);
    try {
      await redeemItem(item.id);
      setUser(u => u ? { ...u, puntos: u.puntos - item.costo_puntos } : u);
      notify(`"${item.nombre}" canjeado`, true);
    } catch (e: unknown) {
      notify((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Error al canjear", false);
    } finally { setRedeeming(null); }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8">
        <div>
          <div className="label mb-1">Recompensas</div>
          <h1 className="display text-[36px] tracking-widest text-white">TIENDA</h1>
        </div>
        {user && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl card">
            <span className="bolt"><LightningIcon size={14} /></span>
            <span className="display text-[20px] tracking-widest accent">{user.puntos.toLocaleString()}</span>
            <span className="text-[11px] text-[#444]">pts</span>
          </div>
        )}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl bg-[#111] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-4 text-[#2A2A2A]">
          <ShoppingBag size={36} />
          <p className="display text-[20px] tracking-widest">SIN ITEMS</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((item, i) => {
            const can = (user?.puntos || 0) >= item.costo_puntos && item.disponible;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`card overflow-hidden ${!item.disponible ? "opacity-40" : ""}`}>
                <div className="relative h-36 bg-[#161616]">
                  {item.imagen
                    ? <Image src={item.imagen} alt={item.nombre} fill className="object-cover" />
                    : <div className="flex items-center justify-center h-full"><ShoppingBag size={24} className="text-[#2A2A2A]" /></div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-[13px] text-white truncate mb-1">{item.nombre}</p>
                  {item.descripcion && <p className="text-[11px] text-[#444] mb-3 line-clamp-2">{item.descripcion}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Zap size={11} className="accent" />
                      <span className="display text-[13px] tracking-wide accent">{item.costo_puntos.toLocaleString()}</span>
                    </div>
                    <button onClick={() => redeem(item)} disabled={!can || redeeming === item.id}
                      className={`btn text-[11px] px-3 py-1.5 ${can ? "btn-orange" : "btn-outline"}`}
                      style={{ opacity: can ? 1 : 0.4 }}>
                      {redeeming === item.id ? "..." : "Canjear"}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 12, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 12, x: "-50%" }}
            className={`fixed bottom-8 left-1/2 flex items-center gap-2.5 px-5 py-3 rounded-xl text-[13px] font-medium z-50 card`}
            style={{ borderColor: toast.ok ? "rgba(249,115,22,0.3)" : "rgba(239,68,68,0.3)" }}>
            {toast.ok ? <Check size={14} className="accent" /> : <X size={14} className="text-red-400" />}
            <span className={toast.ok ? "accent" : "text-red-400"}>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
