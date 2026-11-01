export const API_URL = "http://localhost:5000/api";

export const TIME_SLOTS = {
  Midi: ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00"],
  Soir: ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"]
};

export const STATUS_LABELS = {
  Confirmed: "Confirmée",
  Seated: "En cours",
  Completed: "Terminée",
  Cancelled: "Annulée"
};

export function translateStatus(status) {
  return STATUS_LABELS[status] || status;
}

export function getTodayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function formatLocalInputDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatLocalInputTime(isoString) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
