/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.kick.com" },
      { protocol: "https", hostname: "**.kickcdn.com" },
      { protocol: "https", hostname: "files.kick.com" },
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_KICK_CLIENT_ID: process.env.NEXT_PUBLIC_KICK_CLIENT_ID,
    NEXT_PUBLIC_KICK_REDIRECT_URI: process.env.NEXT_PUBLIC_KICK_REDIRECT_URI,
  },
};

export default nextConfig;
