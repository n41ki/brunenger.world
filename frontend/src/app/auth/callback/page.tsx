"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import { setAuthToken } from "@/lib/auth";
import { Zap } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando credenciales...");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      setStatus("error");
      setMessage(`Error de autenticación: ${error}`);
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    if (!code) {
      setStatus("error");
      setMessage("No se recibió código de autorización.");
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    // Verify state
    const savedState = sessionStorage.getItem("kick_oauth_state");
    if (savedState && state !== savedState) {
      setStatus("error");
      setMessage("Estado de seguridad inválido. Intenta de nuevo.");
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    setMessage("Autenticando con Kick...");

    axios
      .post(`${BACKEND_URL}/api/auth/kick/callback`, { code })
      .then((res) => {
        setAuthToken(res.data.token);
        setStatus("success");
        setMessage("¡Bienvenido a Brunenger World!");
        sessionStorage.removeItem("kick_oauth_state");
        setTimeout(() => router.push("/dashboard"), 1500);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.error || "Error al autenticar. Intenta de nuevo.");
        setTimeout(() => router.push("/"), 3000);
      });
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#050508] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6 text-center px-6"
      >
        {status === "loading" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500"
            />
            <div className="flex items-center gap-2">
              <Zap className="text-blue-400 animate-pulse" size={20} />
              <span className="font-orbitron text-white/80 text-lg">{message}</span>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center"
            >
              <span className="text-3xl">✓</span>
            </motion.div>
            <span className="font-orbitron font-bold text-xl text-green-400">{message}</span>
            <span className="text-white/50 text-sm">Redirigiendo al dashboard...</span>
          </>
        )}

        {status === "error" && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center"
            >
              <span className="text-3xl">✗</span>
            </motion.div>
            <span className="font-orbitron font-bold text-xl text-red-400">{message}</span>
            <span className="text-white/50 text-sm">Redirigiendo...</span>
          </>
        )}
      </motion.div>
    </div>
  );
}
