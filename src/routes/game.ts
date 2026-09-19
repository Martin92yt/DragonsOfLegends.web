import { Router, Request, Response, NextFunction } from "express";
import { consola } from "consola";
import { rpg, resolvePlayer, VERSION } from "../config.js";
import { renderHomePage } from "../pages/home.js";
import { renderInventoryPage } from "../pages/inventory.js";
import { renderCombatPage } from "../pages/combat.js";
import { renderTravelPage } from "../pages/travel.js";
import { renderBankPage } from "../pages/bank.js";

const router = Router();

// Middleware d'authentification pour le jeu
export const requireAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect("/login");
};

router.use(requireAuthentication);

router.get("/", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    res.send(renderHomePage(VERSION, activePlayer));
  } catch (error) {
    consola.error("Failed to load home page:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/inventory", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const inventoryItems = await activePlayer?.inventory?.getItems();
    res.send(renderInventoryPage(VERSION, activePlayer, inventoryItems));
  } catch (error) {
    consola.error("Failed to load inventory page:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/action/inventory/equip", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const { itemId, equipmentSlot } = req.body;
    await activePlayer?.inventory?.equip(equipmentSlot, itemId);
    res.json({ success: true });
  } catch (error) {
    consola.error("Failed to equip item:", error);
    res.status(500).json({ success: false });
  }
});

router.post("/action/inventory/unequip", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const { equipmentSlot } = req.body;
    await activePlayer?.inventory?.unequip(equipmentSlot);
    res.json({ success: true });
  } catch (error) {
    consola.error("Failed to unequip item:", error);
    res.status(500).json({ success: false });
  }
});

router.post("/action/combat", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

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

// Banque
router.get("/action/bank", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    let balance = 0;
    if (activePlayer?.bankUnlocked) {
      balance = await rpg.bank.getBalanceTotal(activePlayer);
    }
    if (activePlayer) (activePlayer as any).bank = { balance };
    const unlockCost = rpg.bank.worldInstance.initializationOptions.bankUnlockCost ?? 0;

    res.send(renderBankPage(VERSION, activePlayer, unlockCost));
  } catch (error) {
    consola.error("Failed to load bank:", error);
    res.redirect("/");
  }
});

router.post("/action/bank/unlock", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (activePlayer) rpg.bank.unlock(activePlayer);
    res.redirect("/action/bank");
  } catch (error) {
    res.redirect("/action/bank");
  }
});

router.post("/action/bank/deposit", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const amount = parseInt(req.body.amount, 10);
    if (activePlayer) await rpg.bank.deposit(activePlayer, amount);
    res.redirect("/action/bank");
  } catch (error) {
    res.redirect("/action/bank");
  }
});

router.post("/action/bank/withdraw", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    const amount = parseInt(req.body.amount, 10);
    if (activePlayer) await rpg.bank.withdraw(activePlayer, amount);
    res.redirect("/action/bank");
  } catch (error) {
    res.redirect("/action/bank");
  }
});
// Gérer l'action d'attaquer pendant un combat
router.post("/action/combat/attack", requireAuthentication, async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    const combatResult = rpg.combat.attack 
      ? await rpg.combat.attack(activePlayer.id) 
      : await (await rpg.combat.start(activePlayer)).attack();

    if (combatResult?.victory || !activePlayer.inCombat) {
      const enemyDrops = combatResult?.enemy?.droppedLootList;
      if (enemyDrops && Array.isArray(enemyDrops)) {
        for (const drop of enemyDrops) {
          await activePlayer.inventory.add(drop.loot, drop.quantity);
        }
      }
      consola.success(`Combat concluded successfully for player ${activePlayer.name}.`);
      return res.redirect("/");
    } 
    
    if (combatResult?.defeat) {
      consola.warn(`Player ${activePlayer.name} was defeated in combat.`);
      return res.redirect("/");
    }

    res.send(renderCombatPage(VERSION, activePlayer, combatResult));
  } catch (error) {
    consola.error("Combat action failed:", error);
    res.redirect("/");
  }
});

// Optionnel : si tu as aussi une action pour fuir le combat
router.post("/action/combat/flee", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");

    await rpg.combat.attack(activePlayer.id);
    res.redirect("/");
  } catch (error) {
    consola.error("Failed to flee combat:", error);
    res.redirect("/");
  }
});
// Voyage
router.post("/action/travel", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");
    if (activePlayer.inCombat) return res.redirect("/");

    const currentLocation = rpg.location.get(activePlayer.location);
    const boatRoutes = currentLocation?.travelConnections?.boatRoutes || [];
    const landRoutes = currentLocation?.travelConnections?.landRoutes || [];

    res.send(renderTravelPage(VERSION, boatRoutes, landRoutes, null));
  } catch (error) {
    res.redirect("/");
  }
});

router.post("/action/travel/move", async (req, res) => {
  try {
    const activePlayer = await resolvePlayer(req.session.user!);
    if (!activePlayer) return res.redirect("/login");
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
    res.redirect("/");
  }
});

export const gameRoutes = router;