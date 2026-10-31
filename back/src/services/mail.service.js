// Service dédié à la gestion et à l'envoi des emails (Mode Démo avec prévisualisation HTML)

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

class MailService {
  // conserve le dernier type d'email envoyé par réservation ("confirmation", "modification", "cancellation")
  lastEmailType = new Map();

  getPreviewUrl(reservationId) {
    return `http://localhost:5000/api/reservations/${encodeURIComponent(reservationId)}/email`;
  }

  sendConfirmationEmail(reservation) {
    this.lastEmailType.set(reservation.id.toLowerCase(), {
      type: "confirmation",
      sentAt: new Date().toISOString()
    });
    const previewUrl = this.getPreviewUrl(reservation.id);
    console.log(`[MAIL SERVICE] 📧 Email de CONFIRMATION envoyé à ${reservation.guestEmail} (Réf: ${reservation.id}) -> Aperçu : ${previewUrl}`);
    return previewUrl;
  }

  sendModificationEmail(reservation) {
    this.lastEmailType.set(reservation.id.toLowerCase(), {
      type: "modification",
      sentAt: new Date().toISOString()
    });
    const previewUrl = this.getPreviewUrl(reservation.id);
    console.log(`[MAIL SERVICE] 📧 Email de MODIFICATION envoyé à ${reservation.guestEmail} (Réf: ${reservation.id}) -> Aperçu : ${previewUrl}`);
    return previewUrl;
  }

  sendCancellationEmail(reservation) {
    this.lastEmailType.set(reservation.id.toLowerCase(), {
      type: "cancellation",
      sentAt: new Date().toISOString()
    });
    const previewUrl = this.getPreviewUrl(reservation.id);
    console.log(`[MAIL SERVICE] 📧 Email d'ANNULATION envoyé à ${reservation.guestEmail} (Réf: ${reservation.id}) -> Aperçu : ${previewUrl}`);
    return previewUrl;
  }

  // Génère un aperçu Webmail HTML réaliste pour la démonstration
  renderEmailPreviewHtml(reservation) {
    const meta = this.lastEmailType.get(reservation.id.toLowerCase()) || {
      type: reservation.status === "Cancelled" ? "cancellation" : "confirmation",
      sentAt: reservation.startTime
    };

    const isCancelled = reservation.status === "Cancelled" || meta.type === "cancellation";
    const isModified = !isCancelled && meta.type === "modification";

    const subject = isCancelled
      ? `Annulation de votre réservation ${reservation.id} — Le Gourmet`
      : isModified
      ? `Mise à jour de votre réservation ${reservation.id} — Le Gourmet`
      : `Confirmation de votre réservation ${reservation.id} — Le Gourmet`;

    const badgeColor = isCancelled ? "#dc2626" : isModified ? "#d97706" : "#059669";
    const badgeLabel = isCancelled
      ? "❌ Réservation annulée"
      : isModified
      ? "✏️ Réservation modifiée"
      : "✅ Réservation confirmée";

    const formattedDate = new Date(reservation.startTime).toLocaleDateString("fr-BE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const formattedTime = new Date(reservation.startTime).toLocaleTimeString("fr-BE", {
      hour: "2-digit",
      minute: "2-digit"
    });

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Aperçu Email - ${escapeHtml(subject)}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .webmail-bar { background: #1e293b; color: #f8fafc; padding: 12px 20px; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
    .webmail-badge { background: #f59e0b; color: #0f172a; font-weight: 700; padding: 3px 8px; border-radius: 4px; font-size: 11px; }
    .headers { background: #f8fafc; padding: 16px 24px; border-bottom: 1px solid #e2e8f0; font-size: 14px; line-height: 1.7; }
    .headers strong { color: #475569; display: inline-block; width: 70px; }
    .content { padding: 32px 24px; }
    .brand { text-align: center; margin-bottom: 24px; }
    .brand h1 { margin: 0; font-size: 24px; color: #0f172a; }
    .status-banner { background: ${badgeColor}; color: white; text-align: center; padding: 12px; border-radius: 8px; font-weight: 700; margin-bottom: 24px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 15px; }
    .row:last-child { border-bottom: none; }
    .code { font-family: monospace; background: #0f172a; color: #f59e0b; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 16px; }
    .footer { background: #f8fafc; padding: 16px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="webmail-bar">
      <span>📬 Simulation Webmail (Couche Service - Mode Démo)</span>
      <span class="webmail-badge">APERÇU EMAIL</span>
    </div>
    <div class="headers">
      <div><strong>De :</strong> Le Gourmet &lt;reservation@legourmet.be&gt;</div>
      <div><strong>À :</strong> ${escapeHtml(reservation.guestName)} &lt;${escapeHtml(reservation.guestEmail)}&gt;</div>
      <div><strong>Objet :</strong> ${escapeHtml(subject)}</div>
    </div>
    <div class="content">
      <div class="brand">
        <h1>🍽️ Restaurant Le Gourmet</h1>
      </div>
      <div class="status-banner">${badgeLabel}</div>
      <p>Bonjour <strong>${escapeHtml(reservation.guestName)}</strong>,</p>
      <p>${
        isCancelled
          ? "Nous vous confirmons l'annulation de votre réservation au sein de notre établissement."
          : isModified
          ? "Votre réservation a bien été mise à jour. Voici votre nouveau récapitulatif :"
          : "Nous avons le plaisir de vous confirmer votre réservation. Voici les détails à conserver :"
      }</p>

      <div class="card">
        <div class="row">
          <span>Code de réservation :</span>
          <span class="code">${escapeHtml(reservation.id)}</span>
        </div>
        <div class="row">
          <span>Date :</span>
          <strong>${escapeHtml(formattedDate)}</strong>
        </div>
        <div class="row">
          <span>Heure d'arrivée :</span>
          <strong>${escapeHtml(formattedTime)}</strong>
        </div>
        <div class="row">
          <span>Nombre de couverts :</span>
          <strong>${reservation.guestCount} personne(s)</strong>
        </div>
        <div class="row">
          <span>Table attribuée :</span>
          <strong>${escapeHtml(reservation.tableName)}</strong>
        </div>
        ${
          reservation.guestMessage
            ? `<div class="row"><span>Note / Allergies :</span><em>${escapeHtml(reservation.guestMessage)}</em></div>`
            : ""
        }
      </div>

      <p style="font-size: 14px; color: #475569;">
        Vous pouvez consulter, modifier ou annuler votre réservation à tout moment depuis notre site en utilisant votre code unique <strong>${escapeHtml(reservation.id)}</strong>.
      </p>
    </div>
    <div class="footer">
      Restaurant Le Gourmet • Service du Midi (11h30 - 14h00) &amp; Soir (19h00 - 21h30)<br>
      Cet email a été généré automatiquement par <code>mail.service.js</code>.
    </div>
  </div>
</body>
</html>`;
  }
}

export default new MailService();
