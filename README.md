# 🍽️ Le Gourmet - Système de Réservation de Restaurant

Projet académique réalisé dans le cadre du **Bachelier en Informatique**.

Application web full-stack de gestion et de réservation de tables pour un restaurant :
* **Front-end :** **React 18** (Vite + Tailwind CSS) structuré en composants réutilisables.
* **Back-end :** **Node.js / Express** en **architecture 3-tiers (`Router` $\rightarrow$ `Service` $\rightarrow$ `Repository`)**.
* **Base de données SQL :** **SQLite** (`back/data/restaurant.sqlite`) avec schéma relationnel et requêtes SQL préparées.
* **Emails transactionnels :** Intégration de l'API **Brevo** (`mail.service.js`) avec aperçu Webmail intégré.

---

## 🚀 Démarrage Rapide

### Prérequis
* [Node.js](https://nodejs.org/) (version 22 recommandée pour le moteur SQLite natif `node:sqlite`)

### Option 1 : Lancer le Backend (qui sert aussi l'application React compilée)
```bash
cd back
npm install
npm start
```
Ouvrez directement **`http://localhost:5000`** dans votre navigateur.

### Option 2 : Lancer le serveur de développement React (Vite Hot-Reload)
Dans un second terminal :
```bash
cd front
npm install
npm run dev
```
L'interface React en mode développement s'ouvre sur **`http://localhost:5173`** (connectée à l'API sur le port `5000`).

---

## 📧 Configuration de Brevo (Envoi d'emails réels)

Le service [`back/src/services/mail.service.js`](back/src/services/mail.service.js) fonctionne automatiquement dans deux modes :
1. **Avec clé API Brevo (Envoi réel) :** copiez le fichier `back/.env.example` en `back/.env` et renseignez votre clé `BREVO_API_KEY` et votre adresse `BREVO_SENDER_EMAIL`. Chaque réservation, modification ou annulation envoie un véritable email HTML au client via `https://api.brevo.com/v3/smtp/email`.
2. **Sans clé API (Mode Démo automatique) :** si aucun fichier `.env` n'est présent, l'application génère quand même l'email et permet de le visualiser en un clic via l'aperçu Webmail intégré (`/api/reservations/:id/email`).

---

## 👥 Comptes de Démonstration (Espace Restaurateur)

| Nom | Email | Rôle | Permissions |
|---|---|---|---|
| **Mathieu Moerman** | `mathieu.moerman@restaurant.be` | **Admin** | Accès complet (planning, modification, ajout et suppression de tables) |
| **Sarah Vasseur** | `sarah.vasseur@restaurant.be` | **Staff** | Gestion du planning et modifications (plan de salle en lecture seule) |
| **Julien Mercier** | `julien.mercier@restaurant.be` | **Staff** | Consultation et modifications |
| **Émilie Leclerc** | `emilie.leclerc@restaurant.be` | **Staff** | Consultation et modifications |

---

## 📁 Structure du Projet

```text
projet_restaurant/
├── README.md               # Documentation du projet
├── back/                   # Serveur Backend (Node.js / Express)
│   ├── .env.example        # Modèle de configuration Brevo API
│   ├── data/
│   │   └── restaurant.sqlite              # Base de données relationnelle SQLite
│   ├── package.json
│   └── src/
│       ├── index.js                       # Point d'entrée Express
│       ├── database/
│       │   └── sqlite.js                  # Connexion SQLite & création des tables SQL
│       ├── router/                        # Couche HTTP (Routes Express)
│       │   ├── reservation.router.js
│       │   ├── tables.router.js
│       │   └── user.router.js
│       ├── services/                      # Couche Métier (Validations, orchestration, Brevo)
│       │   ├── mail.service.js
│       │   ├── reservation.service.js
│       │   ├── table.service.js
│       │   └── user.service.js
│       └── repository/                    # Couche Données (Requêtes SQL préparées)
│           ├── reservationMemory.repository.js
│           ├── tableMemory.repository.js
│           └── userMemory.repository.js
└── front/                  # Application Frontend (React 18 + Vite)
    ├── index.html          # Point d'entrée HTML
    ├── package.json        # Dépendances React & Vite
    ├── vite.config.js      # Configuration Vite
    └── src/
        ├── main.jsx        # Montage React
        ├── App.jsx         # Composant racine (navigation & session)
        ├── constants.js    # Constantes & utilitaires de dates
        └── components/     # Composants React modulaires
            ├── Navbar.jsx
            ├── BookingForm.jsx
            ├── ReservationLookup.jsx
            ├── AdminDashboard.jsx
            ├── LoginModal.jsx
            └── EditModal.jsx
```
