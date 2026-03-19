import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Brunenger World",
  description: "La comunidad oficial de Brunenger — puntos, sorteos y stream en vivo",
  openGraph: { title: "Brunenger World", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Prevent flash: apply saved theme before paint */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('bw-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})()`
        }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
