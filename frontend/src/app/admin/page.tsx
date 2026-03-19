"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  adminGetItems, adminCreateItem, adminDeleteItem, adminUpdateItem,
  adminGetGiveaways, adminCreateGiveaway, adminDeleteGiveaway, adminDrawWinner,
  adminGetStats,
} from "@/lib/api";
import { Plus, Trash2, Edit2, Check, X, Zap, Gift, ShoppingBag, Users, ArrowLeft, Trophy } from "lucide-react";

interface Item { id: string; nombre: string; descripcion?: string; imagen?: string; costo_puntos: number; categoria?: string; disponible: boolean }
interface Giveaway { id: string; premio: string; descripcion?: string; imagen?: string; estado: string }
interface Stats { users: number; items: number; giveaways: number; redemptions: number }
type Tab = "items" | "giveaways"
type Toast = { msg: string; ok: boolean } | null

const ADMIN_KEY_LS = "bw-admin-key";

export default function AdminPage() {
  const [key,        setKey]       = useState("");
  const [keyInput,   setKeyInput]  = useState("");
  const [authed,     setAuthed]    = useState(false);
  const [tab,        setTab]       = useState<Tab>("items");
  const [items,      setItems]     = useState<Item[]>([]);
  const [giveaways,  setGiveaways] = useState<Giveaway[]>([]);
  const [stats,      setStats]     = useState<Stats | null>(null);
  const [toast,      setToast]     = useState<Toast>(null);
  const [loading,    setLoading]   = useState(false);
  const [editItem,   setEditItem]  = useState<Item | null>(null);

  // Item form state
  const [form, setForm] = useState({ nombre: "", descripcion: "", imagen: "", costo_puntos: "", categoria: "" });
  // Giveaway form state
  const [gForm, setGForm] = useState({ premio: "", descripcion: "", imagen: "" });

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_KEY_LS);
    if (saved) { setKey(saved); setAuthed(true); }
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed]); // eslint-disable-line

  const notify = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [it, gv, st] = await Promise.all([
        adminGetItems(key), adminGetGiveaways(key), adminGetStats(key)
      ]);
      setItems(it.data); setGiveaways(gv.data); setStats(st.data);
    } catch { notify("Error al cargar datos — verifica la clave admin", false); }
    finally { setLoading(false); }
  };

  const login = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem(ADMIN_KEY_LS, keyInput.trim());
    setKey(keyInput.trim());
    setAuthed(true);
  };

  // ── Items ──────────────────────────────────────────────────────────────
  const createItem = async () => {
    if (!form.nombre || !form.costo_puntos) { notify("Nombre y costo requeridos", false); return; }
    try {
      await adminCreateItem(key, { ...form, costo_puntos: Number(form.costo_puntos) });
      setForm({ nombre: "", descripcion: "", imagen: "", costo_puntos: "", categoria: "" });
      await loadAll();
      notify("Item creado", true);
    } catch { notify("Error al crear item", false); }
  };

  const saveEditItem = async () => {
    if (!editItem) return;
    try {
      await adminUpdateItem(key, editItem.id, {
        nombre: editItem.nombre, descripcion: editItem.descripcion,
        imagen: editItem.imagen, costo_puntos: editItem.costo_puntos,
        categoria: editItem.categoria, disponible: editItem.disponible,
      });
      setEditItem(null);
      await loadAll();
      notify("Item actualizado", true);
    } catch { notify("Error al actualizar", false); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("¿Eliminar este item?")) return;
    try {
      await adminDeleteItem(key, id); await loadAll(); notify("Item eliminado", true);
    } catch { notify("Error al eliminar", false); }
  };

  const toggleItem = async (item: Item) => {
    try {
      await adminUpdateItem(key, item.id, { disponible: !item.disponible });
      await loadAll();
    } catch { notify("Error", false); }
  };

  // ── Giveaways ──────────────────────────────────────────────────────────
  const createGiveaway = async () => {
    if (!gForm.premio) { notify("Premio requerido", false); return; }
    try {
      await adminCreateGiveaway(key, gForm);
      setGForm({ premio: "", descripcion: "", imagen: "" });
      await loadAll();
      notify("Sorteo creado", true);
    } catch { notify("Error al crear sorteo", false); }
  };

  const drawWinner = async (id: string) => {
    if (!confirm("¿Sortear ganador ahora?")) return;
    try {
      const r = await adminDrawWinner(key, id);
      await loadAll();
      notify(`Ganador: ${r.data.winner?.username || "—"}`, true);
    } catch (e: unknown) {
      notify((e as { response?: { data?: { error?: string } } })?.response?.data?.error || "Error", false);
    }
  };

  const deleteGiveaway = async (id: string) => {
    if (!confirm("¿Eliminar sorteo?")) return;
    try {
      await adminDeleteGiveaway(key, id); await loadAll(); notify("Sorteo eliminado", true);
    } catch { notify("Error al eliminar", false); }
  };

  // ── Login screen ───────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ width: "100%", maxWidth: "360px", background: "var(--bg1)", border: "1px solid var(--glass-border)", borderRadius: "20px", padding: "36px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <p style={{ fontSize: "28px", marginBottom: "10px" }}>🔐</p>
          <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--t1)" }}>Panel Admin</h1>
          <p style={{ fontSize: "13px", color: "var(--t3)", marginTop: "6px" }}>Ingresa la clave ADMIN_SECRET de Render</p>
        </div>
        <input className="input" type="password" placeholder="Clave secreta..."
          value={keyInput} onChange={e => setKeyInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ marginBottom: "12px" }} />
        <button onClick={login} className="btn btn-primary" style={{ width: "100%" }}>Acceder</button>
        <Link href="/" style={{ display: "block", textAlign: "center", marginTop: "16px", fontSize: "12px", color: "var(--t4)", textDecoration: "none" }}>
          ← Volver al inicio
        </Link>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px 24px", maxWidth: "1100px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/dashboard">
            <button className="btn btn-ghost btn-icon"><ArrowLeft size={15} /></button>
          </Link>
          <div>
            <p className="label" style={{ marginBottom: "3px" }}>Administración</p>
            <h1 style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 900, fontSize: "28px", color: "var(--t1)", lineHeight: 1 }}>Panel Admin</h1>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem(ADMIN_KEY_LS); setAuthed(false); setKey(""); }}
          className="btn btn-ghost btn-sm" style={{ color: "#f87171" }}>
          Cerrar sesión admin
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "12px", marginBottom: "28px" }}>
          {[
            { icon: Users,      v: stats.users,       l: "Usuarios"    },
            { icon: ShoppingBag, v: stats.items,      l: "Items"       },
            { icon: Gift,       v: stats.giveaways,   l: "Sorteos"     },
            { icon: Zap,        v: stats.redemptions, l: "Canjes"      },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <s.icon size={18} style={{ color: "var(--orange)", flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize: "20px", color: "var(--t1)", lineHeight: 1 }}>{s.v}</p>
                <p style={{ fontSize: "11px", color: "var(--t4)", marginTop: "2px" }}>{s.l}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ width: "fit-content", marginBottom: "24px" }}>
        <button className={`tab${tab === "items" ? " active" : ""}`} onClick={() => setTab("items")} style={{ gap: "6px" }}>
          <ShoppingBag size={13} /> Tienda
        </button>
        <button className={`tab${tab === "giveaways" ? " active" : ""}`} onClick={() => setTab("giveaways")} style={{ gap: "6px" }}>
          <Gift size={13} /> Sorteos
        </button>
      </div>

      {loading && <p style={{ color: "var(--t4)", fontSize: "13px", marginBottom: "16px" }}>Cargando...</p>}

      {/* ── ITEMS TAB ───────────────────────────────────────────────────── */}
      {tab === "items" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>
          {/* Item list */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)", marginBottom: "12px" }}>
              Items en tienda ({items.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {items.map(item => (
                <motion.div key={item.id} layout
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", borderRadius: "12px",
                    background: "var(--bg1)", border: `1px solid ${item.disponible ? "var(--glass-border)" : "rgba(239,68,68,0.2)"}`,
                    opacity: item.disponible ? 1 : 0.6,
                  }}>
                  {item.imagen && (
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "var(--bg2)" }}>
                      <Image src={item.imagen} alt={item.nombre} width={40} height={40} style={{ objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "13px", color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nombre}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                      <span style={{ fontSize: "12px", color: "var(--orange)", fontWeight: 700 }}>
                        <Zap size={10} style={{ display: "inline", marginRight: "3px" }} />{item.costo_puntos.toLocaleString()} pts
                      </span>
                      {item.categoria && <span className="badge badge-muted" style={{ padding: "1px 8px", fontSize: "10px" }}>{item.categoria}</span>}
                      {!item.disponible && <span style={{ fontSize: "10px", color: "#f87171", fontWeight: 600 }}>AGOTADO</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    <button onClick={() => toggleItem(item)} title={item.disponible ? "Pausar" : "Activar"}
                      className="btn btn-ghost btn-sm" style={{ padding: "6px", color: item.disponible ? "var(--orange)" : "var(--t4)" }}>
                      {item.disponible ? <Check size={13} /> : <X size={13} />}
                    </button>
                    <button onClick={() => setEditItem(item)} className="btn btn-ghost btn-sm" style={{ padding: "6px" }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => deleteItem(item.id)} className="btn btn-ghost btn-sm" style={{ padding: "6px", color: "#f87171" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {items.length === 0 && !loading && (
                <p style={{ color: "var(--t4)", fontSize: "13px" }}>Sin items. Agrega uno →</p>
              )}
            </div>
          </div>

          {/* Add / Edit form */}
          <div style={{ background: "var(--bg1)", border: "1px solid var(--glass-border)", borderRadius: "16px", padding: "20px", position: "sticky", top: "20px" }}>
            <h2 style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)", marginBottom: "16px" }}>
              {editItem ? "Editar item" : "Nuevo item"}
            </h2>
            {editItem ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input className="input" placeholder="Nombre" value={editItem.nombre} onChange={e => setEditItem({ ...editItem, nombre: e.target.value })} />
                <input className="input" placeholder="Descripción" value={editItem.descripcion || ""} onChange={e => setEditItem({ ...editItem, descripcion: e.target.value })} />
                <input className="input" placeholder="URL imagen" value={editItem.imagen || ""} onChange={e => setEditItem({ ...editItem, imagen: e.target.value })} />
                <input className="input" type="number" placeholder="Costo en puntos" value={editItem.costo_puntos} onChange={e => setEditItem({ ...editItem, costo_puntos: Number(e.target.value) })} />
                <input className="input" placeholder="Categoría (opcional)" value={editItem.categoria || ""} onChange={e => setEditItem({ ...editItem, categoria: e.target.value })} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={saveEditItem} className="btn btn-primary" style={{ flex: 1 }}><Check size={13} /> Guardar</button>
                  <button onClick={() => setEditItem(null)} className="btn btn-ghost"><X size={13} /></button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input className="input" placeholder="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                <input className="input" placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
                <input className="input" placeholder="URL imagen" value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} />
                <input className="input" type="number" placeholder="Costo en puntos *" value={form.costo_puntos} onChange={e => setForm({ ...form, costo_puntos: e.target.value })} />
                <input className="input" placeholder="Categoría (ej: Tecnología)" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} />
                <button onClick={createItem} className="btn btn-primary"><Plus size={14} /> Agregar item</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── GIVEAWAYS TAB ───────────────────────────────────────────────── */}
      {tab === "giveaways" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", alignItems: "start" }}>
          {/* List */}
          <div>
            <h2 style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)", marginBottom: "12px" }}>
              Sorteos ({giveaways.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {giveaways.map(g => (
                <motion.div key={g.id} layout
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 14px", borderRadius: "12px",
                    background: "var(--bg1)", border: "1px solid var(--glass-border)",
                  }}>
                  <Gift size={20} style={{ color: g.estado === "activo" ? "var(--orange)" : "var(--t4)", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "13px", color: "var(--t1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.premio}</p>
                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: g.estado === "activo" ? "var(--orange)" : "var(--t4)" }}>
                      {g.estado.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    {g.estado === "activo" && (
                      <button onClick={() => drawWinner(g.id)} className="btn btn-primary btn-sm" style={{ gap: "4px" }}>
                        <Trophy size={11} /> Sortear
                      </button>
                    )}
                    <button onClick={() => deleteGiveaway(g.id)} className="btn btn-ghost btn-sm" style={{ padding: "6px", color: "#f87171" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {giveaways.length === 0 && !loading && (
                <p style={{ color: "var(--t4)", fontSize: "13px" }}>Sin sorteos. Crea uno →</p>
              )}
            </div>
          </div>

          {/* Create form */}
          <div style={{ background: "var(--bg1)", border: "1px solid var(--glass-border)", borderRadius: "16px", padding: "20px", position: "sticky", top: "20px" }}>
            <h2 style={{ fontWeight: 700, fontSize: "15px", color: "var(--t1)", marginBottom: "16px" }}>Nuevo sorteo</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input className="input" placeholder="Premio *" value={gForm.premio} onChange={e => setGForm({ ...gForm, premio: e.target.value })} />
              <input className="input" placeholder="Descripción" value={gForm.descripcion} onChange={e => setGForm({ ...gForm, descripcion: e.target.value })} />
              <input className="input" placeholder="URL imagen" value={gForm.imagen} onChange={e => setGForm({ ...gForm, imagen: e.target.value })} />
              <button onClick={createGiveaway} className="btn btn-primary"><Plus size={14} /> Crear sorteo</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 16, x: "-50%" }}
            className={`toast ${toast.ok ? "toast-success" : "toast-error"}`}
            style={{ position: "fixed", bottom: "28px", left: "50%", zIndex: 100 }}>
            {toast.ok ? <Check size={14} /> : <X size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
