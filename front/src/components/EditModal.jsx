import React, { useEffect, useState } from "react";
import {
  API_URL,
  TIME_SLOTS,
  getTodayIso,
  formatLocalInputDate,
  formatLocalInputTime
} from "../constants.js";

export default function EditModal({ reservation, onClose, onSaved }) {
  const today = getTodayIso();

  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [editDate, setEditDate] = useState(today);
  const [editTime, setEditTime] = useState("19:00");
  const [guestMessage, setGuestMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reservation) return;
    setGuestName(reservation.guestName || "");
    setGuestCount(reservation.guestCount || 2);
    setEditDate(formatLocalInputDate(reservation.startTime));
    setEditTime(formatLocalInputTime(reservation.startTime));
    setGuestMessage(reservation.guestMessage || "");
    setError("");
  }, [reservation]);

  if (!reservation) return null;

  const allSlots = [...TIME_SLOTS.Midi, ...TIME_SLOTS.Soir];
  const hasCustomTime = !allSlots.includes(editTime);

  async function handleSave() {
    setError("");
    if (!guestName.trim() || !editDate || !editTime) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    const combinedDateTime = new Date(`${editDate}T${editTime}:00`);

    try {
      const response = await fetch(
        `${API_URL}/reservations/${encodeURIComponent(reservation.id)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            guestName: guestName.trim(),
            guestCount: Number(guestCount),
            guestMessage: guestMessage.trim(),
            dateTime: combinedDateTime.toISOString()
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Erreur lors de la modification.");
        return;
      }

      onSaved();
    } catch {
      setError("Erreur de connexion avec le serveur backend.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">
            Modifier la réservation{" "}
            <span className="font-mono text-sm bg-slate-200 px-2 py-1 rounded">
              {reservation.id}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium">Nom du client</label>
          <input
            type="text"
            value={guestName}
            onChange={e => setGuestName(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">Personnes</label>
            <input
              type="number"
              min="1"
              max="8"
              value={guestCount}
              onChange={e => setGuestCount(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              min={today}
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Créneau</label>
            <select
              value={editTime}
              onChange={e => setEditTime(e.target.value)}
              className="w-full mt-1 p-2 border rounded-lg bg-white"
            >
              {hasCustomTime && (
                <option value={editTime}>{editTime} (actuel)</option>
              )}
              <optgroup label="Midi">
                {TIME_SLOTS.Midi.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
              <optgroup label="Soir">
                {TIME_SLOTS.Soir.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Message du client</label>
          <textarea
            rows="3"
            maxLength="500"
            value={guestMessage}
            onChange={e => setGuestMessage(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg resize-none"
          />
        </div>

        {error && <div className="text-sm text-red-600 font-medium">{error}</div>}

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
