const API_URL = "http://localhost:5000/api";

// Session utilisateur (Espace Restaurateur)
let currentUser = null;
try {
  const savedUser = sessionStorage.getItem("restau_user");
  if (savedUser) currentUser = JSON.parse(savedUser);
} catch (e) {
  currentUser = null;
}

// Données en mémoire pour l'espace restaurateur
let adminReservations = [];
let adminTables = [];

// Traduction des statuts pour l'affichage (les valeurs restent en anglais côté API)
const STATUS_LABELS = {
  Confirmed: "Confirmée",
  Seated: "En cours",
  Completed: "Terminée",
  Cancelled: "Annulée"
};

function translateStatus(status) {
  return STATUS_LABELS[status] || status;
}

// Échappe le texte saisi par l'utilisateur avant de l'insérer dans le HTML (sécurité XSS)
function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Créneaux horaires proposés (Midi et Soir)
const TIME_SLOTS = {
  "Midi": ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00"],
  "Soir": ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"]
};

// Initialiser la date du formulaire à aujourd'hui et bloquer les dates passées
const dateInput = document.getElementById("bookingDate");
const today = new Date().toISOString().split("T")[0];
if (dateInput) {
  dateInput.value = today;
  dateInput.min = today;
}

// Mise à jour de l'affichage de la session dans la barre de navigation
function updateSessionUI() {
  const sessionDiv = document.getElementById("user-session");
  const badge = document.getElementById("user-badge");
  if (!sessionDiv || !badge) return;

  if (currentUser) {
    sessionDiv.classList.remove("hidden");
    sessionDiv.classList.add("flex");
    badge.textContent = `👤 ${currentUser.name} (${currentUser.role})`;
  } else {
    sessionDiv.classList.add("hidden");
    sessionDiv.classList.remove("flex");
  }
}
updateSessionUI();

// 1. Basculer entre l'onglet Client et l'onglet Restaurateur
function switchTab(tab) {
  const viewClient = document.getElementById("view-client");
  const viewAdmin = document.getElementById("view-admin");
  const btnClient = document.getElementById("btn-client");
  const btnAdmin = document.getElementById("btn-admin");

  if (tab === "admin") {
    // Si non connecté, afficher la modale de connexion
    if (!currentUser) {
      openLoginModal();
      return;
    }

    viewClient.classList.add("hidden");
    viewAdmin.classList.remove("hidden");
    btnAdmin.className = "px-4 py-2 rounded bg-amber-500 text-slate-900 font-semibold text-sm transition";
    btnClient.className = "px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm transition";
    loadAdminData();
  } else {
    viewClient.classList.remove("hidden");
    viewAdmin.classList.add("hidden");
    btnClient.className = "px-4 py-2 rounded bg-amber-500 text-slate-900 font-semibold text-sm transition";
    btnAdmin.className = "px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-sm transition";
  }
}

// ================= GESTION DE LA CONNEXION (AUTH) =================
async function openLoginModal() {
  const modal = document.getElementById("admin-login-modal");
  const select = document.getElementById("login-quick-select");
  const errorDiv = document.getElementById("login-error");
  if (errorDiv) errorDiv.textContent = "";

  // Charger la liste des utilisateurs pour la sélection rapide (démo)
  try {
    const res = await fetch(`${API_URL}/users`);
    if (res.ok) {
      const users = await res.json();
      select.innerHTML = `<option value="">-- Choisir un utilisateur (Démo) --</option>` +
        users.map(u => `<option value="${escapeHtml(u.email)}">${escapeHtml(u.name)} (${escapeHtml(u.role)}) - ${escapeHtml(u.email)}</option>`).join("");
    }
  } catch (err) {
    console.error("Impossible de charger les utilisateurs :", err);
  }

  modal.classList.remove("hidden");
}

function closeLoginModal() {
  document.getElementById("admin-login-modal").classList.add("hidden");
}

function onQuickSelectUser(email) {
  document.getElementById("login-email").value = email;
}

async function submitLogin() {
  const email = document.getElementById("login-email").value.trim();
  const errorDiv = document.getElementById("login-error");
  errorDiv.textContent = "";

  if (!email) {
    errorDiv.textContent = "Veuillez entrer une adresse email.";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      errorDiv.textContent = data.error || "Identifiant incorrect.";
      return;
    }

    currentUser = data;
    sessionStorage.setItem("restau_user", JSON.stringify(currentUser));
    updateSessionUI();
    closeLoginModal();
    switchTab("admin");
  } catch (err) {
    errorDiv.textContent = "Erreur de connexion au serveur backend.";
  }
}

function logoutAdmin() {
  currentUser = null;
  sessionStorage.removeItem("restau_user");
  updateSessionUI();
  switchTab("client");
}

// ================= CÔTÉ CLIENT : NOUVELLE RÉSERVATION =================
document.getElementById("reservation-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const resultDiv = document.getElementById("booking-result");

  const dateVal = document.getElementById("bookingDate").value;
  const timeVal = document.getElementById("bookingTime").value;
  const combinedDateTime = new Date(`${dateVal}T${timeVal}:00`);

  const payload = {
    guestName: document.getElementById("guestName").value,
    guestEmail: document.getElementById("guestEmail").value,
    guestPhone: document.getElementById("guestPhone").value,
    guestCount: Number(document.getElementById("guestCount").value),
    guestMessage: document.getElementById("guestMessage").value.trim(),
    dateTime: combinedDateTime.toISOString()
  };

  try {
    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    resultDiv.classList.remove("hidden");

    if (response.ok) {
      resultDiv.className = "mt-6 p-4 rounded-lg bg-emerald-100 border border-emerald-400 text-emerald-900";
      resultDiv.innerHTML = `
        <h3 class="font-bold text-lg">✅ Réservation confirmée !</h3>
        <p class="mt-1">Table attribuée automatiquement : <strong>${escapeHtml(data.tableName)}</strong></p>
        <p class="mt-1">Votre code unique à conserver : <code class="bg-white px-2 py-1 rounded font-mono font-bold">${escapeHtml(data.id)}</code></p>
        <p class="mt-3 pt-2 border-t border-emerald-300 text-sm">
          📧 Email de confirmation envoyé à <strong>${escapeHtml(data.guestEmail)}</strong>.
          <a href="${API_URL}/reservations/${encodeURIComponent(data.id)}/email" target="_blank" class="ml-1 inline-block bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-semibold hover:bg-emerald-800">
            Voir l'aperçu du mail
          </a>
        </p>
      `;
      document.getElementById("reservation-form").reset();
      dateInput.value = today;
    } else {
      resultDiv.className = "mt-6 p-4 rounded-lg bg-red-100 border border-red-400 text-red-900";
      resultDiv.innerHTML = `<strong>❌ Impossible de réserver :</strong> ${escapeHtml(data.message || data.error)}`;
    }
  } catch (err) {
    alert("Erreur de connexion avec le serveur backend.");
  }
});

// ================= CÔTÉ CLIENT : CHERCHER / MODIFIER / ANNULER =================
function toggleEditForm() {
  const editBox = document.getElementById("edit-box");
  if (editBox) {
    editBox.classList.toggle("hidden");
  }
}

async function findMyReservation() {
  const id = document.getElementById("search-id").value.trim();
  const container = document.getElementById("search-result");
  if (!id) return;

  const response = await fetch(`${API_URL}/reservations/${id}`);
  if (!response.ok) {
    container.innerHTML = `<p class="text-red-600 font-medium">Aucune réservation trouvée avec ce code.</p>`;
    return;
  }

  const res = await response.json();
  const startDateObj = new Date(res.startTime);
  const datePart = `${startDateObj.getFullYear()}-${String(startDateObj.getMonth() + 1).padStart(2, "0")}-${String(startDateObj.getDate()).padStart(2, "0")}`;
  const hoursPart = String(startDateObj.getHours()).padStart(2, "0");
  const minsPart = String(startDateObj.getMinutes()).padStart(2, "0");
  const timePart = `${hoursPart}:${minsPart}`;

  container.innerHTML = `
    <div class="p-4 border rounded-lg bg-slate-50 space-y-2">
      <div class="flex justify-between items-center">
        <span class="font-mono font-bold text-sm bg-slate-200 px-2 py-1 rounded">${escapeHtml(res.id)}</span>
        <span class="font-bold text-sm ${res.status === 'Cancelled' ? 'text-red-600' : 'text-emerald-700'}">${translateStatus(res.status)}</span>
      </div>
      <p><strong>Client :</strong> ${escapeHtml(res.guestName)} (${res.guestCount} pers.)</p>
      <p><strong>Table attribuée :</strong> ${escapeHtml(res.tableName)}</p>
      <p><strong>Horaire :</strong> ${startDateObj.toLocaleString("fr-BE")}</p>
      ${res.guestMessage ? `<p><strong>Message :</strong> <span class="italic whitespace-pre-line">${escapeHtml(res.guestMessage)}</span></p>` : ""}
      <p class="pt-1">
        <a href="${API_URL}/reservations/${encodeURIComponent(res.id)}/email" target="_blank" class="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline">
          📧 Voir l'aperçu de l'email envoyé (Mode Démo)
        </a>
      </p>

      ${res.status !== "Cancelled" ? `
        <div class="flex gap-2 pt-2">
          <button onclick="toggleEditForm()" class="bg-amber-500 text-slate-900 font-semibold px-3 py-1.5 rounded text-sm hover:bg-amber-600">
            Modifier
          </button>
          <button onclick="cancelReservation('${escapeHtml(res.id)}')" class="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700">
            Annuler
          </button>
        </div>

        <!-- Formulaire de modification caché par défaut -->
        <div id="edit-box" class="hidden mt-4 pt-4 border-t space-y-3">
          <h4 class="font-bold text-sm">Modifier ma réservation</h4>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="text-xs font-medium">Personnes</label>
              <input type="number" id="edit-count" min="1" max="8" value="${res.guestCount}" class="w-full p-1.5 border rounded text-sm bg-white">
            </div>
            <div>
              <label class="text-xs font-medium">Nouvelle date</label>
              <input type="date" id="edit-date" min="${today}" value="${datePart}" class="w-full p-1.5 border rounded text-sm bg-white">
            </div>
            <div>
              <label class="text-xs font-medium">Créneau</label>
              <select id="edit-time" class="w-full p-1.5 border rounded text-sm bg-white">
                <optgroup label="Midi">
                  <option value="11:30" ${timePart === '11:30' ? 'selected' : ''}>11:30</option>
                  <option value="12:00" ${timePart === '12:00' ? 'selected' : ''}>12:00</option>
                  <option value="12:30" ${timePart === '12:30' ? 'selected' : ''}>12:30</option>
                  <option value="13:00" ${timePart === '13:00' ? 'selected' : ''}>13:00</option>
                  <option value="13:30" ${timePart === '13:30' ? 'selected' : ''}>13:30</option>
                  <option value="14:00" ${timePart === '14:00' ? 'selected' : ''}>14:00</option>
                </optgroup>
                <optgroup label="Soir">
                  <option value="19:00" ${timePart === '19:00' ? 'selected' : ''}>19:00</option>
                  <option value="19:30" ${timePart === '19:30' ? 'selected' : ''}>19:30</option>
                  <option value="20:00" ${timePart === '20:00' ? 'selected' : ''}>20:00</option>
                  <option value="20:30" ${timePart === '20:30' ? 'selected' : ''}>20:30</option>
                  <option value="21:00" ${timePart === '21:00' ? 'selected' : ''}>21:00</option>
                  <option value="21:30" ${timePart === '21:30' ? 'selected' : ''}>21:30</option>
                </optgroup>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs font-medium">Message (allergies, occasion...)</label>
            <textarea id="edit-message" rows="2" maxlength="500" class="w-full p-1.5 border rounded text-sm bg-white resize-none">${escapeHtml(res.guestMessage || "")}</textarea>
          </div>
          <div id="edit-error" class="text-xs text-red-600 font-medium"></div>
          <button onclick="saveModification('${escapeHtml(res.id)}')" class="w-full bg-slate-900 text-white py-2 rounded text-sm font-semibold hover:bg-slate-800">
            Enregistrer les modifications
          </button>
        </div>
      ` : ""}
    </div>
  `;
}

// Envoyer la modification client au serveur (PUT /api/reservations/:id)
async function saveModification(id) {
  const newCount = Number(document.getElementById("edit-count").value);
  const newDate = document.getElementById("edit-date").value;
  const newTime = document.getElementById("edit-time").value;
  const errorDiv = document.getElementById("edit-error");

  const combinedDateTime = new Date(`${newDate}T${newTime}:00`);

  const response = await fetch(`${API_URL}/reservations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      guestCount: newCount,
      guestMessage: document.getElementById("edit-message").value.trim(),
      dateTime: combinedDateTime.toISOString()
    })
  });

  const data = await response.json();
  if (!response.ok) {
    errorDiv.textContent = data.error || "Erreur lors de la modification.";
    return;
  }

  findMyReservation();
}

// Annuler une réservation avec confirmation préalable
async function cancelReservation(id) {
  if (!confirm(`Êtes-vous sûr de vouloir annuler la réservation ${id} ?`)) {
    return;
  }

  await fetch(`${API_URL}/reservations/${id}`, { method: "DELETE" });
  findMyReservation();
  loadAdminData();
}

// ================= CÔTÉ RESTAURATEUR : DASHBOARD & PLANNING =================
async function loadAdminData() {
  const [resResponse, tablesResponse] = await Promise.all([
    fetch(`${API_URL}/reservations`),
    fetch(`${API_URL}/tables`)
  ]);

  adminReservations = await resResponse.json();
  adminTables = await tablesResponse.json();

  // 1. Calcul des KPIs (hors réservations annulées)
  const activeReservations = adminReservations.filter(r => r.status !== "Cancelled");

  const now = new Date();
  const todayReservations = activeReservations.filter(r => {
    const d = new Date(r.startTime);
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
  });

  const countGuests = list => list.reduce((sum, r) => sum + Number(r.guestCount), 0);

  document.getElementById("kpi-reservations").textContent = activeReservations.length;
  document.getElementById("kpi-reservations-guests").textContent = `${countGuests(activeReservations)} couverts`;
  document.getElementById("kpi-today").textContent = todayReservations.length;
  document.getElementById("kpi-today-guests").textContent = `${countGuests(todayReservations)} couverts`;
  document.getElementById("kpi-tables").textContent = adminTables.length;

  // 2. Affichage du tableau filtré des réservations
  renderAdminReservations();

  // 3. Affichage du plan de salle (Tables) avec statut Libre / Occupée en direct
  renderAdminTables();
}

// Affichage dynamique du tableau selon les filtres et la recherche
function renderAdminReservations() {
  const searchInput = document.getElementById("admin-search-input");
  const statusFilter = document.getElementById("admin-status-filter");
  const query = (searchInput ? searchInput.value : "").trim().toLowerCase();
  const selectedStatus = statusFilter ? statusFilter.value : "ALL";

  const now = new Date();

  const filtered = adminReservations.filter(r => {
    // Filtre de statut
    if (selectedStatus === "TODAY") {
      const d = new Date(r.startTime);
      const isToday = d.getFullYear() === now.getFullYear() &&
                      d.getMonth() === now.getMonth() &&
                      d.getDate() === now.getDate();
      if (!isToday || r.status === "Cancelled") return false;
    } else if (selectedStatus !== "ALL" && r.status !== selectedStatus) {
      return false;
    }

    // Filtre de recherche texte
    if (query) {
      const matchId = (r.id || "").toLowerCase().includes(query);
      const matchName = (r.guestName || "").toLowerCase().includes(query);
      const matchPhone = (r.guestPhone || "").toLowerCase().includes(query);
      const matchMessage = (r.guestMessage || "").toLowerCase().includes(query);
      const matchTable = (r.tableName || "").toLowerCase().includes(query);
      if (!matchId && !matchName && !matchPhone && !matchMessage && !matchTable) return false;
    }

    return true;
  });

  const tbody = document.getElementById("admin-reservations-list");
  if (!filtered.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="p-6 text-center text-slate-400 italic">
          Aucune réservation trouvée pour ces critères.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(r => `
    <tr class="border-b hover:bg-slate-50 transition">
      <td class="p-3 font-mono text-xs font-semibold">${escapeHtml(r.id)}</td>
      <td class="p-3 font-medium">
        ${escapeHtml(r.guestName)}<br>
        <span class="text-xs text-slate-400">${escapeHtml(r.guestPhone)}</span>
        ${r.guestMessage ? `<br><span class="inline-block mt-1 text-xs bg-amber-50 text-amber-800 border border-amber-200 rounded px-2 py-0.5 whitespace-pre-line">💬 ${escapeHtml(r.guestMessage)}</span>` : ""}
      </td>
      <td class="p-3">${r.guestCount} pers.</td>
      <td class="p-3 font-semibold text-slate-700">${escapeHtml(r.tableName)}</td>
      <td class="p-3">${new Date(r.startTime).toLocaleString("fr-BE")}</td>
      <td class="p-3">
        <span class="px-2 py-1 rounded text-xs font-bold ${
          r.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
          r.status === 'Seated' ? 'bg-emerald-100 text-emerald-800' :
          r.status === 'Completed' ? 'bg-slate-200 text-slate-700' :
          'bg-red-100 text-red-800'
        }">${translateStatus(r.status)}</span>
      </td>
      <td class="p-3 whitespace-nowrap">
        <a href="${API_URL}/reservations/${encodeURIComponent(r.id)}/email" target="_blank" class="text-blue-600 hover:underline text-xs mr-2 font-medium" title="Voir l'aperçu de l'email">📧 Mail</a>
        ${r.status !== "Cancelled" ? `
          <button onclick="openAdminEdit('${escapeHtml(r.id)}')" class="text-amber-600 hover:underline text-xs mr-2 font-medium">Modifier</button>
          <button onclick="cancelReservation('${escapeHtml(r.id)}')" class="text-red-600 hover:underline text-xs font-medium">Annuler</button>
        ` : `<span class="text-xs text-slate-400">-</span>`}
      </td>
    </tr>
  `).join("");
}

// Affichage des tables avec statut en direct (Libre / Occupée) et restrictions par rôle
function renderAdminTables() {
  const tablesContainer = document.getElementById("admin-tables-list");
  const isAdmin = currentUser && currentUser.role === "Admin";

  // Formulaire d'ajout réservé à l'Admin
  const addTableBtn = document.getElementById("btn-add-table");
  if (addTableBtn) {
    if (!isAdmin) {
      addTableBtn.disabled = true;
      addTableBtn.className = "bg-slate-300 text-slate-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed";
      addTableBtn.title = "Action réservée aux administrateurs";
    } else {
      addTableBtn.disabled = false;
      addTableBtn.className = "bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-semibold";
      addTableBtn.title = "";
    }
  }

  tablesContainer.innerHTML = adminTables.map(t => {
    // Vérifier si un client est actuellement assis à cette table (statut "Seated")
    const occupyingRes = adminReservations.find(r => r.tableId === t.id && r.status === "Seated");

    return `
      <div class="p-4 border rounded-xl bg-white shadow-sm flex flex-col justify-between ${occupyingRes ? 'border-red-300 bg-red-50/30' : 'border-slate-200'}">
        <div>
          <div class="flex items-center justify-between gap-1 mb-1">
            <p class="font-bold text-base text-slate-800">${escapeHtml(t.number)}</p>
            ${occupyingRes 
              ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">🔴 Occupée</span>` 
              : `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">🟢 Libre</span>`}
          </div>
          <p class="text-xs text-slate-500">Capacité : ${t.capacity} pers.</p>
          ${occupyingRes ? `<p class="text-[11px] text-red-600 mt-1 font-medium truncate">Client : ${escapeHtml(occupyingRes.guestName)}</p>` : ""}
        </div>

        <div class="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center">
          ${isAdmin ? `
            <button onclick="deleteTable('${escapeHtml(t.id)}')" class="text-xs text-red-600 hover:underline">
              Supprimer
            </button>
          ` : `
            <span class="text-[11px] text-slate-400 italic">Lecture seule</span>
          `}
        </div>
      </div>
    `;
  }).join("");
}

// Ouvrir la modale de modification restaurateur
function openAdminEdit(id) {
  const res = adminReservations.find(r => r.id === id);
  if (!res) return;

  const start = new Date(res.startTime);
  const datePart = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const timePart = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;

  const allSlots = [...TIME_SLOTS.Midi, ...TIME_SLOTS.Soir];
  let optionsHtml = Object.entries(TIME_SLOTS).map(([label, slots]) => `
    <optgroup label="${label}">
      ${slots.map(s => `<option value="${s}" ${s === timePart ? "selected" : ""}>${s}</option>`).join("")}
    </optgroup>
  `).join("");
  if (!allSlots.includes(timePart)) {
    optionsHtml = `<option value="${timePart}" selected>${timePart} (actuel)</option>` + optionsHtml;
  }

  document.getElementById("admin-edit-id").textContent = res.id;
  document.getElementById("admin-edit-name").value = res.guestName;
  document.getElementById("admin-edit-count").value = res.guestCount;
  document.getElementById("admin-edit-message").value = res.guestMessage || "";
  document.getElementById("admin-edit-date").value = datePart;
  document.getElementById("admin-edit-date").min = today;
  document.getElementById("admin-edit-time").innerHTML = optionsHtml;
  document.getElementById("admin-edit-error").textContent = "";

  document.getElementById("admin-edit-modal").classList.remove("hidden");
}

function closeAdminEdit() {
  document.getElementById("admin-edit-modal").classList.add("hidden");
}

// Enregistrer la modification restaurateur (PUT /api/reservations/:id)
async function saveAdminModification() {
  const id = document.getElementById("admin-edit-id").textContent;
  const guestName = document.getElementById("admin-edit-name").value.trim();
  const guestCount = Number(document.getElementById("admin-edit-count").value);
  const newDate = document.getElementById("admin-edit-date").value;
  const newTime = document.getElementById("admin-edit-time").value;
  const errorDiv = document.getElementById("admin-edit-error");

  if (!guestName || !newDate || !newTime) {
    errorDiv.textContent = "Veuillez remplir tous les champs.";
    return;
  }

  const combinedDateTime = new Date(`${newDate}T${newTime}:00`);

  try {
    const response = await fetch(`${API_URL}/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        guestName,
        guestCount,
        guestMessage: document.getElementById("admin-edit-message").value.trim(),
        dateTime: combinedDateTime.toISOString()
      })
    });

    const data = await response.json();
    if (!response.ok) {
      errorDiv.textContent = data.error || "Erreur lors de la modification.";
      return;
    }

    closeAdminEdit();
    loadAdminData();
  } catch (err) {
    errorDiv.textContent = "Erreur de connexion avec le serveur backend.";
  }
}

// Ajouter une nouvelle table (POST /api/tables)
document.getElementById("table-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (currentUser && currentUser.role !== "Admin") {
    alert("Seuls les administrateurs peuvent ajouter des tables.");
    return;
  }

  const number = document.getElementById("tableNumber").value;
  const capacity = Number(document.getElementById("tableCapacity").value);

  await fetch(`${API_URL}/tables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ number, capacity })
  });

  document.getElementById("table-form").reset();
  loadAdminData();
});

// Supprimer une table avec confirmation préalable
async function deleteTable(id) {
  if (currentUser && currentUser.role !== "Admin") {
    alert("Seuls les administrateurs peuvent supprimer des tables.");
    return;
  }

  if (!confirm("Êtes-vous sûr de vouloir supprimer cette table ?")) {
    return;
  }

  await fetch(`${API_URL}/tables/${id}`, { method: "DELETE" });
  loadAdminData();
}

// Rafraîchissement automatique toutes les 30 secondes
setInterval(() => {
  const adminVisible = !document.getElementById("view-admin").classList.contains("hidden");
  const modalOpen = !document.getElementById("admin-edit-modal").classList.contains("hidden");
  const loginModalOpen = !document.getElementById("admin-login-modal").classList.contains("hidden");

  if (adminVisible && !modalOpen && !loginModalOpen && currentUser) {
    loadAdminData();
  }
}, 30000);
