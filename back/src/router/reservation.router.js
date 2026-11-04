import { Router } from "express";
import { isEmail, isInt, isNotEmpty, max, min } from "class-validator";
import reservationService from "../services/reservation.service.js";

const reservationRouter = Router();

// GET /api/reservations
reservationRouter.get("/", (req, res) => {
  res.status(200).json(reservationService.getAll());
});

// GET /api/reservations/:id/email (Aperçu de l'email)
reservationRouter.get("/:id/email", (req, res) => {
  const html = reservationService.getEmailPreviewHtml(req.params.id);
  if (!html) {
    return res.status(404).send("Réservation introuvable.");
  }
  res.status(200).type("html").send(html);
});

// GET /api/reservations/:id
reservationRouter.get("/:id", (req, res) => {
  const reservation = reservationService.getById(req.params.id);
  if (!reservation) {
    return res.status(404).json({ message: "Réservation introuvable." });
  }
  res.status(200).json(reservation);
});

// POST /api/reservations (Création : validation du format dans le routeur avec class-validator)
reservationRouter.post("/", (req, res) => {
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

  const result = reservationService.createReservation(req.body);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.status(result.status).json(result.data);
});

// PUT /api/reservations/:id (Modification : validation du format dans le routeur)
reservationRouter.put("/:id", (req, res) => {
  const { guestCount } = req.body;

  if (guestCount !== undefined) {
    const count = Number(guestCount);
    if (!isInt(count) || !min(count, 1) || !max(count, 8)) {
      return res.status(400).json({ error: "Le nombre de couverts doit être un entier compris entre 1 et 8." });
    }
  }

  const result = reservationService.updateReservation(req.params.id, req.body);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.status(result.status).json(result.data);
});

// DELETE /api/reservations/:id (Annulation)
reservationRouter.delete("/:id", (req, res) => {
  const result = reservationService.cancelReservation(req.params.id);
  if (!result) {
    return res.status(404).json({ message: "Réservation introuvable." });
  }
  res.status(200).json(result);
});

export default reservationRouter;
