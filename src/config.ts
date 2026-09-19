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