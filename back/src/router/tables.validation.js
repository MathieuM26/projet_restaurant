import { isInt, isNotEmpty, min } from "class-validator";

// Validation de l'ajout d'une table (POST /api/tables)
export function validateCreateTable(req, res, next) {
  const { number, capacity } = req.body;
  const cap = Number(capacity);

  if (!isNotEmpty(number) || !isInt(cap) || !min(cap, 1)) {
    return res.status(400).json({ message: "Numéro et capacité valide (>= 1) requis." });
  }

  next();
}
