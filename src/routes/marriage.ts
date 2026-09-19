import { Router } from "express";
import { accountsCollection, rpg, VERSION } from "../config.js";
import { renderMarriagePage } from "../pages/marriage.js";

const router = Router();

// 0. AFFICHER LA PAGE DE GESTION DU MARIAGE
router.get("/marriage", async (req, res) => {
  try {
    const currentUserId = req.session.user?.id;
    if (!currentUserId) {
      return res.redirect("/login");
    }

    const account = await accountsCollection.findOne({ id: currentUserId }, { projection: { password: 0 } });
    const player: any = await rpg.players.get(currentUserId);

    let partnerAccount = null;
    // Utilisation d'un cast 'any' pour contourner la restriction de visibilité private
    const marriageObj = player?.marriage as any;
    const partnerId = marriageObj?.partnerId || (typeof marriageObj?.getPartnerId === 'function' ? marriageObj.getPartnerId() : null);

    if (partnerId) {
      partnerAccount = await accountsCollection.findOne({ id: partnerId }, { projection: { password: 0 } });
    }

    const html = renderMarriagePage(VERSION, account, player, partnerAccount);
    res.send(html);
  } catch (error) {
    console.error("Erreur chargement page mariage :", error);
    res.status(500).send("Erreur lors du chargement de la page de mariage.");
  }
});

// 1. PROPOSITION DE MARIAGE
router.post("/marriage/propose", async (req, res) => {
  try {
    const currentUserId = req.session.user?.id;
    const { targetUsername } = req.body;

    if (!currentUserId) {
      return res.status(401).send("Non authentifié.");
    }

    if (!targetUsername) {
      return res.status(400).send("Veuillez spécifier un aventurier.");
    }

    const player: any = await rpg.players.get(currentUserId);
    const targetAccount = await accountsCollection.findOne({ username: targetUsername.trim() });

    if (!targetAccount) {
      return res.status(404).send("Aventurier introuvable.");
    }

    if (targetAccount.id === currentUserId) {
      return res.status(400).send("Vous ne pouvez pas vous marier avec vous-même !");
    }

    const targetPlayer: any = await rpg.players.get(targetAccount.id);

    if (!player || !targetPlayer) {
      return res.status(404).send("Données de personnage introuvables.");
    }

    const playerMarriage = player.marriage as any;
    const targetMarriage = targetPlayer.marriage as any;

    const playerPartnerId = playerMarriage?.partnerId || (typeof playerMarriage?.getPartnerId === 'function' ? playerMarriage.getPartnerId() : null);
    const targetPartnerId = targetMarriage?.partnerId || (typeof targetMarriage?.getPartnerId === 'function' ? targetMarriage.getPartnerId() : null);

    if (playerPartnerId || targetPartnerId) {
      return res.status(400).send("L'un des deux aventuriers est déjà marié.");
    }

    // Modification via un cast explicite pour contourner le modificateur private
    if (playerMarriage) playerMarriage.partnerId = targetPlayer.id;
    if (targetMarriage) targetMarriage.partnerId = player.id;

    await rpg.players.save(player);
    await rpg.players.save(targetPlayer);

    res.redirect("/marriage");
  } catch (error) {
    console.error("Erreur proposition de mariage :", error);
    res.status(500).send("Erreur lors de la demande de mariage.");
  }
});

// 2. ACTION DE DIVORCE / SÉPARATION
router.post("/marriage/divorce", async (req, res) => {
  try {
    const currentUserId = req.session.user?.id;

    if (!currentUserId) {
      return res.status(401).send("Non authentifié.");
    }

    const player: any = await rpg.players.get(currentUserId);
    const playerMarriage = player?.marriage as any;
    const partnerId = playerMarriage?.partnerId || (typeof playerMarriage?.getPartnerId === 'function' ? playerMarriage.getPartnerId() : null);

    if (!player || !partnerId) {
      return res.status(400).send("Vous n'êtes pas marié.");
    }

    const partnerPlayer: any = await rpg.players.get(partnerId);
    const partnerMarriage = partnerPlayer?.marriage as any;

    if (playerMarriage) {
      playerMarriage.partnerId = '';
    }
    
    if (partnerMarriage) {
      partnerMarriage.partnerId = '';
      await rpg.players.save(partnerPlayer);
    }

    await rpg.players.save(player);

    res.redirect("/marriage");
  } catch (error) {
    console.error("Erreur divorce :", error);
    res.status(500).send("Erreur lors de la procédure de divorce.");
  }
});

export const marriageRoutes = router;