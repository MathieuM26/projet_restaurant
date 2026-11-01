import React, { useState } from "react";
import { API_URL, TIME_SLOTS, getTodayIso } from "../constants.js";

export default function BookingForm() {
  const today = getTodayIso();

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [bookingDate, setBookingDate] = useState(today);
  const [bookingTime, setBookingTime] = useState("19:00");
  const [guestMessage, setGuestMessage] = useState("");
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setResult(null);

    const combinedDateTime = new Date(`${bookingDate}T${bookingTime}:00`);
    const payload = {
      guestName,
      guestEmail,
      guestPhone,
      guestCount: Number(guestCount),
      guestMessage: guestMessage.trim(),
      dateTime: combinedDateTime.toISOString()
    };

    try {
      const response = await fetch(`${API_URL}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ ok: true, data });
        setGuestName("");
        setGuestEmail("");
        setGuestPhone("");
        setGuestCount(2);
        setBookingDate(today);
        setBookingTime("19:00");
        setGuestMessage("");
      } else {
        setResult({ ok: false, error: data.message || data.error || "Erreur lors de la réservation." });
      }
    } catch {
      setResult({ ok: false, error: "Erreur de connexion avec le serveur backend." });
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-2">Réserver une table</h2>
      <p className="text-sm text-slate-500 mb-6">Réservation instantanée sans création de compte.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nom complet *</label>
          <input
            type="text"
            required
            placeholder="Ex: Jean Dupont"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Email *</label>
            <input
              type="email"
              required
              placeholder="jean@email.be"
              value={guestEmail}
              onChange={e => setGuestEmail(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Téléphone *</label>
            <input
              type="tel"
              required
              placeholder="+32 470 00 00 00"
              value={guestPhone}
              onChange={e => setGuestPhone(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium">Personnes *</label>
            <input
              type="number"
              min="1"
              max="8"
              required
              value={guestCount}
              onChange={e => setGuestCount(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date *</label>
            <input
              type="date"
              min={today}
              required
              value={bookingDate}
              onChange={e => setBookingDate(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Créneau *</label>
            <select
              required
              value={bookingTime}
              onChange={e => setBookingTime(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg bg-white"
            >
              <optgroup label="Service du Midi">
                {TIME_SLOTS.Midi.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </optgroup>
              <optgroup label="Service du Soir">
                {TIME_SLOTS.Soir.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">
            Message <span className="text-slate-400 font-normal">(facultatif)</span>
          </label>
          <textarea
            rows="3"
            maxLength="500"
            placeholder="Allergies, régime alimentaire, occasion spéciale, chaise bébé..."
            value={guestMessage}
            onChange={e => setGuestMessage(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-lg transition"
        >
          Confirmer ma réservation
        </button>
      </form>

      {result && result.ok && (
        <div className="mt-6 p-4 rounded-lg bg-emerald-100 border border-emerald-400 text-emerald-900">
          <h3 className="font-bold text-lg">✅ Réservation confirmée !</h3>
          <p className="mt-1">
            Table attribuée automatiquement : <strong>{result.data.tableName}</strong>
          </p>
          <p className="mt-1">
            Votre code unique à conserver :{" "}
            <code className="bg-white px-2 py-1 rounded font-mono font-bold">
              {result.data.id}
            </code>
          </p>
          <p className="mt-3 pt-2 border-t border-emerald-300 text-sm">
            📧 Email de confirmation envoyé à <strong>{result.data.guestEmail}</strong>.
            <a
              href={`${API_URL}/reservations/${encodeURIComponent(result.data.id)}/email`}
              target="_blank"
              rel="noreferrer"
              className="ml-2 inline-block bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-emerald-800"
            >
              Voir l'aperçu du mail
            </a>
          </p>
        </div>
      )}

      {result && !result.ok && (
        <div className="mt-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-900">
          <strong>❌ Impossible de réserver :</strong> {result.error}
        </div>
      )}
    </div>
  );
}
