import Link from "next/link";
import LightningIcon from "@/components/ui/LightningIcon";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.07)] mt-20">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <LightningIcon size={16} />
          <span className="display text-[15px] tracking-[0.08em] text-[#333]">BRUNENGER</span>
        </div>
        <div className="flex items-center gap-6 text-[12px] text-[#333]">
          <Link href="/dashboard/stream"    className="hover:text-[#666] transition-colors">Stream</Link>
          <Link href="/dashboard/shop"      className="hover:text-[#666] transition-colors">Tienda</Link>
          <Link href="/dashboard/rankings"  className="hover:text-[#666] transition-colors">Rankings</Link>
          <Link href="/dashboard/giveaways" className="hover:text-[#666] transition-colors">Sorteos</Link>
        </div>
        <p className="text-[12px] text-[#2A2A2A]">
          Desarrollado por{" "}
          <a href="https://irlcontrol.net" target="_blank" rel="noopener noreferrer"
            className="text-[#333] hover:text-[#555] transition-colors">
            IRLControl
          </a>
        </p>
      </div>
    </footer>
  );
}
