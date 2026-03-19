"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <main style={{ paddingTop: "56px" }}>{children}</main>
      <Footer />
    </div>
  );
}
