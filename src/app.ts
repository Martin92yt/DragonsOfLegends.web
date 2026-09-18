import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import { consola } from "consola";
import { ItemCategory, ItemRarity, PlayerClass, World } from "dragons-of-legends.js";
import { renderHomePage } from "./pages/home.js";
import { renderLoginPage } from "./pages/login.js";
import { renderInventoryPage } from "./pages/inventory.js";
import { renderCombatPage } from "./pages/combat.js";
import dotenv from "dotenv";
import { renderTravelPage } from "./pages/travel.js";
import { renderBankPage } from "./pages/bank.js";

dotenv.config();

declare module "express-session" {
  interface SessionData {
    user?: { id: string; username: string };
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const VERSION = "0.1.2-b";
const rpg = new World({ 
  premadeMap: true, 
  deathMode: "hardcore", 
  database: { adapter: "mongodb", uri: process.env.MONGODB_URI } 
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "dragon_secret_key_change_me", resave: false, saveUninitialized: false }));

const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session?.user) return next();
  consola.warn("Unauthorized access attempt blocked.");
  res.redirect("/login");
};

// Fonction helper asynchrone pour résoudre/créer le joueur via MongoDB
const resolvePlayer = async (sessionUser: { id: string; username: string }) => {
  return await rpg.players.ensure({
    id: sessionUser.id,
    name: sessionUser.username,
    playerClass: PlayerClass.Explorer
  });
};

// --- ROUTES ---

app.get("/", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) {
      return res.redirect("/login");
    }
    res.send(renderHomePage(VERSION, activePlayer));
  } catch (error) {
    consola.error("Failed to load home page:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/inventory", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) {
      consola.error("Failed to retrieve player profile for inventory view.");
      return res.status(404).send("Player not found");
    }

    const inventoryItems = await activePlayer.inventory.getItems();
    res.send(renderInventoryPage(VERSION, activePlayer, inventoryItems));
  } catch (error) {
    consola.error("Failed to load inventory page:", error);
    res.status(500).send("Internal server error");
  }
});

app.post("/action/inventory/equip", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) {
      consola.warn("Equip action failed: Active player profile missing.");
      return res.status(401).json({ success: false, message: "Player not found" });
    }

    const { itemId, equipmentSlot } = req.body;
    await activePlayer.inventory.equip(equipmentSlot, itemId);
    
    consola.success(`Player ${activePlayer.name} equipped item successfully.`);
    res.json({ success: true });
  } catch (error) {
    consola.error("Failed to equip item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/action/inventory/unequip", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) {
      consola.warn("Unequip action failed: Active player profile missing.");
      return res.status(401).json({ success: false, message: "Player not found" });
    }

    const { equipmentSlot } = req.body;
    await activePlayer.inventory.unequip(equipmentSlot);
    
    consola.success(`Player ${activePlayer.name} unequipped item successfully.`);
    res.json({ success: true });
  } catch (error) {
    consola.error("Failed to unequip item:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.post("/action/combat", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    const combatResult = activePlayer.inCombat ? rpg.combat.get(activePlayer.id) : rpg.combat.start(activePlayer);
    consola.success(`Combat session initialized for player ${activePlayer.name}.`);
    res.send(renderCombatPage(VERSION, activePlayer, combatResult));
  } catch (error) {
    consola.error("Failed to initialize combat:", error);
    res.redirect("/");
  }
});

app.post("/action/combat", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    // Ajout des await si get() ou start() sont async
    const combatResult = activePlayer.inCombat 
      ? await rpg.combat.get(activePlayer.id) 
      : await rpg.combat.start(activePlayer);

    consola.success(`Combat session initialized for player ${activePlayer.name}.`);
    res.send(renderCombatPage(VERSION, activePlayer, combatResult));
  } catch (error) {
    consola.error("Failed to initialize combat:", error);
    res.redirect("/");
  }
});

app.post("/action/combat/attack", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    // Exécution de l'attaque avec le moteur de combat asynchrone
    const combatResult = rpg.combat.attack 
      ? await rpg.combat.attack(activePlayer.id) 
      : await (await rpg.combat.start(activePlayer)).attack();

    // Vérifie si le joueur a gagné ou si l'ennemi est vaincu
    if (combatResult?.victory || !activePlayer.inCombat) {
      const enemyDrops = combatResult?.enemy?.droppedLootList;
      
      if (enemyDrops && Array.isArray(enemyDrops)) {
        for (const drop of enemyDrops) {
          await activePlayer.inventory.add(drop.loot, drop.quantity);
        }
      }

      consola.success(`Combat concluded successfully for player ${activePlayer.name}.`);
      return res.redirect("/"); // 🎯 Redirection vers l'accueil si victoire
    } 
    
    // Si le joueur est mort / défaite
    if (combatResult?.defeat) {
      consola.warn(`Player ${activePlayer.name} was defeated in combat.`);
      return res.redirect("/"); // Ou vers une route de game over si tu en as une
    }

    // Sinon, le combat continue (le tour s'est échangé, on réaffiche la page de combat)
    res.send(renderCombatPage(VERSION, activePlayer, combatResult));

  } catch (error) {
    consola.error("Combat action failed:", error);
    res.redirect("/");
  }
});

// Afficher la page ou les infos de la banque
// Route d'affichage de la banque
app.get("/action/bank", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    let balance = 0;
    if (activePlayer.bankUnlocked) {
      balance = await rpg.bank.getBalanceTotal(activePlayer);
    }
    
    activePlayer.bank = { balance };
    
    // Récupération du coût de déblocage depuis les options du monde
    const unlockCost = rpg.bank.worldInstance.initializationOptions.bankUnlockCost ?? 0;

    res.send(renderBankPage(VERSION, activePlayer, unlockCost));
  } catch (error) {
    consola.error("Failed to load bank:", error);
    res.redirect("/");
  }
});

// Route POST pour débloquer la banque
app.post("/action/bank/unlock", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    rpg.bank.unlock(activePlayer);
    res.redirect("/action/bank");
  } catch (error) {
    consola.error("Failed to unlock bank:", error);
    res.redirect("/action/bank");
  }
});

// Déposer de l'argent
app.post("/action/bank/deposit", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    const amount = parseInt(req.body.amount, 10);
    await rpg.bank.deposit(activePlayer, amount)
    
    res.redirect("/action/bank");
  } catch (error) {
    consola.error("Deposit failed:", error);
    res.redirect("/action/bank");
  }
});

// Retirer de l'argent
app.post("/action/bank/withdraw", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    const amount = parseInt(req.body.amount, 10);
    await rpg.bank.withdraw(activePlayer, amount)

    res.redirect("/action/bank");
  } catch (error) {
    consola.error("Withdrawal failed:", error);
    res.redirect("/action/bank");
  }
});

// --- ROUTES DE VOYAGE ---

app.post("/action/travel", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    if (activePlayer.inCombat) {
        consola.warn(`Player ${activePlayer.name} attempted to travel while in combat.`);
        return res.redirect("/");
    }

    const currentLocation = rpg.location.get(activePlayer.location);
    const boatRoutes = currentLocation?.travelConnections?.boatRoutes || [];
    const landRoutes = currentLocation?.travelConnections?.landRoutes || [];

    consola.success(`Player ${activePlayer.name} opened the travel menu.`);
    res.send(renderTravelPage(VERSION, boatRoutes, landRoutes, null));
  } catch (error) {
    consola.error("Failed to open travel menu:", error);
    res.redirect("/");
  }
});

app.post("/action/travel/move", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    if (activePlayer.inCombat) {
        consola.warn(`Player ${activePlayer.name} tried to move during combat.`);
        return res.redirect("/");
    }

    const { destinationId } = req.body;
    const travelResult = await activePlayer.moveTo(destinationId);
    consola.info(`Travel result for ${activePlayer.name}:`, travelResult);

    if (travelResult.attacked || activePlayer.inCombat) {
        consola.warn(`Player ${activePlayer.name} was ambushed during travel to ${destinationId}!`);
        const combatResult = activePlayer.inCombat ? rpg.combat.get(activePlayer.id) : travelResult;
        return res.send(renderCombatPage(VERSION, activePlayer, combatResult));
    }

    if (!travelResult.arrived) {
        const currentLocation = rpg.location.get(activePlayer.location);
        const boatRoutes = currentLocation?.travelConnections?.boatRoutes || [];
        const landRoutes = currentLocation?.travelConnections?.landRoutes || [];
        
        return res.send(renderTravelPage(VERSION, boatRoutes, landRoutes, "Le voyage a été interrompu."));
    }

    consola.success(`Player ${activePlayer.name} successfully traveled to ${travelResult.locationId} (${travelResult.travelDurationMs}ms).`);
    res.redirect("/");
  } catch (error) {
      consola.error("Travel failed:", error);
      try {
        const activePlayer = await resolvePlayer(req.session.user!);
        const currentLocation = activePlayer ? rpg.location.get(activePlayer.location) : null;
        const boatRoutes = currentLocation?.travelConnections?.boatRoutes || [];
        const landRoutes = currentLocation?.travelConnections?.landRoutes || [];
        res.send(renderTravelPage(VERSION, boatRoutes, landRoutes, "Impossible de voyager vers cette destination."));
      } catch {
        res.redirect("/");
      }
  }
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