import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DatabaseSync } from "node:sqlite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");
fs.mkdirSync(DATA_DIR, { recursive: true });

export const DB_PATH = path.join(DATA_DIR, "restaurant.sqlite");

// Connexion à la base de données relationnelle SQLite
const db = new DatabaseSync(DB_PATH);

// Activation de l'intégrité référentielle (clés étrangères SQL)
db.exec("PRAGMA journal_mode = DELETE;");
db.exec("PRAGMA foreign_keys = ON;");

// Création du schéma relationnel SQL (Tables, Utilisateurs, Réservations)
db.exec(`
  CREATE TABLE IF NOT EXISTS tables (
    id TEXT PRIMARY KEY,
    number TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity >= 1),
    isActive INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'Staff',
    active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    tableId TEXT NOT NULL,
    tableName TEXT NOT NULL,
    guestName TEXT NOT NULL,
    guestEmail TEXT NOT NULL,
    guestPhone TEXT NOT NULL,
    guestCount INTEGER NOT NULL CHECK (guestCount BETWEEN 1 AND 8),
    guestMessage TEXT NOT NULL DEFAULT '',
    startTime TEXT NOT NULL,
    endTime TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Confirmed'
  );
`);

export default db;
