import db from "../database/sqlite.js";

const DEFAULT_USERS = [
  {
    id: "1",
    name: "Mathieu Moerman",
    email: "mathieu.moerman@restaurant.be",
    role: "Admin",
    active: true
  },
  {
    id: "2",
    name: "Sarah Vasseur",
    email: "sarah.vasseur@restaurant.be",
    role: "Staff",
    active: true
  },
  {
    id: "3",
    name: "Julien Mercier",
    email: "julien.mercier@restaurant.be",
    role: "Staff",
    active: true
  },
  {
    id: "4",
    name: "Émilie Leclerc",
    email: "emilie.leclerc@restaurant.be",
    role: "Staff",
    active: true
  }
];

class UserRepository {
  constructor() {
    this.seedIfEmpty();
  }

  seedIfEmpty() {
    const { count } = db.prepare("SELECT COUNT(*) AS count FROM users").get();
    if (count === 0) {
      const insert = db.prepare(
        "INSERT INTO users (id, name, email, role, active) VALUES (?, ?, ?, ?, ?)"
      );
      for (const u of DEFAULT_USERS) {
        insert.run(u.id, u.name, u.email, u.role, u.active ? 1 : 0);
      }
    }
  }

  mapRow(row) {
    if (!row) return null;
    return {
      id: String(row.id),
      name: row.name,
      email: row.email,
      role: row.role,
      active: Boolean(row.active)
    };
  }

  getAllUsers() {
    const rows = db.prepare("SELECT * FROM users ORDER BY CAST(id AS INTEGER) ASC").all();
    return rows.map(r => this.mapRow(r));
  }

  getById(id) {
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(String(id));
    return this.mapRow(row);
  }

  getByEmail(email) {
    if (!email) return null;
    const row = db
      .prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?)")
      .get(String(email).trim());
    return this.mapRow(row);
  }

  create(userData) {
    const { maxId } = db
      .prepare("SELECT COALESCE(MAX(CAST(id AS INTEGER)), 0) AS maxId FROM users")
      .get();

    const newUser = {
      id: String(Number(maxId) + 1),
      name: userData.name,
      email: userData.email,
      role: userData.role || "Staff",
      active: userData.active !== undefined ? Boolean(userData.active) : true
    };

    db.prepare(
      "INSERT INTO users (id, name, email, role, active) VALUES (?, ?, ?, ?, ?)"
    ).run(newUser.id, newUser.name, newUser.email, newUser.role, newUser.active ? 1 : 0);

    return newUser;
  }

  update(id, data) {
    const existing = this.getById(id);
    if (!existing) return null;

    const updated = { ...existing, ...data };
    db.prepare(
      "UPDATE users SET name = ?, email = ?, role = ?, active = ? WHERE id = ?"
    ).run(
      updated.name,
      updated.email,
      updated.role,
      updated.active ? 1 : 0,
      String(id)
    );
    return updated;
  }

  deleteById(id) {
    const result = db.prepare("DELETE FROM users WHERE id = ?").run(String(id));
    return result.changes > 0;
  }
}

export default new UserRepository();
