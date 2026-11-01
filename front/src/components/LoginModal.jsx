import React, { useEffect, useState } from "react";
import { API_URL } from "../constants.js";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setError("");
    fetch(`${API_URL}/users`)
      .then(res => (res.ok ? res.json() : []))
      .then(data => setUsers(data))
      .catch(() => setUsers([]));
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit() {
    setError("");
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Veuillez entrer une adresse email.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Identifiant incorrect.");
        return;
      }

      onLoginSuccess(data);
    } catch {
      setError("Erreur de connexion au serveur backend.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Connexion Restaurateur</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Accès réservé au personnel du restaurant (Admin / Staff).
        </p>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Sélection rapide (Démo)
          </label>
          <select
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
          >
            <option value="">-- Choisir un utilisateur (Démo) --</option>
            {users.map(u => (
              <option key={u.id} value={u.email}>
                {u.name} ({u.role}) - {u.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Email professionnel
          </label>
          <input
            type="email"
            placeholder="nom@restaurant.be"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            className="w-full p-2 border rounded-lg text-sm"
          />
        </div>

        {error && <div className="text-xs text-red-600 font-medium">{error}</div>}

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-sm"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-sm font-semibold"
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
