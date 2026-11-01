import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Chargement automatique du fichier back/.env s'il existe
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", "..", ".env");

if (fs.existsSync(ENV_PATH)) {
  const lines = fs.readFileSync(ENV_PATH, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex > 0) {
      const key = trimmed.slice(0, eqIndex).trim();
      const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

class MailService {
  // Conserve le dernier type d'email envoyé par réservation ("confirmation", "modification", "cancellation")
  lastEmailType = new Map();

  // Vérifie si une vraie clé API Brevo est configurée dans back/.env
  isBrevoConfigured() {
    const key = process.env.BREVO_API_KEY;
    const sender = process.env.BREVO_SENDER_EMAIL;
    return Boolean(
      key &&
      sender &&
      key !== "votre_cle_api_brevo_ici" &&
      !sender.includes("exemple.be")
    );
  }

  getPreviewUrl(reservationId) {
    return `http://localhost:5000/api/reservations/${encodeURIComponent(reservationId)}/email`;
  }

  sendConfirmationEmail(reservation) {
    return this.dispatchEmail(reservation, "confirmation");
  }

  sendModificationEmail(reservation) {
    return this.dispatchEmail(reservation, "modification");
  }

  sendCancellationEmail(reservation) {
    return this.dispatchEmail(reservation, "cancellation");
  }

  // Orchestre l'envoi : envoie via l'API Brevo si configurée + génère toujours le lien d'aperçu
  dispatchEmail(reservation, type) {
    this.lastEmailType.set(reservation.id.toLowerCase(), {
      type,
      sentAt: new Date().toISOString()
    });

    const previewUrl = this.getPreviewUrl(reservation.id);
    const { subject, emailHtml } = this.buildEmailContent(reservation, type);

    if (this.isBrevoConfigured()) {
      this.sendViaBrevoApi({
        toEmail: reservation.guestEmail,
        toName: reservation.guestName,
        subject,
        htmlContent: emailHtml,
        reservationId: reservation.id
      });
    } else {
      console.log(
        `[MAIL SERVICE - DÉMO] 📧 Email (${type}) préparé pour ${reservation.guestEmail} (Réf: ${reservation.id}) -> Aperçu : ${previewUrl}`
      );
    }

    return previewUrl;
  }

  // Appel HTTP vers l'API transactionnelle officielle de Brevo (v3/smtp/email)
  async sendViaBrevoApi({ toEmail, toName, subject, htmlContent, reservationId }) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Restaurant Le Gourmet";

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "content-type": "application/json",
          "api-key": apiKey
        },
        body: JSON.stringify({
          sender: { name: senderName, email: senderEmail },
          to: [{ email: toEmail, name: toName }],
          subject,
          htmlContent
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          `[BREVO API] ✅ Email réel envoyé à ${toEmail} (Réf: ${reservationId}, MessageId: ${result.messageId})`
        );
      } else {
        const errText = await response.text();
        console.error(`[BREVO API] ❌ Erreur lors de l'envoi à ${toEmail} :`, errText);
      }
    } catch (err) {
      console.error(`[BREVO API] ❌ Erreur réseau vers Brevo :`, err.message);
    }
  }

  // Construit l'objet et le corps HTML de l'email (utilisé à la fois par Brevo et par l'aperçu Webmail)
  buildEmailContent(reservation, forcedType = null) {
    const meta = this.lastEmailType.get(reservation.id.toLowerCase()) || {
      type: forcedType || (reservation.status === "Cancelled" ? "cancellation" : "confirmation")
    };
    const type = forcedType || meta.type;

    const isCancelled = reservation.status === "Cancelled" || type === "cancellation";
    const isModified = !isCancelled && type === "modification";

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

    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, sans-serif; color: #1e293b; max-width: 580px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; color: #0f172a;">🍽️ Restaurant Le Gourmet</h1>
        </div>
        <div style="background: ${badgeColor}; color: white; text-align: center; padding: 12px; border-radius: 8px; font-weight: 700; margin-bottom: 24px;">
          ${badgeLabel}
        </div>
        <p>Bonjour <strong>${escapeHtml(reservation.guestName)}</strong>,</p>
        <p>${
          isCancelled
            ? "Nous vous confirmons l'annulation de votre réservation au sein de notre établissement."
            : isModified
            ? "Votre réservation a bien été mise à jour. Voici votre nouveau récapitulatif :"
            : "Nous avons le plaisir de vous confirmer votre réservation. Voici les détails à conserver :"
        }</p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Code de réservation :</strong> <span style="font-family: monospace; background: #0f172a; color: #f59e0b; padding: 3px 8px; border-radius: 4px; font-weight: 700;">${escapeHtml(reservation.id)}</span></p>
          <p style="margin: 8px 0;"><strong>Date :</strong> ${escapeHtml(formattedDate)}</p>
          <p style="margin: 8px 0;"><strong>Heure d'arrivée :</strong> ${escapeHtml(formattedTime)}</p>
          <p style="margin: 8px 0;"><strong>Nombre de couverts :</strong> ${reservation.guestCount} personne(s)</p>
          <p style="margin: 8px 0;"><strong>Table attribuée :</strong> ${escapeHtml(reservation.tableName)}</p>
          ${
            reservation.guestMessage
              ? `<p style="margin: 8px 0;"><strong>Note / Allergies :</strong> <em>${escapeHtml(reservation.guestMessage)}</em></p>`
              : ""
          }
        </div>

        <p style="font-size: 14px; color: #475569;">
          Vous pouvez consulter, modifier ou annuler votre réservation à tout moment en utilisant votre code unique <strong>${escapeHtml(reservation.id)}</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="text-align: center; font-size: 12px; color: #64748b;">
          Restaurant Le Gourmet • Service du Midi (11h30 - 14h00) &amp; Soir (19h00 - 21h30)
        </p>
      </div>
    `;

    return { subject, emailHtml };
  }

  // Génère la page d'aperçu Webmail dans le navigateur
  renderEmailPreviewHtml(reservation) {
    const { subject, emailHtml } = this.buildEmailContent(reservation);
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "reservation@legourmet.be";
    const modeLabel = this.isBrevoConfigured()
      ? "🟢 Connecté à l'API Brevo (Envoi réel actif)"
      : "🟠 Mode Démo local (Ajoutez back/.env pour activer Brevo)";

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
  </style>
</head>
<body>
  <div class="container">
    <div class="webmail-bar">
      <span>📬 ${modeLabel}</span>
      <span class="webmail-badge">BREVO / APERÇU</span>
    </div>
    <div class="headers">
      <div><strong>De :</strong> Le Gourmet &lt;${escapeHtml(senderEmail)}&gt;</div>
      <div><strong>À :</strong> ${escapeHtml(reservation.guestName)} &lt;${escapeHtml(reservation.guestEmail)}&gt;</div>
      <div><strong>Objet :</strong> ${escapeHtml(subject)}</div>
    </div>
    <div class="content">
      ${emailHtml}
    </div>
  </div>
</body>
</html>`;
  }
}

export default new MailService();
