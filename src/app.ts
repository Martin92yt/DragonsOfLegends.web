import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import { consola } from "consola";
import { PlayerClass, World } from "dragons-of-legends.js";
import { renderHomePage } from "./pages/home.js";
import { renderLoginPage } from "./pages/login.js";
import { renderInventoryPage } from "./pages/inventory.js";
import { renderCombatPage } from "./pages/combat.js";
import { renderTravelPage } from "./pages/travel.js";
import { renderBankPage } from "./pages/bank.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { MongoClient, Collection, Document } from "mongodb";
import { renderRegisterPage } from "./pages/register.js";

dotenv.config();

// Extension des types de session Express
declare module "express-session" {
  interface SessionData {
    user?: { id: string; username: string };
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = "0.1.3-alpha.6";
const MONGODB_URI = process.env.MONGODB_URI || "";

// --- CONFIGURATION MONGODB & MONDE ---
const mongoClient = new MongoClient(MONGODB_URI);
let accountsCollection: Collection<Document>;

async function initializeDatabase() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    accountsCollection = db.collection("dragons-of-legends");
    consola.success("Connected to MongoDB Accounts collection successfully.");
  } catch (error) {
    consola.error("Failed to connect to Accounts MongoDB:", error);
    process.exit(1);
  }
}

initializeDatabase();

const rpg = new World({ 
  premadeMap: true, 
  checkUpdates: true,
  deathMode: "hardcore", 
  database: { 
    adapter: "mongodb", 
    path: "./data.db", 
    uri: MONGODB_URI 
  }
} as any);

// --- MIDDLEWARES GLOBAUX ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({ 
  secret: process.env.SESSION_SECRET || "dragon_secret_key_change_me", 
  resave: false, 
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === "production", 
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 semaine
  }
}));

// Protection contre le force brute sur le login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Trop de tentatives de connexion, réessayez plus tard."
});

// Middleware d'authentification
const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session && req.session.user) {
    return next();
  }
  consola.warn("Unauthorized access attempt blocked.");
  res.redirect("/login");
};

// Helper pour récupérer ou créer le joueur associé à la session
const resolvePlayer = async (sessionUser: { id: string; username: string }) => {
  return await rpg.players.ensure({
    id: sessionUser.id,
    name: sessionUser.username,
    playerClass: PlayerClass.Explorer
  });
};

// ==========================================
// --- ROUTES D'AUTHENTIFICATION ---
// ==========================================

app.get("/login", (req, res) => {
  if (req.session?.user) return res.redirect("/");
  res.send(renderLoginPage(VERSION, (req.query.error as string) || null));
});

// Inscription
app.get("/register", (req, res) => {
  if (req.session?.user) return res.redirect("/");
  res.send(renderRegisterPage(VERSION, (req.query.error as string) || null));
});

app.post("/register", async (req, res) => {
  try {
    const { username, password, terms } = req.body;
    if (!username || !password) {
      return res.redirect("/register?error=missing_fields");
    }

    if (!terms) {
      return res.redirect("/register?error=terms_not_accepted");
    }

    const sanitizedUsername = String(username).trim();
    if (password.length < 6) {
      return res.redirect("/register?error=password_too_short");
    }

    // Vérifier si l'utilisateur existe déjà (insensible à la casse)
    const existingAccount = await accountsCollection.findOne({ 
      username: { $regex: new RegExp(`^${sanitizedUsername}$`, "i") } 
    });
    
    if (existingAccount) {
      consola.warn(`Registration failed: Username '${sanitizedUsername}' already taken.`);
      return res.redirect("/register?error=username_taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountId = sanitizedUsername.toLowerCase().replace(/[^a-z0-9]/g, "_");

    await accountsCollection.insertOne({
      id: accountId,
      username: sanitizedUsername,
      password: hashedPassword,
      createdAt: new Date()
    });

    // Initialisation sécurisée de la session après inscription
    req.session.regenerate((err) => {
      if (err) {
        consola.error("Session regeneration failed after register:", err);
        return res.redirect("/register?error=server_error");
      }
      req.session.user = { id: accountId, username: sanitizedUsername };
      consola.success(`Account '${sanitizedUsername}' created and logged in successfully.`);
      res.redirect("/");
    });
  } catch (error) {
    consola.error("Error during registration:", error);
    res.redirect("/register?error=server_error");
  }
});

// Connexion
app.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.redirect("/login?error=missing_fields");
    }

    const sanitizedUsername = String(username).trim();
    const account = await accountsCollection.findOne({ 
      username: { $regex: new RegExp(`^${sanitizedUsername}$`, "i") } 
    });

    if (!account || !(await bcrypt.compare(password, account.password))) {
      consola.warn(`Failed login attempt for username: ${sanitizedUsername}`);
      return res.redirect("/login?error=invalid_credentials");
    }

    // Régénération indispensable pour contrer la fixation de session
    req.session.regenerate((err) => {
      if (err) {
        consola.error("Session regeneration failed during login:", err);
        return res.redirect("/login?error=server_error");
      }

      req.session.user = { id: account.id, username: account.username };
      consola.success(`Account '${account.username}' logged in successfully.`);
      res.redirect("/");
    });
  } catch (error) {
    consola.error("Error during login:", error);
    res.redirect("/login?error=server_error");
  }
});

// Changement de mot de passe
app.post("/account/change-password", requireAuthentication, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const sessionUser = req.session.user!;

    const account = await accountsCollection.findOne({ id: sessionUser.id });
    if (!account) return res.redirect("/login");

    const isValid = await bcrypt.compare(currentPassword, account.password);
    if (!isValid) {
      return res.status(400).send("Mot de passe actuel incorrect.");
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).send("Le nouveau mot de passe doit faire au moins 6 caractères.");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await accountsCollection.updateOne(
      { id: sessionUser.id },
      { $set: { password: hashedNewPassword } }
    );

    consola.success(`Password successfully updated for account ${sessionUser.username}`);
    res.redirect("/?success=password_updated");
  } catch (error) {
    consola.error("Error changing password:", error);
    res.status(500).send("Internal server error");
  }
});

// Déconnexion
app.all("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) consola.error("Error destroying session:", err);
    res.clearCookie('connect.sid');
    res.redirect("/login");
  });
});

// ==========================================
// --- ROUTES DU JEU ---
// ==========================================

app.get("/", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    res.send(renderHomePage(VERSION, activePlayer));
  } catch (error) {
    consola.error("Failed to load home page:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/inventory", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const inventoryItems = await activePlayer?.inventory?.getItems();
    res.send(renderInventoryPage(VERSION, activePlayer, inventoryItems));
  } catch (error) {
    consola.error("Failed to load inventory page:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/action/inventory/equip", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const { itemId, equipmentSlot } = req.body;
    await activePlayer?.inventory?.equip(equipmentSlot, itemId);
    
    res.json({ success: true });
  } catch (error) {
    consola.error("Failed to equip item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/action/inventory/unequip", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const { equipmentSlot } = req.body;
    await activePlayer?.inventory?.unequip(equipmentSlot);
    
    res.json({ success: true });
  } catch (error) {
    consola.error("Failed to unequip item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/action/combat", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) {
      return res.redirect("/login");
    }

    const combatResult = activePlayer.inCombat 
      ? await rpg.combat.get(activePlayer.id) 
      : await rpg.combat.start(activePlayer);

    res.send(renderCombatPage(VERSION, activePlayer, combatResult));
  } catch (error) {
    consola.error("Failed to initialize combat:", error);
    res.redirect("/");
  }
});

// --- ROUTES BANQUE ---

app.get("/action/bank", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    let balance = 0;
    if (activePlayer?.bankUnlocked) {
      balance = await rpg.bank.getBalanceTotal(activePlayer);
    }
    
    if (activePlayer) {
      (activePlayer as any).bank = { balance };
    }
    const unlockCost = rpg.bank.worldInstance.initializationOptions.bankUnlockCost ?? 0;

    res.send(renderBankPage(VERSION, activePlayer, unlockCost));
  } catch (error) {
    consola.error("Failed to load bank:", error);
    res.redirect("/");
  }
});

app.post("/action/bank/unlock", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (activePlayer) {
      rpg.bank.unlock(activePlayer);
    }
    res.redirect("/action/bank");
  } catch (error) {
    consola.error("Failed to unlock bank:", error);
    res.redirect("/action/bank");
  }
});

app.post("/action/bank/deposit", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const amount = parseInt(req.body.amount, 10);
    if (activePlayer) {
      await rpg.bank.deposit(activePlayer, amount);
    }
    res.redirect("/action/bank");
  } catch (error) {
    consola.error("Deposit failed:", error);
    res.redirect("/action/bank");
  }
});

app.post("/action/bank/withdraw", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const amount = parseInt(req.body.amount, 10);
    if (activePlayer) {
      await rpg.bank.withdraw(activePlayer, amount);
    }
    res.redirect("/action/bank");
  } catch (error) {
    consola.error("Withdrawal failed:", error);
    res.redirect("/action/bank");
  }
});

// --- ROUTES VOYAGE ---

app.post("/action/travel", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) {
      return res.redirect("/login");
    }
    
    if (activePlayer.inCombat) return res.redirect("/");

    const currentLocation = rpg.location.get(activePlayer.location);
    const boatRoutes = currentLocation?.travelConnections?.boatRoutes || [];
    const landRoutes = currentLocation?.travelConnections?.landRoutes || [];

    res.send(renderTravelPage(VERSION, boatRoutes, landRoutes, null));
  } catch (error) {
    consola.error("Failed to open travel menu:", error);
    res.redirect("/");
  }
});

app.post("/action/travel/move", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) {
      return res.redirect("/login");
    }

    if (activePlayer.inCombat) return res.redirect("/");

    const { destinationId } = req.body;
    const travelResult = await activePlayer.moveTo(destinationId);

    if (travelResult?.attacked || activePlayer.inCombat) {
        const combatResult = activePlayer.inCombat ? await rpg.combat.get(activePlayer.id) : travelResult;
        return res.send(renderCombatPage(VERSION, activePlayer, combatResult));
    }

    if (!travelResult?.arrived) {
        const currentLocation = rpg.location.get(activePlayer.location);
        const boatRoutes = currentLocation?.travelConnections?.boatRoutes || [];
        const landRoutes = currentLocation?.travelConnections?.landRoutes || [];
        return res.send(renderTravelPage(VERSION, boatRoutes, landRoutes, "Le voyage a été interrompu."));
    }

    res.redirect("/");
  } catch (error) {
    consola.error("Travel failed:", error);
    res.redirect("/");
  }
});

// --- GESTION DES ERREURS GLOBALES & LANCEMENT ---
process.on('uncaughtException', (err) => {
  consola.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  consola.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(Number(PORT), () => {
  consola.start(`Starting project with version ${VERSION}...`);
  consola.success(`Server listening on http://localhost:${PORT}`);
});