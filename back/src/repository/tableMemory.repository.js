import { loadData, saveData } from "../storage/jsonStorage.js";

// Données initiales (utilisées uniquement au tout premier lancement, quand back/data/tables.json n'existe pas)
const DEFAULT_TABLES = [
    // Tables duo (2 personnes)
    { id: "1", number: "Table 1", capacity: 2, isActive: true },
    { id: "2", number: "Table 2", capacity: 2, isActive: true },
    { id: "3", number: "Table 3", capacity: 2, isActive: true },
    { id: "4", number: "Table 4", capacity: 2, isActive: true },
    { id: "5", number: "Table 5", capacity: 2, isActive: true },
    { id: "6", number: "Table 6", capacity: 2, isActive: true },
    { id: "7", number: "Table 7", capacity: 2, isActive: true },
    { id: "8", number: "Table 8", capacity: 2, isActive: true },

    // Tables standard (4 personnes)
    { id: "9", number: "Table 9", capacity: 4, isActive: true },
    { id: "10", number: "Table 10", capacity: 4, isActive: true },
    { id: "11", number: "Table 11", capacity: 4, isActive: true },
    { id: "12", number: "Table 12", capacity: 4, isActive: true },
    { id: "13", number: "Table 13", capacity: 4, isActive: true },
    { id: "14", number: "Table 14", capacity: 4, isActive: true },
    { id: "15", number: "Table 15", capacity: 4, isActive: true },
    { id: "16", number: "Table 16", capacity: 4, isActive: true },

    // Grandes tables (6 et 8 personnes)
    { id: "17", number: "Table 17", capacity: 6, isActive: true },
    { id: "18", number: "Table 18", capacity: 6, isActive: true },
    { id: "19", number: "Table 19", capacity: 8, isActive: true },
    { id: "20", number: "Table 20", capacity: 8, isActive: true }
];

class TableMemoryRepository {
  tables = loadData("tables", DEFAULT_TABLES);

  save() {
    saveData("tables", this.tables);
  }

  getAll() {
    return this.tables;
  }

  getById(id) {
    return this.tables.find(t => t.id == id);
  }

  // Utilisé par l'algorithme : tables actives triées par capacité croissante
  getEligibleTables(minCapacity) {
    return this.tables
      .filter(t => t.isActive && t.capacity >= minCapacity)
      .sort((a, b) => a.capacity - b.capacity);
  }

  create(tableData) {
    // Identifiant = plus grand id existant + 1 (évite les doublons après une suppression)
    const maxId = this.tables.reduce((max, t) => Math.max(max, Number(t.id) || 0), 0);
    const newTable = {
      id: (maxId + 1).toString(),
      number: tableData.number,
      capacity: Number(tableData.capacity),
      isActive: tableData.isActive !== undefined ? tableData.isActive : true
    };
    this.tables.push(newTable);
    this.save();
    return newTable;
  }

  deleteById(id) {
    const initialLength = this.tables.length;
    this.tables = this.tables.filter(t => t.id != id);
    const deleted = this.tables.length !== initialLength;
    if (deleted) this.save();
    return deleted;
  }
}

export default new TableMemoryRepository();
