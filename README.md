# 🍽️ Le Gourmet - Système de Réservation de Restaurant

Projet académique réalisé dans le cadre du **Bachelier en Informatique**.

Application web complète de gestion et de réservation de tables pour un restaurant, structurée selon une **architecture 3-tiers (`Router` $\rightarrow$ `Service` $\rightarrow$ `Repository`)**, incluant un algorithme d'attribution automatique de table en temps réel, un service d'envoi d'emails de confirmation (mode démo) et un tableau de bord restaurateur sécurisé par rôles.

---

## 🚀 Démarrage Rapide

### Prérequis
* [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
* Un navigateur web moderne (Chrome, Firefox, Edge, Safari)

### 1. Lancer le serveur Backend (API Express)
Ouvrez un terminal dans le dossier du projet :

```bash
cd back
npm install
npm run dev   # ou: npm start
```
Le serveur démarre sur **`http://localhost:5000`**.

> **Note sur les données :** Les données sont enregistrées automatiquement au format JSON dans le dossier `back/data/`. Lors du tout premier lancement, ce dossier est créé automatiquement avec un jeu de données de test complet.

### 2. Ouvrir l'application Frontend
Ouvrez simplement le fichier `front/index.html` dans votre navigateur (double-clic ou via l'extension *Live Server* de VS Code).

---

## 👥 Comptes de Démonstration (Personnel du Restaurant)

L'Espace Restaurateur est sécurisé par rôle. Une sélection rapide en un clic est disponible dans la fenêtre de connexion :

| Nom | Email | Rôle | Permissions |
|---|---|---|---|
| **Mathieu Moerman** | `mathieu.moerman@restaurant.be` | **Admin** | Accès complet (planning, modification, ajout et suppression de tables) |
| **Sarah Vasseur** | `sarah.vasseur@restaurant.be` | **Staff** | Gestion du planning et modifications (plan de salle en lecture seule) |
| **Julien Mercier** | `julien.mercier@restaurant.be` | **Staff** | Consultation et modifications |
| **Émilie Leclerc** | `emilie.leclerc@restaurant.be` | **Staff** | Consultation et modifications |

---

## ✨ Fonctionnalités Clés

### 1. Espace Client
* **Réservation instantanée sans création de compte** : saisie des coordonnées, du nombre de couverts (1 à 8 personnes), de la date et du créneau.
* **Attribution automatique et optimale** : l'algorithme sélectionne automatiquement la plus petite table disponible capable d'accueillir le groupe.
* **Confirmation par Email (Mode Démo)** : génération automatique d'un email de confirmation, de modification ou d'annulation consultable en un clic via un aperçu Webmail intégré (`/api/reservations/:id/email`).
* **Espace message & allergies** : champ texte facultatif pour signaler allergies, régimes spéciaux ou occasions particulières.
* **Code unique séquentiel** : génération automatique d'un identifiant clair et mémorisable (ex: `res-31`, `res-32`).
* **Consultation, modification et annulation** : le client peut à tout moment retrouver sa réservation via son code, modifier le nombre de couverts, la date, l'heure ou le message, ou annuler avec confirmation.

### 2. Espace Restaurateur (Back-office)
* **Tableau de bord avec KPIs en direct** :
  * *Réservations totales* et nombre total de couverts attendus.
  * *Réservations du jour* et couverts de la journée.
  * *Tables en salle* configurées.
* **Planning interactif avec filtres et recherche** :
  * Recherche textuelle instantanée par nom, téléphone, référence (`res-XX`), ou contenu du message.
  * Filtre par statut (*Tous*, *Aujourd'hui*, *En cours*, *Confirmée*, *Terminée*, *Annulée*).
  * Aperçu direct de l'email envoyé au client (`📧 Mail`).
* **Plan de salle en temps réel** :
  * Chaque table affiche son statut direct : **🟢 Libre** ou **🔴 Occupée** avec le nom du client actuellement assis.
* **Gestion des tables** :
  * Ajout de tables (nom et capacité).
  * Suppression protégée avec boîte de confirmation (réservée au rôle `Admin`).
* **Rafraîchissement automatique** : mise à jour toutes les 30 secondes sans rechargement de page.

---

## 🏗️ Architecture Backend (3-Tiers) & Règles Métier

Le serveur backend respecte une séparation stricte des responsabilités :
1. **Couche `Router` (`back/src/router/`)** : réception des requêtes HTTP, extraction des paramètres et envoi des codes de statut HTTP (`200`, `201`, `400`, `404`, `409`).
2. **Couche `Service` (`back/src/services/`)** : logique métier, validation des horaires d'ouverture, orchestration et déclenchement de l'envoi d'emails via `mail.service.js`.
3. **Couche `Repository` (`back/src/repository/`)** : accès aux données, algorithme de recherche de tables libres et persistance sur disque (`back/data/*.json`).

---

## 📁 Structure du Projet

```text
projet_restaurant/
├── README.md               # Documentation du projet
├── back/                   # Serveur Backend (API REST)
│   ├── data/               # Fichiers de persistance JSON (tables, réservations, users)
│   ├── package.json        # Dépendances (Express, CORS)
│   └── src/
│       ├── index.js        # Point d'entrée de l'API & middlewares
│       ├── router/         # Couche HTTP (Routes Express)
│       │   ├── reservation.router.js
│       │   ├── tables.router.js
│       │   └── user.router.js
│       ├── services/       # Couche Métier (Validations, orchestration, emails)
│       │   ├── mail.service.js
│       │   ├── reservation.service.js
│       │   ├── table.service.js
│       │   └── user.service.js
│       ├── repository/     # Couche d'accès aux données (Repositories)
│       │   ├── reservationMemory.repository.js
│       │   ├── tableMemory.repository.js
│       │   └── userMemory.repository.js
│       └── storage/
│           └── jsonStorage.js
└── front/                  # Interface Frontend (Client & Restaurateur)
    ├── index.html          # Structure HTML5 & Tailwind CSS
    └── app.js              # Logique cliente, requêtes API, gestion d'état & filtres
```
