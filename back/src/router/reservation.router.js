import { Router } from "express";
import reservationRepository from "../repository/reservationMemory.repository.js";

const reservationRouter = Router();

// Fonction utilitaire pour vérifier si l'horaire est dans les heures d'ouverture
function isWithinOpeningHours(parsedDate) {
  const timeInMinutes = parsedDate.getHours() * 60 + parsedDate.getMinutes();
  const isLunch = timeInMinutes >= (11 * 60 + 30) && timeInMinutes <= (14 * 60);       // 11h30 à 14h00
  const isDinner = timeInMinutes >= (19 * 60) && timeInMinutes <= (21 * 60 + 30);      // 19h00 à 21h30
  return isLunch || isDinner;
}

// GET /api/reservations
reservationRouter.get("/", (req, res) => {
  res.status(200).json(reservationRepository.getAll());
});

// GET /api/reservations/:id
reservationRouter.get("/:id", (req, res) => {
  const reservation = reservationRepository.getById(req.params.id);
  if (!reservation) {
    return res.status(404).json({ message: "Réservation introuvable." });
  }
  res.status(200).json(reservationRepository.withLiveStatus(reservation));
});

// POST /api/reservations (Création)
reservationRouter.post("/", (req, res) => {
  const { guestName, guestEmail, guestPhone, guestCount, dateTime } = req.body;

  if (!guestName || !guestEmail || !guestPhone || !guestCount || !dateTime) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  const count = Number(guestCount);
  if (isNaN(count) || count < 1 || count > 8) {
    return res.status(400).json({ error: "Le nombre de couverts doit être compris entre 1 et 8." });
  }

  const parsedDate = new Date(dateTime);
  if (isNaN(parsedDate.getTime()) || parsedDate.getTime() < Date.now()) {
    return res.status(400).json({ error: "Date invalide ou déjà passée." });
  }

  if (!isWithinOpeningHours(parsedDate)) {
    return res.status(400).json({ 
      error: "Restaurant fermé. Horaires : Midi (11h30 - 14h00) et Soir (19h00 - 21h30)." 
    });
  }

  const reservation = reservationRepository.createReservation(req.body);
  if (!reservation) {
    return res.status(409).json({ error: "Aucune table disponible pour ce créneau." });
  }

  res.status(201).json(reservationRepository.withLiveStatus(reservation));
});

// PUT /api/reservations/:id (Modification par le client)
reservationRouter.put("/:id", (req, res) => {
  const { guestCount, dateTime, guestName, guestMessage } = req.body;

  if (dateTime) {
    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime()) || parsedDate.getTime() < Date.now()) {
      return res.status(400).json({ error: "La nouvelle date est invalide ou déjà passée." });
    }
    if (!isWithinOpeningHours(parsedDate)) {
      return res.status(400).json({ error: "Horaire hors service (Midi: 11h30-14h00, Soir: 19h00-21h30)." });
    }
  }

  const result = reservationRepository.updateReservation(req.params.id, { guestCount, dateTime, guestName, guestMessage });

  if (!result) {
    return res.status(404).json({ error: "Réservation introuvable ou annulée." });
  }
  if (result.conflict) {
    return res.status(409).json({ error: "Aucune table libre pour ce nouvel horaire ou ce nombre de personnes." });
  }

  res.status(200).json(reservationRepository.withLiveStatus(result));
});

// DELETE /api/reservations/:id (Annulation)
reservationRouter.delete("/:id", (req, res) => {
  const cancelled = reservationRepository.deleteById(req.params.id);
  if (!cancelled) {
    return res.status(404).json({ message: "Réservation introuvable." });
  }
  res.status(200).json({ message: "Réservation annulée avec succès." });
});

export default reservationRouter;