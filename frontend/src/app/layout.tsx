import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brunenger World",
  description: "La comunidad de Brunenger - Streams, sorteos y mucho más",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Brunenger World",
    description: "La comunidad de Brunenger - Streams, sorteos y mucho más",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#050508] text-white min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
