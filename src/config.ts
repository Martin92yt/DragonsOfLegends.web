import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { MongoClient, Collection, Document } from "mongodb";
import { World, PlayerClass } from "dragons-of-legends.js";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const VERSION = "0.1.3-alpha.6";
export const MONGODB_URI = process.env.MONGODB_URI || "";

// Connexion MongoDB
export const mongoClient = new MongoClient(MONGODB_URI);
export let accountsCollection: Collection<Document>;

export async function initializeDatabase() {
  try {
    await mongoClient.connect();
    const db = mongoClient.db();
    accountsCollection = db.collection("dragons-of-legends");
  } catch (error) {
    console.error("Failed to connect to Accounts MongoDB:", error);
    process.exit(1);
  }
}

// Instance du Monde RPG
export const rpg = new World({ 
  premadeMap: true, 
  checkUpdates: true,
  deathMode: "hardcore", 
  database: { 
    adapter: "mongodb", 
    path: "./data.db", 
    uri: MONGODB_URI 
  }
} as any);

// Helper joueur
export const resolvePlayer = async (sessionUser: { id: string; username: string }) => {
  return await rpg.players.ensure({
    id: sessionUser.id,
    name: sessionUser.username,
    playerClass: PlayerClass.Explorer
  });
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.session || !req.session.user) {
    res.redirect("/login");
    return;
  }

  try {
    const account = await accountsCollection.findOne({ id: req.session.user.id });
    if (!account || account.role !== "admin") {
      res.status(403).send("Accès refusé : Réservé aux administrateurs.");
      return;
    }
    next();
  } catch (error) {
    res.status(500).send("Erreur serveur lors de la vérification des droits.");
  }
};