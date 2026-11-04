import { isEmail, isInt, isNotEmpty, max, min } from "class-validator";

// Validation de la création d'une réservation (POST /api/reservations)
export function validateCreateReservation(req, res, next) {
  const { guestName, guestEmail, guestPhone, guestCount, dateTime } = req.body;

  if (
    !isNotEmpty(guestName) ||
    !isNotEmpty(guestEmail) ||
    !isNotEmpty(guestPhone) ||
    !isNotEmpty(dateTime) ||
    guestCount === undefined
  ) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  if (!isEmail(String(guestEmail).trim())) {
    return res.status(400).json({ error: "Le format de l'adresse email est invalide." });
  }

  const count = Number(guestCount);
  if (!isInt(count) || !min(count, 1) || !max(count, 8)) {
    return res.status(400).json({ error: "Le nombre de couverts doit être un entier compris entre 1 et 8." });
  }

  next();
}

// Validation de la modification d'une réservation (PUT /api/reservations/:id)
export function validateUpdateReservation(req, res, next) {
  const { guestCount } = req.body;

  if (guestCount !== undefined) {
    const count = Number(guestCount);
    if (!isInt(count) || !min(count, 1) || !max(count, 8)) {
      return res.status(400).json({ error: "Le nombre de couverts doit être un entier compris entre 1 et 8." });
    }
  }

  next();
}
