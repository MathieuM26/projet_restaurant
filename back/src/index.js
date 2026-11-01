import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import userRouter from "./router/user.router.js";
import tablesRouter from "./router/tables.router.js";
import reservationRouter from "./router/reservation.router.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONT_DIST_DIR = path.join(__dirname, "..", "..", "front", "dist");
const FRONT_DIR = fs.existsSync(FRONT_DIST_DIR)
  ? FRONT_DIST_DIR
  : path.join(__dirname, "..", "..", "front");

const app = express();

// 1. Autoriser les requêtes cross-origin (notamment pour Vite sur http://localhost:5173)
app.use(cors());

// 2. Parser le corps des requêtes en JSON
app.use(express.json());

// 3. Servir l'application React compilée sur http://localhost:5000
app.use(express.static(FRONT_DIR));

// 4. Déclaration des routes de l'API
app.use("/api/users", userRouter);
app.use("/api/tables", tablesRouter);
app.use("/api/reservations", reservationRouter);

// 5. Gestion des routes inexistantes (404 Not Found)
app.use((req, res) => {
  res.status(404).json({ error: `La route ${req.originalUrl} n'existe pas.` });
});

// 6. Middleware centralisé de gestion des erreurs (500)
app.use((err, req, res, next) => {
  console.error("Erreur serveur inattendue :", err.stack);
  res.status(500).json({ error: "Une erreur interne est survenue sur le serveur." });
});

// Démarrage du serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
