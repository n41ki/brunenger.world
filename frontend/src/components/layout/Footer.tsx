"use client";
import Link from "next/link";
import LightningIcon from "@/components/ui/LightningIcon";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0B0B0B] mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <LightningIcon size={18} />
            <span className="font-display text-lg tracking-widest text-white/60">BRUNENGER</span>
          </div>
          <div className="flex items-center gap-6 text-xs font-body text-[#444]">
            <Link href="/dashboard" className="hover:text-[#888] transition-colors">Dashboard</Link>
            <Link href="/dashboard/stream" className="hover:text-[#888] transition-colors">Stream</Link>
            <Link href="/dashboard/shop" className="hover:text-[#888] transition-colors">Tienda</Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-body text-[#333]">
            <span>Desarrollado por</span>
            <a href="https://irlcontrol.net" target="_blank" rel="noopener noreferrer"
              className="text-[#555] hover:text-[#888] transition-colors font-medium">
              IRLControl
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
