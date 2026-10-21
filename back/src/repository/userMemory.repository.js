import { loadData, saveData } from "../storage/jsonStorage.js";

class UserMemoryRepository {
  // Liste du personnel interne ayant accès au back-office
  users = loadData("users", [
    {
      id: "1",
      name: "Mathieu Moerman",
      email: "mathieu.moerman@restaurant.be",
      role: "Admin", // Accès complet : gestion des tables, utilisateurs et planning
      active: true
    },
    {
      id: "2",
      name: "Sarah Vasseur",
      email: "sarah.vasseur@restaurant.be",
      role: "Staff", // Responsable de salle : pointage et gestion des réservations
      active: true
    },
    {
      id: "3",
      name: "Julien Mercier",
      email: "julien.mercier@restaurant.be",
      role: "Staff", // Serveur : consultation et pointage en direct
      active: true
    },
    {
      id: "4",
      name: "Émilie Leclerc",
      email: "emilie.leclerc@restaurant.be",
      role: "Staff", // Serveuse
      active: true
    }
  ]);

  // Enregistre les utilisateurs sur le disque (back/data/users.json)
  save() {
    saveData("users", this.users);
  }

  // 1. Récupérer tous les utilisateurs (pour l'administration)
  getAllUsers() {
    return this.users;
  }

  // 2. Trouver un utilisateur par son identifiant
  getById(id) {
    return this.users.find(user => user.id == id);
  }

  // 3. Trouver un utilisateur par son email (utile pour la future connexion / authentification)
  getByEmail(email) {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // 4. Ajouter un nouveau membre du personnel
  create(userData) {
    const newUser = {
      id: (this.users.reduce((max, u) => Math.max(max, Number(u.id) || 0), 0) + 1).toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role || "Staff",
      active: userData.active !== undefined ? userData.active : true
    };
    this.users.push(newUser);
    this.save();
    return newUser;
  }

  // 5. Mettre à jour un utilisateur (modifier rôle, nom, ou désactiver)
  update(id, data) {
    const user = this.getById(id);
    if (!user) return null;
    Object.assign(user, data);
    this.save();
    return user;
  }

  // 6. Supprimer un membre du personnel
  deleteById(id) {
    const initialLength = this.users.length;
    this.users = this.users.filter(user => user.id != id);
    if (this.users.length !== initialLength) this.save();
    return this.users.length !== initialLength;
  }
}

export default new UserMemoryRepository();