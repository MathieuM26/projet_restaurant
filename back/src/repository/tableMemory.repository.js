import db from "../database/sqlite.js";

// Données initiales insérées dans SQLite uniquement si la table SQL "tables" est vide
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

class TableRepository {
  constructor() {
    this.seedIfEmpty();
  }

  seedIfEmpty() {
    const { count } = db.prepare("SELECT COUNT(*) AS count FROM tables").get();
    if (count === 0) {
      const insert = db.prepare(
        "INSERT INTO tables (id, number, capacity, isActive) VALUES (?, ?, ?, ?)"
      );
      for (const t of DEFAULT_TABLES) {
        insert.run(t.id, t.number, t.capacity, t.isActive ? 1 : 0);
      }
    }
  }

  mapRow(row) {
    if (!row) return null;
    return {
      id: String(row.id),
      number: row.number,
      capacity: Number(row.capacity),
      isActive: Boolean(row.isActive)
    };
  }

  getAll() {
    const rows = db.prepare("SELECT * FROM tables ORDER BY CAST(id AS INTEGER) ASC").all();
    return rows.map(r => this.mapRow(r));
  }

  getById(id) {
    const row = db.prepare("SELECT * FROM tables WHERE id = ?").get(String(id));
    return this.mapRow(row);
  }

  // Utilisé par l'algorithme : tables actives triées par capacité croissante (directement en SQL)
  getEligibleTables(minCapacity) {
    const rows = db
      .prepare(
        "SELECT * FROM tables WHERE isActive = 1 AND capacity >= ? ORDER BY capacity ASC, CAST(id AS INTEGER) ASC"
      )
      .all(Number(minCapacity));
    return rows.map(r => this.mapRow(r));
  }

  create(tableData) {
    const { maxId } = db
      .prepare("SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) AS maxId FROM tables")
      .get();

    const newTable = {
      id: String(Number(maxId) + 1),
      number: tableData.number,
      capacity: Number(tableData.capacity),
      isActive: tableData.isActive !== undefined ? Boolean(tableData.isActive) : true
    };

    db.prepare(
      "INSERT INTO tables (id, number, capacity, isActive) VALUES (?, ?, ?, ?)"
    ).run(newTable.id, newTable.number, newTable.capacity, newTable.isActive ? 1 : 0);

    return newTable;
  }

  deleteById(id) {
    const result = db.prepare("DELETE FROM tables WHERE id = ?").run(String(id));
    return result.changes > 0;
  }
}

export default new TableRepository();
