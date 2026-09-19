import { Router } from "express";
import { accountsCollection, rpg } from "../config.js";
import { requireAdmin } from "../config.js";
import { renderAdminPage } from "../pages/admin.js";
import { renderPlayerDetailPage } from "../pages/admin.details.js";
import bcrypt from "bcrypt";

const router = Router();

// Middleware de sécurité strict pour toutes les routes admin
router.use(requireAdmin);

// 1. PAGE DE LISTE DE TOUS LES JOUEURS (DASHBOARD)
router.get("/admin", async (req, res) => {
  try {
    const search = (req.query.search as string) || "";

    // Filtre de recherche par pseudo ou ID
    const query = search
      ? { username: { $regex: search, $options: "i" } }
      : {};

    const allAccounts = await accountsCollection
      .find(query)
      .project({ password: 0 })
      .toArray();

    // Charger les données de jeu associées
    let totalGoldInEconomy = 0;

    const playersWithData = await Promise.all(
      allAccounts.map(async (acc) => {
        let playerStats = null;

        try {
          playerStats = await rpg.players.get(acc.id);

          if (playerStats && playerStats.gold) {
            totalGoldInEconomy += playerStats.gold;
          }
        } catch (e) {
          // Pas de perso créé
        }

        return {
          ...acc,
          character: playerStats
        };
      })
    );

    // Statistiques globales pour le header
    const stats = {
      totalAccounts: allAccounts.length,
      bannedCount: allAccounts.filter((a) => a.banned).length,
      adminCount: allAccounts.filter((a) => a.role === "admin").length,
      totalGold: totalGoldInEconomy
    };

    const currentAdminUser =
      req.session.user || {
        id: "",
        username: "Inconnu"
      };

    const html = renderAdminPage(
      "0.1.0",
      currentAdminUser,
      playersWithData,
      stats,
      search
    );

    res.send(html);
  } catch (error) {
    res
      .status(500)
      .send("Erreur lors du chargement de la liste des aventuriers.");
  }
});

// 2. PAGE DE DÉTAIL & DE GESTION D'UN JOUEUR UNIQUE
router.get("/admin/player/:id", async (req, res) => {
  try {
    const targetId = req.params.id;

    const account = await accountsCollection.findOne(
      { id: targetId },
      { projection: { password: 0 } }
    );

    if (!account) {
      return res.status(404).send("Aventurier introuvable.");
    }

    let playerStats: any = null;

    try {
      playerStats = await rpg.players.get(targetId);
    } catch (e) {
      // Pas de personnage créé
    }

    // Normalisation des données nécessaires au template
    let normalizedCharacter = null;

    if (playerStats) {
      let itemsList = [];

      try {
        if (
          typeof playerStats.inventory?.getItems === "function"
        ) {
          itemsList = await playerStats.inventory.getItems();
        } else if (Array.isArray(playerStats.inventory)) {
          itemsList = playerStats.inventory;
        }
      } catch (err) {
        itemsList = [];
      }

      normalizedCharacter = {
        ...playerStats,
        marriedTo: playerStats.marriage?.partnerId || null,
        inventory: itemsList
      };
    }

    const playerWithData = {
      ...account,
      character: normalizedCharacter
    };

    const currentAdminUser =
      req.session.user || {
        id: "",
        username: "Inconnu"
      };

    const html = renderPlayerDetailPage(
      "0.1.0",
      currentAdminUser,
      playerWithData
    );

    res.send(html);
  } catch (error) {
    console.error("Erreur admin player detail:", error);

    res
      .status(500)
      .send("Erreur lors du chargement du profil de l'aventurier.");
  }
});

// 3. TRAITEMENT DES ACTIONS
router.post("/admin/action/:id", async (req, res) => {
  try {
    const targetId = req.params.id;
    const { actionType, value } = req.body;
    const currentUserId = req.session.user?.id;

    // ==========================================
    // ACTIONS LIÉES AU COMPTE
    // ==========================================

    if (actionType === "change_role") {
      if (currentUserId && targetId === currentUserId) {
        return res
          .status(400)
          .send("Vous ne pouvez pas modifier votre propre rôle.");
      }

      await accountsCollection.updateOne(
        { id: targetId },
        {
          $set: {
            role: value
          }
        }
      );
    }

    else if (actionType === "toggle_ban") {
      if (currentUserId && targetId === currentUserId) {
        return res
          .status(400)
          .send("Vous ne pouvez pas vous bannir vous-même.");
      }

      const account = await accountsCollection.findOne({
        id: targetId
      });

      const newBanStatus = !account?.banned;

      await accountsCollection.updateOne(
        { id: targetId },
        {
          $set: {
            banned: newBanStatus
          }
        }
      );
    }

    else if (actionType === "delete_account") {
      if (currentUserId && targetId === currentUserId) {
        return res
          .status(400)
          .send("Action impossible sur votre propre compte.");
      }

      await accountsCollection.deleteOne({
        id: targetId
      });

      return res.redirect("/admin");
    }

    // ==========================================
    // MISE À JOUR COMPLÈTE DU PROFIL
    // ==========================================

    else if (actionType === "update_full_profile") {
      const {
        id: newId,
        username,
        password,
        classId,
        location,
        level,
        gold,
        expCurrent,
        expRequired,
        hpCurrent,
        hpMax,
        bankGold,
        bankUnlocked,
        str,
        agi,
        int,
        def,
        marriedTo
      } = req.body;

      const accountUpdateData: any = {
        username: username.trim(),
        id: newId.trim()
      };

      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        accountUpdateData.password = hashedPassword;
      }

      await accountsCollection.updateOne(
        { id: targetId },
        {
          $set: accountUpdateData
        }
      );

      const effectiveTargetId = newId.trim();

      let player: any = null;

      try {
        player = await rpg.players.get(targetId);
      } catch (e) {
        // Ignorer si inexistant
      }

      if (!player) {
        player = {
          id: effectiveTargetId
        };
      }
      else if (targetId !== effectiveTargetId) {
        player.id = effectiveTargetId;
      }

      player.classId = classId || player.classId;
      player.location = location || player.location;

      player.level = Math.max(
        1,
        Number(level) || 1
      );

      player.gold = Number(gold) || 0;

      // ==========================================
      // EXPÉRIENCE
      // ==========================================

      if (!player.experience) {
        player.experience = {
          current: 0,
          required: 100
        };
      }

      player.experience.current =
        Number(expCurrent) || 0;

      player.experience.required =
        Number(expRequired) || 100;

      // ==========================================
      // SANTÉ
      // ==========================================

      if (!player.health) {
        player.health = {
          current: 100,
          max: 100
        };
      }

      player.health.current =
        Number(hpCurrent) || 100;

      player.health.max =
        Number(hpMax) || 100;

      // ==========================================
      // BANQUE
      // ==========================================

      player.bankGold =
        Number(bankGold) || 0;

      player.bankUnlocked =
        bankUnlocked === "true";

      // ==========================================
      // ATTRIBUTS
      // ==========================================

      if (!player.attributes) {
        player.attributes = {};
      }

      player.attributes.strength =
        Number(str) || 0;

      player.attributes.agility =
        Number(agi) || 0;

      player.attributes.intelligence =
        Number(int) || 0;

      player.attributes.defense =
        Number(def) || 0;

      // ==========================================
      // MARIAGE
      // ==========================================

      if (player.marriage) {
        player.marriage.partnerId =
          marriedTo
            ? marriedTo.trim()
            : "";
      }
      else {
        player.marriedTo =
          marriedTo
            ? marriedTo.trim()
            : null;
      }

      await rpg.players.save(player);

      return res.redirect(
        `/admin/player/${effectiveTargetId}`
      );
    }

    // ==========================================
    // ACTIONS BASIQUES
    // ==========================================

    else {
      let player: any = null;

      try {
        player = await rpg.players.get(targetId);
      } catch (e) {
        // Ignorer
      }

      if (player) {
        switch (actionType) {

          case "give_gold":
            player.gold = Math.max(
              0,
              (player.gold || 0) +
                (Number(value) || 0)
            );
            break;

          case "teleport":
            if (value) {
              player.location = value.trim();
            }
            break;

          case "set_level":
            player.level = Math.max(
              1,
              Number(value) || 1
            );
            break;

          case "heal":
            if (player.health) {
              player.health.current =
                player.health.max;
            }
            break;
        }

        await rpg.players.save(player);
      }
    }

    res.redirect(`/admin/player/${targetId}`);

  } catch (error) {
    console.error(
      "Erreur action admin:",
      error
    );

    res
      .status(500)
      .send(
        "Erreur lors de l'exécution de l'action d'administration."
      );
  }
});

export const adminRoutes = router;