import React, { useState } from "react";
import {
  API_URL,
  TIME_SLOTS,
  translateStatus,
  getTodayIso,
  formatLocalInputDate,
  formatLocalInputTime
} from "../constants.js";

export default function ReservationLookup() {
  const today = getTodayIso();

  const [searchId, setSearchId] = useState("");
  const [reservation, setReservation] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editCount, setEditCount] = useState(2);
  const [editDate, setEditDate] = useState(today);
  const [editTime, setEditTime] = useState("19:00");
  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState("");

  async function fetchReservation(idToLoad) {
    const cleanId = (idToLoad ?? searchId).trim();
    if (!cleanId) return;

    const response = await fetch(`${API_URL}/reservations/${encodeURIComponent(cleanId)}`);
    if (!response.ok) {
      setReservation(null);
      setNotFound(true);
      setIsEditing(false);
      return;
    }

    const data = await response.json();
    setReservation(data);
    setNotFound(false);
    setIsEditing(false);
    setEditCount(data.guestCount);
    setEditDate(formatLocalInputDate(data.startTime));
    setEditTime(formatLocalInputTime(data.startTime));
    setEditMessage(data.guestMessage || "");
    setEditError("");
  }

  async function handleSaveModification() {
    if (!reservation) return;
    setEditError("");

    const combinedDateTime = new Date(`${editDate}T${editTime}:00`);
    const response = await fetch(`${API_URL}/reservations/${encodeURIComponent(reservation.id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestCount: Number(editCount),
        guestMessage: editMessage.trim(),
        dateTime: combinedDateTime.toISOString()
      })
    });

    const data = await response.json();
    if (!response.ok) {
      setEditError(data.error || "Erreur lors de la modification.");
      return;
    }

    await fetchReservation(reservation.id);
  }

  async function handleCancel() {
    if (!reservation) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler la réservation ${reservation.id} ?`)) {
      return;
    }

    await fetch(`${API_URL}/reservations/${encodeURIComponent(reservation.id)}`, {
      method: "DELETE"
    });
    await fetchReservation(reservation.id);
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow h-fit">
      <h2 className="text-2xl font-bold mb-2">Gérer ma réservation</h2>
      <p className="text-sm text-slate-500 mb-4">
        Entrez votre code de réservation pour consulter, modifier ou annuler votre table.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          spellCheck="false"
          autoComplete="off"
          placeholder="Ex: res-31"
          value={searchId}
          onChange={e => setSearchId(e.target.value)}
          onKeyDown={e => e.key === "Enter" && fetchReservation()}
          className="flex-1 p-2 border rounded-lg"
        />
        <button
          onClick={() => fetchReservation()}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
        >
          Rechercher
        </button>
      </div>

      <div className="mt-4">
        {notFound && (
          <p className="text-red-600 font-medium">
            Aucune réservation trouvée avec ce code.
          </p>
        )}

        {reservation && (
          <div className="p-4 border rounded-lg bg-slate-50 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-mono font-bold text-sm bg-slate-200 px-2 py-1 rounded">
                {reservation.id}
              </span>
              <span
                className={`font-bold text-sm ${
                  reservation.status === "Cancelled" ? "text-red-600" : "text-emerald-700"
                }`}
              >
                {translateStatus(reservation.status)}
              </span>
            </div>

            <p>
              <strong>Client :</strong> {reservation.guestName} ({reservation.guestCount} pers.)
            </p>
            <p>
              <strong>Table attribuée :</strong> {reservation.tableName}
            </p>
            <p>
              <strong>Horaire :</strong>{" "}
              {new Date(reservation.startTime).toLocaleString("fr-BE")}
            </p>

            {reservation.guestMessage && (
              <p>
                <strong>Message :</strong>{" "}
                <span className="italic whitespace-pre-line">{reservation.guestMessage}</span>
              </p>
            )}

            <p className="pt-1">
              <a
                href={`${API_URL}/reservations/${encodeURIComponent(reservation.id)}/email`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
              >
                📧 Voir l'aperçu de l'email envoyé
              </a>
            </p>

            {reservation.status !== "Cancelled" && (
              <>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setIsEditing(prev => !prev)}
                    className="bg-amber-500 text-slate-900 font-semibold px-3 py-1.5 rounded text-sm hover:bg-amber-600"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700"
                  >
                    Annuler
                  </button>
                </div>

                {isEditing && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <h4 className="font-bold text-sm">Modifier ma réservation</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-xs font-medium">Personnes</label>
                        <input
                          type="number"
                          min="1"
                          max="8"
                          value={editCount}
                          onChange={e => setEditCount(e.target.value)}
                          className="w-full p-1.5 border rounded text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Nouvelle date</label>
                        <input
                          type="date"
                          min={today}
                          value={editDate}
                          onChange={e => setEditDate(e.target.value)}
                          className="w-full p-1.5 border rounded text-sm bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Créneau</label>
                        <select
                          value={editTime}
                          onChange={e => setEditTime(e.target.value)}
                          className="w-full p-1.5 border rounded text-sm bg-white"
                        >
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
                      <label className="text-xs font-medium">
                        Message (allergies, occasion...)
                      </label>
                      <textarea
                        rows="2"
                        maxLength="500"
                        value={editMessage}
                        onChange={e => setEditMessage(e.target.value)}
                        className="w-full p-1.5 border rounded text-sm bg-white resize-none"
                      />
                    </div>

                    {editError && (
                      <div className="text-xs text-red-600 font-medium">{editError}</div>
                    )}

                    <button
                      onClick={handleSaveModification}
                      className="w-full bg-slate-900 text-white py-2 rounded text-sm font-semibold hover:bg-slate-800"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
