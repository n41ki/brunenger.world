import Link from "next/link";
import LightningIcon from "@/components/ui/LightningIcon";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: "80px", position: "relative", zIndex: 1 }}>
      <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "28px 20px" }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LightningIcon size={15} />
            <span className="display" style={{ fontSize: "14px", letterSpacing: "0.1em", color: "var(--t4)" }}>BRUNENGER</span>
          </div>
          <div style={{ display: "flex", gap: "24px", fontSize: "12px", color: "var(--t4)" }}>
            {[
              { href: "/dashboard/stream", label: "Stream" },
              { href: "/dashboard/shop", label: "Tienda" },
              { href: "/dashboard/rankings", label: "Rankings" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                style={{ color: "var(--t4)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--t2)"}
                onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--t4)"}
              >{l.label}</Link>
            ))}
          </div>
          <p style={{ fontSize: "12px", color: "var(--t4)" }}>
            Desarrollado por{" "}
            <a href="https://irlcontrol.net" target="_blank" rel="noopener noreferrer"
              style={{ color: "var(--t3)", textDecoration: "none" }}>
              IRLControl
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
