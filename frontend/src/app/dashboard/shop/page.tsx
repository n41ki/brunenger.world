"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { getShopItems, redeemItem } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/auth";
import { Zap, ShoppingBag, Check, X, Search } from "lucide-react";

interface Item { id: string; nombre: string; imagen: string; costo_puntos: number; descripcion?: string; categoria?: string; disponible: boolean }
interface User { puntos: number }
type Toast = { msg: string; ok: boolean } | null;

export default function ShopPage() {
  const [items,     setItems]     = useState<Item[]>([]);
  const [filtered,  setFiltered]  = useState<Item[]>([]);
  const [user,      setUser]      = useState<User | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [toast,     setToast]     = useState<Toast>(null);
  const [search,    setSearch]    = useState("");
  const [sort,      setSort]      = useState<"asc"|"desc">("asc");

  useEffect(() => {
    Promise.all([getShopItems(), fetchCurrentUser()])
      .then(([s, u]) => { setItems(s.data); setFiltered(s.data); setUser(u); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let res = items.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));
    res = res.sort((a, b) => sort === "asc" ? a.costo_puntos - b.costo_puntos : b.costo_puntos - a.costo_puntos);
    setFiltered(res);
  }, [search, sort, items]);

  const notify = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const redeem = async (item: Item) => {
    if (!user || user.puntos < item.costo_puntos) { notify("No tienes suficientes puntos", false); return; }
    setRedeeming(item.id);
    try {
      await redeemItem(item.id);
      setUser(u => u ? { ...u, puntos: u.puntos - item.costo_puntos } : u);
      notify(`"${item.nombre}" canjeado exitosamente`, true);
    } catch (e: unknown) {
      notify((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Error al canjear", false);
    } finally { setRedeeming(null); }
  };

  const pts = user?.puntos || 0;

  return (
    <div style={{ padding: "32px 28px", maxWidth: "1100px" }}>

      {/* Header */}
      <motion.div className="anim-0" style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <p className="label" style={{ marginBottom: "6px" }}>Recompensas</p>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif", fontWeight: 900,
              fontSize: "36px", lineHeight: 1.1, color: "#fff"
            }}>Tienda</h1>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "14px 20px", borderRadius: "14px",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          }}>
            <Zap size={18} style={{ color: "#fff" }} />
            <div>
              <p className="label" style={{ fontSize: "10px", marginBottom: "2px", color: "var(--t3)" }}>TUS PUNTOS</p>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "24px", color: "#fff", lineHeight: 1 }}>
                {pts.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div className="anim-1" style={{
        display: "flex", gap: "10px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--t4)" }} />
          <input
            className="input" placeholder="Buscar item..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: "36px" }}
          />
        </div>
        <div className="tabs" style={{ width: "auto", flexShrink: 0 }}>
          <button className={`tab${sort === "asc" ? " active" : ""}`} onClick={() => setSort("asc")}>
            Menor precio
          </button>
          <button className={`tab${sort === "desc" ? " active" : ""}`} onClick={() => setSort("desc")}>
            Mayor precio
          </button>
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "16px" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ height: "280px", borderRadius: "18px", background: "var(--bg2)", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--t4)" }}>
          <ShoppingBag size={40} style={{ margin: "0 auto 16px" }} />
          <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "20px" }}>
            {items.length === 0 ? "Sin items" : "Sin resultados"}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "16px" }}>
          {filtered.map((item, i) => {
            const canAfford = pts >= item.costo_puntos && item.disponible;
            return (
              <motion.div
                key={item.id}
                className={`item-card${!canAfford ? " no-points" : ""}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div style={{ position: "relative", height: "160px", background: "var(--bg2)", overflow: "hidden" }}>
                  {item.imagen
                    ? <Image src={item.imagen} alt={item.nombre} fill style={{ objectFit: "cover" }} />
                    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <ShoppingBag size={28} style={{ color: "var(--t4)" }} />
                      </div>
                  }
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, var(--bg1) 0%, transparent 55%)" }} />
                  {!canAfford && item.disponible && (
                    <div style={{
                      position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)"
                    }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--t2)", letterSpacing: "0.1em" }}>PUNTOS INSUFICIENTES</span>
                    </div>
                  )}
                  {!item.disponible && (
                    <div style={{
                      position: "absolute", top: "10px", right: "10px",
                      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
                      border: "1px solid var(--border2)",
                      padding: "3px 10px", borderRadius: "6px",
                      fontSize: "10px", fontWeight: 700, color: "var(--t3)", letterSpacing: "0.1em"
                    }}>
                      AGOTADO
                    </div>
                  )}
                </div>

                <div style={{ padding: "16px" }}>
                  <p style={{ fontWeight: 600, fontSize: "13px", color: "var(--t1)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.nombre}
                  </p>
                  {item.descripcion && (
                    <p style={{ fontSize: "11px", color: "var(--t3)", marginBottom: "14px", lineHeight: 1.5,
                      overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                      {item.descripcion}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: item.descripcion ? 0 : "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Zap size={12} style={{ color: "#fff" }} />
                      <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "15px", color: "#fff" }}>
                        {item.costo_puntos.toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => redeem(item)}
                      disabled={!canAfford || redeeming === item.id}
                      className={`btn btn-sm ${canAfford ? "btn-primary" : "btn-ghost"}`}
                    >
                      {redeeming === item.id
                        ? <div style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                        : "Canjear"}
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
          <motion.div
            initial={{ opacity: 0, y: 16, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 16, x: "-50%" }}
            className={`toast ${toast.ok ? "toast-success" : "toast-error"}`}
            style={{ position: "fixed", bottom: "28px", left: "50%", zIndex: 100 }}
          >
            {toast.ok ? <Check size={15} /> : <X size={15} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
