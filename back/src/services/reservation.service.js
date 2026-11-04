import reservationRepository from "../repository/reservationMemory.repository.js";
import mailService from "./mail.service.js";

class ReservationService {
  // Règle métier : vérifie si l'horaire est dans les heures d'ouverture du restaurant
  isWithinOpeningHours(parsedDate) {
    const timeInMinutes = parsedDate.getHours() * 60 + parsedDate.getMinutes();
    const isLunch = timeInMinutes >= 11 * 60 + 30 && timeInMinutes <= 14 * 60;  // 11h30 à 14h00
    const isDinner = timeInMinutes >= 19 * 60 && timeInMinutes <= 21 * 60 + 30; // 19h00 à 21h30
    return isLunch || isDinner;
  }

  getAll() {
    return reservationRepository.getAll();
  }

  getById(id) {
    const reservation = reservationRepository.getById(id);
    if (!reservation) return null;
    return {
      ...reservationRepository.withLiveStatus(reservation),
      emailPreviewUrl: mailService.getPreviewUrl(reservation.id)
    };
  }

  createReservation(data) {
    const { guestEmail, dateTime } = data;

    const parsedDate = new Date(dateTime);
    if (isNaN(parsedDate.getTime()) || parsedDate.getTime() < Date.now()) {
      return { status: 400, error: "Date invalide ou déjà passée." };
    }

    if (!this.isWithinOpeningHours(parsedDate)) {
      return {
        status: 400,
        error: "Restaurant fermé. Horaires : Midi (11h30 - 14h00) et Soir (19h00 - 21h30)."
      };
    }

    const reservation = reservationRepository.createReservation({
      ...data,
      guestEmail: String(guestEmail).trim()
    });
    if (!reservation) {
      return { status: 409, error: "Aucune table disponible pour ce créneau." };
    }

    // Envoi de l'email de confirmation via le service Mail (Brevo / Mode Démo)
    const emailPreviewUrl = mailService.sendConfirmationEmail(reservation);

    return {
      status: 201,
      data: {
        ...reservationRepository.withLiveStatus(reservation),
        emailPreviewUrl
      }
    };
  }

  updateReservation(id, data) {
    const { guestCount, dateTime, guestName, guestMessage } = data;

    if (dateTime) {
      const parsedDate = new Date(dateTime);
      if (isNaN(parsedDate.getTime()) || parsedDate.getTime() < Date.now()) {
        return { status: 400, error: "La nouvelle date est invalide ou déjà passée." };
      }
      if (!this.isWithinOpeningHours(parsedDate)) {
        return {
          status: 400,
          error: "Horaire hors service (Midi: 11h30-14h00, Soir: 19h00-21h30)."
        };
      }
    }

    const result = reservationRepository.updateReservation(id, {
      guestCount,
      dateTime,
      guestName,
      guestMessage
    });

    if (!result) {
      return { status: 404, error: "Réservation introuvable ou annulée." };
    }
    if (result.conflict) {
      return {
        status: 409,
        error: "Aucune table libre pour ce nouvel horaire ou ce nombre de personnes."
      };
    }

    // Envoi de l'email de mise à jour via le service Mail
    const emailPreviewUrl = mailService.sendModificationEmail(result);

    return {
      status: 200,
      data: {
        ...reservationRepository.withLiveStatus(result),
        emailPreviewUrl
      }
    };
  }

  cancelReservation(id) {
    const existing = reservationRepository.getById(id);
    if (!existing) return null;

    const cancelled = reservationRepository.deleteById(id);
    if (!cancelled) return null;

    // Envoi de l'email d'annulation via le service Mail
    const emailPreviewUrl = mailService.sendCancellationEmail(existing);

    return {
      message: "Réservation annulée avec succès.",
      emailPreviewUrl
    };
  }

  getEmailPreviewHtml(id) {
    const reservation = reservationRepository.getById(id);
    if (!reservation) return null;
    return mailService.renderEmailPreviewHtml(reservationRepository.withLiveStatus(reservation));
  }
}

export default new ReservationService();
