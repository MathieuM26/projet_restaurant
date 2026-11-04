import { Router } from "express";
import reservationService from "../services/reservation.service.js";
import {
  validateCreateReservation,
  validateUpdateReservation
} from "./reservation.validation.js";

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

// POST /api/reservations (Création)
reservationRouter.post("/", validateCreateReservation, (req, res) => {
  const result = reservationService.createReservation(req.body);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.status(result.status).json(result.data);
});

// PUT /api/reservations/:id (Modification)
reservationRouter.put("/:id", validateUpdateReservation, (req, res) => {
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
