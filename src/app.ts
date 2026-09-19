import express from "express";
import session from "express-session";
import { consola } from "consola";
import { PORT, VERSION, initializeDatabase } from "./config.js";
import { authRoutes } from "./routes/auth.js";
import { gameRoutes } from "./routes/game.js";

// Extension des types de session Express
declare module "express-session" {
  interface SessionData {
    user?: { id: string; username: string };
  }
}

const app = express();
app.set('trust proxy', 1); // Indispensable pour Vercel

// Middlewares globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({ 
  secret: process.env.SESSION_SECRET || "dragon_secret_key_change_me", 
  resave: false, 
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === "production", 
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 
  }
}));

// Enregistrement des routeurs
app.use(authRoutes);
app.use(gameRoutes);

// Gestion des erreurs globales
process.on('uncaughtException', (err) => consola.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => consola.error('Unhandled Rejection:', reason));

async function startServer() {
  await initializeDatabase();
  app.listen(Number(PORT), () => {
    consola.start(`Starting project with version ${VERSION}...`);
    consola.success(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();