"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/"); }
    else { setAuthorized(true); }
  }, [router]);

  if (!authorized) return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#FF6B00]/30 border-t-[#FF6B00] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <Navbar />
      <main className="pt-16">{children}</main>
      <Footer />
    </div>
  );
}
