# 🌍 Brunenger World

Plataforma web completa para la comunidad del streamer Brunenger. Incluye tienda de puntos, rankings, sorteos en tiempo real y embed del stream de Kick.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 + TypeScript |
| Estilos | Tailwind CSS + Framer Motion |
| Backend | Node.js + Express |
| Base de datos | Supabase (PostgreSQL) |
| Real-time | Socket.IO |
| Auth | Kick OAuth 2.0 |
| Deploy Backend | Render |
| Deploy Frontend | Vercel / Netlify |

---

## 📁 Estructura

```
brunenger-world/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # App Router pages
│   │   ├── components/
│   │   └── lib/       # API + Auth helpers
│   └── .env.local     # Variables de entorno
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── lib/
│   └── .env           # Variables de entorno
└── supabase_schema.sql  # Schema de la base de datos
```

---

## 🚀 Setup Local

### 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase_schema.sql`
3. Copia la **Project URL** y la **service_role key** desde Settings → API

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edita .env con tus credenciales reales
npm install
npm run dev
```

Variables requeridas en `.env`:
```
KICK_CLIENT_SECRET=1234951294e39c1c060e4fded7e3c48ae27903f94cd581d8be514adc8fec513a
JWT_SECRET=tu-secreto-muy-seguro
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
# Edita .env.local
npm install
npm run dev
```

Variables en `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_KICK_CLIENT_ID=01KM3MJ0VFDX1762BKS18S3CR5
NEXT_PUBLIC_KICK_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 4. Kick OAuth - Configurar Redirect URI

En el panel de desarrolladores de Kick, agrega como redirect URI:
- Desarrollo: `http://localhost:3000/auth/callback`
- Producción: `https://tu-dominio.com/auth/callback`

---

## ☁️ Deploy en Producción

### Backend → Render

1. Conecta el repositorio en [render.com](https://render.com)
2. Usa `backend/` como root directory
3. Configura las variables de entorno en el dashboard de Render
4. El archivo `render.yaml` ya tiene la configuración base

### Frontend → Vercel

```bash
cd frontend
npx vercel
```

Configura las env vars en Vercel:
```
NEXT_PUBLIC_BACKEND_URL=https://tu-api.onrender.com
NEXT_PUBLIC_KICK_CLIENT_ID=01KM3MJ0VFDX1762BKS18S3CR5
NEXT_PUBLIC_KICK_REDIRECT_URI=https://tu-dominio.vercel.app/auth/callback
```

---

## 🎮 Funcionalidades

- **Autenticación OAuth** con Kick
- **Tienda de puntos** — canjea ítems exclusivos
- **Rankings** — top viewers, chatters y supporters
- **Sorteos en tiempo real** — con WebSockets y animación del ganador
- **Embed del stream** — con estado en vivo/offline desde la API de Kick
- **Sistema de niveles** — automático basado en puntos acumulados

---

## 🔒 Seguridad

- Tokens JWT con expiración de 7 días
- Rate limiting en todos los endpoints
- Helmet.js para headers de seguridad
- CORS configurado solo para el frontend autorizado
- Variables sensibles solo en el backend (nunca en el cliente)

---

Desarrollado por [IRLControl](https://irlcontrol.net)
