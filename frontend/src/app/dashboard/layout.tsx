"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ParticleBackground from "@/components/effects/ParticleBackground";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#050508]">
      <ParticleBackground />
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid opacity-20" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-blue-600/5 blur-[100px] pointer-events-none z-0" />
      <Navbar />
      <main className="relative z-10 pt-20 pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
