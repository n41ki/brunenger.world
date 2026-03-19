"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";

const YT_ID = "yzmLLn-InkM";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [sidebarW, setSidebarW] = useState("60px");

  useEffect(() => {
    if (!isAuthenticated()) router.push("/");
    else setOk(true);

    // Read initial sidebar state
    const saved = localStorage.getItem("bw-sidebar");
    if (saved === "1") setSidebarW("220px");

    // Listen for sidebar resize events
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.width) setSidebarW(detail.width);
    };
    window.addEventListener("sidebar-resize", handler);
    return () => window.removeEventListener("sidebar-resize", handler);
  }, [router]);

  if (!ok) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Video background */}
      <div className="video-bg">
        <iframe
          src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_ID}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`}
          allow="autoplay; fullscreen"
          title="bg"
        />
        <div className="video-bg-overlay" />
      </div>

      <Sidebar />
      <main id="dashboard-content" style={{
        marginLeft: sidebarW,
        minHeight: "100vh",
        position: "relative",
        zIndex: 1,
        transition: "margin-left 0.22s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div className="md:hidden" style={{ height: "52px" }} />
        {children}
        <div className="md:hidden" style={{ height: "56px" }} />
      </main>
    </div>
  );
}
