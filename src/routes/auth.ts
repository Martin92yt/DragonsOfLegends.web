import { Router } from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { consola } from "consola";
import { accountsCollection, resolvePlayer } from "../config.js";
import { renderLoginPage } from "../pages/login.js";
import { renderRegisterPage } from "../pages/register.js";
import { VERSION } from "../config.js";
import { renderProfilePage } from "../pages/profil.js";

const router = Router();

// Rate limiter pour le login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Trop de tentatives de connexion, réessayez plus tard."
});

router.get("/login", (req, res) => {
  if (req.session?.user) return res.redirect("/");
  res.send(renderLoginPage(VERSION, (req.query.error as string) || null));
});

router.get("/register", (req, res) => {
  if (req.session?.user) return res.redirect("/");
  res.send(renderRegisterPage(VERSION, (req.query.error as string) || null));
});

router.post("/register", async (req, res) => {
  try {
    const { username, password, terms } = req.body;
    if (!username || !password) return res.redirect("/register?error=missing_fields");
    if (!terms) return res.redirect("/register?error=terms_not_accepted");

    const sanitizedUsername = String(username).trim();
    if (password.length < 6) return res.redirect("/register?error=password_too_short");

    const existingAccount = await accountsCollection.findOne({ 
      username: { $regex: new RegExp(`^${sanitizedUsername}$`, "i") } 
    });
    
    if (existingAccount) {
      return res.redirect("/register?error=username_taken");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountId = sanitizedUsername.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const role = sanitizedUsername.toLowerCase() === "admin" ? "admin" : "player";
    
    await accountsCollection.insertOne({
      id: accountId,
      username: sanitizedUsername,
      password: hashedPassword,
      role: role, // <--- Ajout du rôle
      createdAt: new Date()
    });

    req.session.regenerate((err) => {
      if (err) return res.redirect("/register?error=server_error");
      req.session.user = { id: accountId, username: sanitizedUsername };
      res.redirect("/");
    });
  } catch (error) {
    consola.error("Error during registration:", error);
    res.redirect("/register?error=server_error");
  }
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.redirect("/login?error=missing_fields");

    const sanitizedUsername = String(username).trim();
    const account = await accountsCollection.findOne({ 
      username: { $regex: new RegExp(`^${sanitizedUsername}$`, "i") } 
    });

    if (!account || !(await bcrypt.compare(password, account.password))) {
      return res.redirect("/login?error=invalid_credentials");
    }

    req.session.regenerate((err) => {
      if (err) return res.redirect("/login?error=server_error");
      req.session.user = { id: account.id, username: account.username };
      res.redirect("/");
    });
  } catch (error) {
    consola.error("Error during login:", error);
    res.redirect("/login?error=server_error");
  }
});

router.post("/account/change-password", async (req, res) => {
  try {
    if (!req.session.user) return res.redirect("/login");
    const { currentPassword, newPassword } = req.body;
    const sessionUser = req.session.user;

    const account = await accountsCollection.findOne({ id: sessionUser.id });
    if (!account) return res.redirect("/login");

    const isValid = await bcrypt.compare(currentPassword, account.password);
    if (!isValid) return res.status(400).send("Mot de passe actuel incorrect.");

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).send("Le nouveau mot de passe doit faire au moins 6 caractères.");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await accountsCollection.updateOne(
      { id: sessionUser.id },
      { $set: { password: hashedNewPassword } }
    );

    res.redirect("/?success=password_updated");
  } catch (error) {
    consola.error("Error changing password:", error);
    res.status(500).send("Internal server error");
  }
});

router.get('/profil', async (req, res) => {
    try {
        const username = req.query.user as string;
        if (!username) {
            return res.status(400).send("Nom d'aventurier manquant.");
        }

        const targetAccount = await accountsCollection.findOne({ username });
        if (!targetAccount) {
            return res.status(404).send("Aventurier introuvable.");
        }

        // Résolution de l'objet joueur complet du RPG
        const targetPlayer = await resolvePlayer({
            id: targetAccount.id,
            username: targetAccount.username
        });

        let partnerAccount = null;
        
        // Utilisation sécurisée de la méthode publique getPartnerId()
        const partnerId = typeof targetPlayer?.marriage?.getPartnerId === 'function' 
            ? targetPlayer.marriage.getPartnerId() 
            : null;

        if (partnerId) {
            const pAcc = await accountsCollection.findOne({ id: partnerId });
            if (pAcc) {
                partnerAccount = await resolvePlayer({ id: pAcc.id, username: pAcc.username });
            }
        }

        const html = renderProfilePage(VERSION, targetPlayer, partnerAccount);
        res.send(html);
    } catch (error) {
        consola.error("Failed to load profile page:", error);
        res.status(500).send("Erreur lors du chargement du profil.");
    }
});

router.all("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect("/login");
  });
});

export const authRoutes = router;