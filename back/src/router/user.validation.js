import { isEmail, isNotEmpty } from "class-validator";

// Validation de la connexion utilisateur (POST /api/users/login)
export function validateLogin(req, res, next) {
  const { email } = req.body;

  if (!isNotEmpty(email)) {
    return res.status(400).json({ error: "L'adresse email est requise." });
  }
  if (!isEmail(String(email).trim())) {
    return res.status(400).json({ error: "Le format de l'adresse email est invalide." });
  }

  next();
}
