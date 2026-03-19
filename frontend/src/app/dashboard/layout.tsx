"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) router.push("/");
    else setOk(true);
  }, [router]);

  if (!ok) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "50%", border: "2px solid var(--orange-bd)", borderTopColor: "var(--orange)", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <Sidebar />
      {/* main pushes right of sidebar — sidebar width is controlled by CSS var set by Sidebar component */}
      <main id="dashboard-content" style={{ marginLeft: "60px", minHeight: "100vh", transition: "margin-left 0.22s cubic-bezier(0.4,0,0.2,1)" }}>
        {/* Mobile: top offset 52px + bottom offset 56px */}
        <div className="md:hidden" style={{ height: "52px" }} />
        {children}
        <div className="md:hidden" style={{ height: "56px" }} />
      </main>
    </div>
  );
}
