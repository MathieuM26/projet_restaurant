import express from "express";
import cors from "cors";

import userRouter from "./router/user.router.js";
import tablesRouter from "./router/tables.router.js";
import reservationRouter from "./router/reservation.router.js";

const app = express();

// 1. Autoriser les requêtes cross-origin (pour votre futur front-end)
app.use(cors());

// 2. Parser le corps des requêtes en JSON
app.use(express.json());

// 3. Déclaration des routes de l'API
app.use("/api/users", userRouter);
app.use("/api/tables", tablesRouter);
app.use("/api/reservations", reservationRouter);

// Route d'accueil
app.get("/", (req, res) => {
  res.send("API Restaurant en mémoire en ligne sur http://localhost:5000");
});

// 4. Gestion des routes inexistantes (404 Not Found)
app.use((req, res) => {
  res.status(404).json({ error: `La route ${req.originalUrl} n'existe pas.` });
});

// 5. Middleware centralisé de gestion des erreurs (500)
app.use((err, req, res, next) => {
  console.error("Erreur serveur inattendue :", err.stack);
  res.status(500).json({ error: "Une erreur interne est survenue sur le serveur." });
});

// Démarrage du serveur
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});