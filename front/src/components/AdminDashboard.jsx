import React, { useCallback, useEffect, useState } from "react";
import { API_URL, translateStatus } from "../constants.js";
import EditModal from "./EditModal.jsx";

export default function AdminDashboard({ currentUser }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editingReservation, setEditingReservation] = useState(null);

  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");

  const isAdmin = currentUser?.role === "Admin";

  const loadData = useCallback(async () => {
    try {
      const [resResponse, tablesResponse] = await Promise.all([
        fetch(`${API_URL}/reservations`),
        fetch(`${API_URL}/tables`)
      ]);
      const [resData, tablesData] = await Promise.all([
        resResponse.json(),
        tablesResponse.json()
      ]);
      setReservations(resData);
      setTables(tablesData);
    } catch (err) {
      console.error("Erreur lors du chargement des données admin :", err);
    }
  }, []);

  // Chargement initial + rafraîchissement automatique toutes les 30 secondes via useEffect
  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      if (!editingReservation) {
        loadData();
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData, editingReservation]);

  async function handleCancelReservation(id) {
    if (!window.confirm(`Êtes-vous sûr de vouloir annuler la réservation ${id} ?`)) {
      return;
    }
    await fetch(`${API_URL}/reservations/${encodeURIComponent(id)}`, { method: "DELETE" });
    loadData();
  }

  async function handleAddTable(e) {
    e.preventDefault();
    if (!isAdmin) return;

    await fetch(`${API_URL}/tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: newTableNumber.trim(),
        capacity: Number(newTableCapacity)
      })
    });

    setNewTableNumber("");
    setNewTableCapacity("");
    loadData();
  }

  async function handleDeleteTable(id) {
    if (!isAdmin) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette table ?")) {
      return;
    }
    await fetch(`${API_URL}/tables/${encodeURIComponent(id)}`, { method: "DELETE" });
    loadData();
  }

  // Calcul des KPIs
  const activeReservations = reservations.filter(r => r.status !== "Cancelled");
  const now = new Date();
  const todayReservations = activeReservations.filter(r => {
    const d = new Date(r.startTime);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  const countGuests = list => list.reduce((sum, r) => sum + Number(r.guestCount), 0);

  // Filtrage dynamique du planning
  const q = searchQuery.trim().toLowerCase();
  const filteredReservations = reservations.filter(r => {
    if (statusFilter === "TODAY") {
      const d = new Date(r.startTime);
      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
      if (!isToday || r.status === "Cancelled") return false;
    } else if (statusFilter !== "ALL" && r.status !== statusFilter) {
      return false;
    }

    if (q) {
      const matchId = (r.id || "").toLowerCase().includes(q);
      const matchName = (r.guestName || "").toLowerCase().includes(q);
      const matchPhone = (r.guestPhone || "").toLowerCase().includes(q);
      const matchMessage = (r.guestMessage || "").toLowerCase().includes(q);
      const matchTable = (r.tableName || "").toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchMessage && !matchTable) return false;
    }

    return true;
  });

  return (
    <section className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-sm text-slate-500">Réservations totales</p>
          <p className="text-3xl font-bold">{activeReservations.length}</p>
          <p className="text-xs text-slate-400">{countGuests(activeReservations)} couverts</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-emerald-500">
          <p className="text-sm text-slate-500">Réservations du jour</p>
          <p className="text-3xl font-bold">{todayReservations.length}</p>
          <p className="text-xs text-slate-400">{countGuests(todayReservations)} couverts</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border-l-4 border-amber-500">
          <p className="text-sm text-slate-500">Tables en salle</p>
          <p className="text-3xl font-bold">{tables.length}</p>
        </div>
      </div>

      {/* Planning des Réservations */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold">Planning des Réservations</h2>
            <p className="text-xs text-slate-400">Suivi des réservations en direct et historique.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="text-xs bg-slate-200 px-3 py-2 rounded-lg hover:bg-slate-300 font-medium"
            >
              🔄 Actualiser
            </button>
          </div>
        </div>

        {/* Barre de filtres & recherche */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="🔍 Rechercher par nom, réf (ex: res-31), téléphone..."
              className="w-full p-2 text-sm border rounded-lg bg-white"
            />
          </div>
          <div className="sm:w-56">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2 text-sm border rounded-lg bg-white"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="TODAY">📅 Aujourd'hui uniquement</option>
              <option value="Seated">🟢 En cours</option>
              <option value="Confirmed">🔵 Confirmée</option>
              <option value="Completed">⚪ Terminée</option>
              <option value="Cancelled">🔴 Annulée</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-slate-50 text-sm">
                <th className="p-3">Réf</th>
                <th className="p-3">Client</th>
                <th className="p-3">Couverts</th>
                <th className="p-3">Table attribuée</th>
                <th className="p-3">Horaire</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400 italic">
                    Aucune réservation trouvée pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(r => (
                  <tr key={r.id} className="border-b hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-xs font-semibold">{r.id}</td>
                    <td className="p-3 font-medium">
                      {r.guestName}
                      <br />
                      <span className="text-xs text-slate-400">{r.guestPhone}</span>
                      {r.guestMessage && (
                        <>
                          <br />
                          <span className="inline-block mt-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded px-2 py-0.5 whitespace-pre-line">
                            💬 {r.guestMessage}
                          </span>
                        </>
                      )}
                    </td>
                    <td className="p-3">{r.guestCount} pers.</td>
                    <td className="p-3 font-semibold text-slate-700">{r.tableName}</td>
                    <td className="p-3">{new Date(r.startTime).toLocaleString("fr-BE")}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          r.status === "Confirmed"
                            ? "bg-blue-100 text-blue-800"
                            : r.status === "Seated"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "Completed"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {translateStatus(r.status)}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <a
                        href={`${API_URL}/reservations/${encodeURIComponent(r.id)}/email`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline text-xs mr-2 font-medium"
                        title="Voir l'aperçu de l'email"
                      >
                        📧 Mail
                      </a>
                      {r.status !== "Cancelled" ? (
                        <>
                          <button
                            onClick={() => setEditingReservation(r)}
                            className="text-amber-600 hover:underline text-xs mr-2 font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleCancelReservation(r.id)}
                            className="text-red-600 hover:underline text-xs font-medium"
                          >
                            Annuler
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan de salle */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold">Plan de salle (Tables)</h2>
            <p className="text-xs text-slate-400">
              Statut en direct (🟢 Libre / 🔴 Occupée par un groupe à table).
            </p>
          </div>
        </div>

        <form
          onSubmit={handleAddTable}
          className="flex flex-wrap gap-4 mb-6 p-4 bg-slate-50 rounded-lg border"
        >
          <input
            type="text"
            placeholder="Nom (ex: Table 21)"
            required
            value={newTableNumber}
            onChange={e => setNewTableNumber(e.target.value)}
            className="p-2 border rounded-lg text-sm flex-1 min-w-[160px]"
          />
          <input
            type="number"
            placeholder="Capacité (ex: 4)"
            min="1"
            required
            value={newTableCapacity}
            onChange={e => setNewTableCapacity(e.target.value)}
            className="p-2 border rounded-lg text-sm w-36"
          />
          <button
            type="submit"
            disabled={!isAdmin}
            title={!isAdmin ? "Action réservée aux administrateurs" : ""}
            className={
              isAdmin
                ? "bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold"
                : "bg-slate-300 text-slate-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
            }
          >
            + Ajouter une table
          </button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map(t => {
            const occupyingRes = reservations.find(
              r => String(r.tableId) === String(t.id) && r.status === "Seated"
            );

            return (
              <div
                key={t.id}
                className={`p-4 border rounded-xl bg-white shadow-sm flex flex-col justify-between ${
                  occupyingRes ? "border-red-300 bg-red-50/30" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <p className="font-bold text-base text-slate-800">{t.number}</p>
                    {occupyingRes ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        🔴 Occupée
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        🟢 Libre
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Capacité : {t.capacity} pers.</p>
                  {occupyingRes && (
                    <p className="text-[11px] text-red-600 mt-1 font-medium truncate">
                      Client : {occupyingRes.guestName}
                    </p>
                  )}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
                  {isAdmin ? (
                    <button
                      onClick={() => handleDeleteTable(t.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">Lecture seule</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modale de modification */}
      <EditModal
        reservation={editingReservation}
        onClose={() => setEditingReservation(null)}
        onSaved={() => {
          setEditingReservation(null);
          loadData();
        }}
      />
    </section>
  );
}
