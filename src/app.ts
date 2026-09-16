import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import { consola } from "consola";
import { ItemCategory, ItemRarity, PlayerClass, World } from "dragons-of-legends.js";
import { renderHomePage } from "./pages/home.js";
import { renderLoginPage } from "./pages/login.js";
import { renderInventoryPage } from "./pages/inventory.js";
import { renderCombatPage } from "./pages/combat.js";
import dotenv from "dotenv";

dotenv.config();

declare module "express-session" {
  interface SessionData {
    user?: { id: string; username: string };
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = "0.1.0-alpha.3";
const rpg = new World({ useWorld: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "dragon_secret_key_change_me", resave: false, saveUninitialized: false }));

const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session?.user) return next();
  consola.warn("Unauthorized access attempt blocked.");
  res.redirect("/login");
};

const resolvePlayer = (sessionUser: { id: string; username: string }) => 
  rpg.players.ensure({
    id: sessionUser.id,
    name: sessionUser.username,
    playerClass: PlayerClass.Explorer,
    locationId: rpg.location.getStartingCityId(),
  });

// --- ROUTES ---

app.get("/", requireAuthentication, (req, res) => {
  const activePlayer = resolvePlayer(req.session.user!);
  res.send(renderHomePage(VERSION, activePlayer));
});

app.get("/inventory", requireAuthentication, (req, res) => {
  const activePlayer = resolvePlayer(req.session.user!);
  if (!activePlayer) {
    consola.error("Failed to retrieve player profile for inventory view.");
    return res.status(404).send("Player not found");
  }

  const inventoryItems = activePlayer.inventory.getItems();
  res.send(renderInventoryPage(VERSION, activePlayer, inventoryItems));
});

app.post("/action/inventory/equip", requireAuthentication, (req, res) => {
  const activePlayer = resolvePlayer(req.session.user!);
  if (!activePlayer) {
    consola.warn("Equip action failed: Active player profile missing.");
    return res.status(401).json({ success: false, message: "Player not found" });
  }

  const { itemId, equipmentSlot } = req.body;

  try {
    activePlayer.inventory.equip(equipmentSlot, itemId);
    consola.success(`Player ${activePlayer.name} equipped item successfully.`);
    res.json({ success: true });
  } catch (error) {
    consola.error("Failed to equip item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/action/inventory/unequip", requireAuthentication, (req, res) => {
  const activePlayer = resolvePlayer(req.session.user!);
  if (!activePlayer) {
    consola.warn("Unequip action failed: Active player profile missing.");
    return res.status(401).json({ success: false, message: "Player not found" });
  }

  const { itemId, equipmentSlot } = req.body;

  try {
    activePlayer.inventory.unequip(equipmentSlot);
    consola.success(`Player ${activePlayer.name} unequipped item successfully.`);
    res.json({ success: true });
  } catch (error) {
    consola.error("Failed to unequip item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/action/combat", requireAuthentication, (req, res) => {
  const activePlayer = resolvePlayer(req.session.user!);
  if (!activePlayer) return;

  const combatResult = activePlayer.inCombat ? rpg.combat.get(activePlayer.id) : rpg.combat.start(activePlayer);
  consola.success(`Combat session initialized for player ${activePlayer.name}.`);
  res.send(renderCombatPage(VERSION, activePlayer, combatResult));
});

app.post("/action/combat/attack", requireAuthentication, (req, res) => {
  const activePlayer = resolvePlayer(req.session.user!);
  if (!activePlayer) return;

  const combatResult = rpg.combat.attack ? rpg.combat.attack(activePlayer.id) : rpg.combat.start(activePlayer).attack();

  if (!activePlayer.inCombat) {
    const enemyDrops = combatResult?.enemy.droppedLootList;
    
    if (enemyDrops && Array.isArray(enemyDrops)) {
      for (const drop of enemyDrops) {
        activePlayer.inventory.add(drop.loot, drop.quantity);
      }
    }

    consola.success(`Combat concluded successfully for player ${activePlayer.name}.`);
    res.redirect("/");
  } else {
    res.send(renderCombatPage(VERSION, activePlayer, combatResult));
  }
});

app.post("/action/travel", requireAuthentication, (req, res) => {
  consola.success(`Player ${req.session.user?.username} traveled to a new location.`);
  res.redirect("/");
});

app.get("/login", (req, res) => {
  if (req.session?.user) return res.redirect("/");
  res.send(renderLoginPage(VERSION, (req.query.error as string) || null));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    consola.warn("Login attempt rejected: Missing credentials.");
    return res.redirect("/login?error=missing_fields");
  }

  const sanitizedUsername = String(username).trim();
  req.session.user = {
    id: sanitizedUsername.toLowerCase().replace(/[^a-z0-9]/g, "_"),
    username: sanitizedUsername,
  };

  consola.success(`User '${sanitizedUsername}' authenticated successfully.`);
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

// --- SERVER STARTUP ---
consola.start(`Starting project with version ${VERSION}...`);
app.listen(Number(PORT), () => consola.success(`Server listening on http://localhost:${PORT}`));

process.on('uncaughtException', (err) => {
  consola.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  consola.error('Unhandled Rejection at:', promise, 'reason:', reason);
});