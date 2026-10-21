import tableRepository from "./tableMemory.repository.js";
import { loadData, saveData } from "../storage/jsonStorage.js";

class ReservationMemoryRepository {
  // Durée estimée du repas : 1h30 (90 min)
  MEAL_DURATION_MS = 90 * 60 * 1000;

  // Chargées depuis back/data/reservations.json (les données ci-dessous ne servent qu'au premier lancement)
  reservations = loadData("reservations", [
    
    // --- SERVICE DU MIDI (12h00 - 14h00) ---
    {
      id: "res-01",
      tableId: "1",
      tableName: "Table 1",
      guestName: "Marc Vasseur",
      guestEmail: "marc.vasseur@email.be",
      guestPhone: "+32 470 11 22 33",
      guestCount: 2,
      startTime: "2026-10-14T12:00:00.000Z",
      endTime: "2026-10-14T13:30:00.000Z",
      status: "Completed"
    },
    {
      id: "res-02",
      tableId: "2",
      tableName: "Table 2",
      guestName: "Chloé Leroy",
      guestEmail: "chloe.leroy@email.com",
      guestPhone: "+32 471 22 33 44",
      guestCount: 2,
      startTime: "2026-10-14T12:00:00.000Z",
      endTime: "2026-10-14T13:30:00.000Z",
      status: "Completed"
    },
    {
      id: "res-03",
      tableId: "9",
      tableName: "Table 9",
      guestName: "Famille Simon",
      guestEmail: "simon.fam@email.be",
      guestPhone: "+32 472 33 44 55",
      guestCount: 4,
      startTime: "2026-10-14T12:15:00.000Z",
      endTime: "2026-10-14T13:45:00.000Z",
      status: "Completed"
    },
    {
      id: "res-04",
      tableId: "10",
      tableName: "Table 10",
      guestName: "Lucas Bernard",
      guestEmail: "l.bernard@email.be",
      guestPhone: "+32 473 44 55 66",
      guestCount: 3,
      startTime: "2026-10-14T12:30:00.000Z",
      endTime: "2026-10-14T14:00:00.000Z",
      status: "Completed"
    },
    {
      id: "res-05",
      tableId: "17",
      tableName: "Table 17",
      guestName: "Équipe Dev Tech",
      guestEmail: "contact@techdev.be",
      guestPhone: "+32 474 55 66 77",
      guestCount: 6,
      startTime: "2026-10-14T12:30:00.000Z",
      endTime: "2026-10-14T14:00:00.000Z",
      status: "Completed"
    },
    {
      id: "res-06",
      tableId: "3",
      tableName: "Table 3",
      guestName: "Sarah Delattre",
      guestEmail: "sarah.d@email.com",
      guestPhone: "+32 475 66 77 88",
      guestCount: 2,
      startTime: "2026-10-14T12:45:00.000Z",
      endTime: "2026-10-14T14:15:00.000Z",
      status: "Completed"
    },
    {
      id: "res-07",
      tableId: "11",
      tableName: "Table 11",
      guestName: "Antoine Meunier",
      guestEmail: "antoine.m@email.be",
      guestPhone: "+32 476 77 88 99",
      guestCount: 4,
      startTime: "2026-10-14T13:00:00.000Z",
      endTime: "2026-10-14T14:30:00.000Z",
      status: "Completed"
    },
    {
      id: "res-08",
      tableId: "1",
      tableName: "Table 1",
      guestName: "Julie Lambert",
      guestEmail: "julie.l@email.com",
      guestPhone: "+32 477 88 99 00",
      guestCount: 2,
      startTime: "2026-10-14T13:45:00.000Z",
      endTime: "2026-10-14T15:15:00.000Z",
      status: "Completed"
    },

    // --- SERVICE DU SOIR (19h00 - 22h00) ---
    {
      id: "res-09",
      tableId: "1",
      tableName: "Table 1",
      guestName: "Alexandre Dumas",
      guestEmail: "alex.d@email.be",
      guestPhone: "+32 478 12 34 56",
      guestCount: 2,
      startTime: "2026-10-14T19:00:00.000Z",
      endTime: "2026-10-14T20:30:00.000Z",
      status: "Seated"
    },
    {
      id: "res-10",
      tableId: "2",
      tableName: "Table 2",
      guestName: "Camille Renard",
      guestEmail: "c.renard@email.com",
      guestPhone: "+32 479 23 45 67",
      guestCount: 2,
      startTime: "2026-10-14T19:00:00.000Z",
      endTime: "2026-10-14T20:30:00.000Z",
      status: "Seated"
    },
    {
      id: "res-11",
      tableId: "3",
      tableName: "Table 3",
      guestName: "Nicolas Petit",
      guestEmail: "nicolas.p@email.be",
      guestPhone: "+32 480 34 56 78",
      guestCount: 2,
      startTime: "2026-10-14T19:15:00.000Z",
      endTime: "2026-10-14T20:45:00.000Z",
      status: "Seated"
    },
    {
      id: "res-12",
      tableId: "9",
      tableName: "Table 9",
      guestName: "Pauline Laurent",
      guestEmail: "pauline.l@email.com",
      guestPhone: "+32 481 45 67 89",
      guestCount: 4,
      startTime: "2026-10-14T19:15:00.000Z",
      endTime: "2026-10-14T20:45:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-13",
      tableId: "10",
      tableName: "Table 10",
      guestName: "Julien Mercier",
      guestEmail: "j.mercier@email.be",
      guestPhone: "+32 482 56 78 90",
      guestCount: 4,
      startTime: "2026-10-14T19:30:00.000Z",
      endTime: "2026-10-14T21:00:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-14",
      tableId: "17",
      tableName: "Table 17",
      guestName: "Groupe Vandamme",
      guestEmail: "vandamme.grp@email.com",
      guestPhone: "+32 483 67 89 01",
      guestCount: 6,
      startTime: "2026-10-14T19:30:00.000Z",
      endTime: "2026-10-14T21:00:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-15",
      tableId: "19",
      tableName: "Table 19",
      guestName: "Anniversaire Émilie",
      guestEmail: "emilie.bday@email.be",
      guestPhone: "+32 484 78 90 12",
      guestCount: 8,
      startTime: "2026-10-14T19:30:00.000Z",
      endTime: "2026-10-14T21:30:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-16",
      tableId: "4",
      tableName: "Table 4",
      guestName: "Thibaut Caron",
      guestEmail: "thibaut.c@email.com",
      guestPhone: "+32 485 89 01 23",
      guestCount: 2,
      startTime: "2026-10-14T19:45:00.000Z",
      endTime: "2026-10-14T21:15:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-17",
      tableId: "5",
      tableName: "Table 5",
      guestName: "Laura Fontaine",
      guestEmail: "laura.f@email.be",
      guestPhone: "+32 486 90 12 34",
      guestCount: 2,
      startTime: "2026-10-14T20:00:00.000Z",
      endTime: "2026-10-14T21:30:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-18",
      tableId: "12",
      tableName: "Table 12",
      guestName: "Maxime Gauthier",
      guestEmail: "m.gauthier@email.com",
      guestPhone: "+32 487 01 23 45",
      guestCount: 4,
      startTime: "2026-10-14T20:00:00.000Z",
      endTime: "2026-10-14T21:30:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-19",
      tableId: "6",
      tableName: "Table 6",
      guestName: "Manon Henry",
      guestEmail: "manon.h@email.be",
      guestPhone: "+32 488 12 34 56",
      guestCount: 2,
      startTime: "2026-10-14T20:15:00.000Z",
      endTime: "2026-10-14T21:45:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-20",
      tableId: "13",
      tableName: "Table 13",
      guestName: "Guillaume Roux",
      guestEmail: "g.roux@email.com",
      guestPhone: "+32 489 23 45 67",
      guestCount: 4,
      startTime: "2026-10-14T20:30:00.000Z",
      endTime: "2026-10-14T22:00:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-21",
      tableId: "18",
      tableName: "Table 18",
      guestName: "Hugo Blanc",
      guestEmail: "hugo.b@email.be",
      guestPhone: "+32 490 34 56 78",
      guestCount: 5,
      startTime: "2026-10-14T20:30:00.000Z",
      endTime: "2026-10-14T22:00:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-22",
      tableId: "1",
      tableName: "Table 1",
      guestName: "Romain Chevalier",
      guestEmail: "romain.c@email.com",
      guestPhone: "+32 491 45 67 89",
      guestCount: 2,
      startTime: "2026-10-14T20:45:00.000Z",
      endTime: "2026-10-14T22:15:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-23",
      tableId: "2",
      tableName: "Table 2",
      guestName: "Clara Vincent",
      guestEmail: "clara.v@email.be",
      guestPhone: "+32 492 56 78 90",
      guestCount: 2,
      startTime: "2026-10-14T21:00:00.000Z",
      endTime: "2026-10-14T22:30:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-24",
      tableId: "14",
      tableName: "Table 14",
      guestName: "Arthur Colin",
      guestEmail: "arthur.c@email.com",
      guestPhone: "+32 493 67 89 01",
      guestCount: 4,
      startTime: "2026-10-14T21:00:00.000Z",
      endTime: "2026-10-14T22:30:00.000Z",
      status: "Confirmed"
    },

    // --- ANNULATIONS (Tables libérées) ---
    {
      id: "res-25",
      tableId: "4",
      tableName: "Table 4",
      guestName: "Benoît Masson",
      guestEmail: "b.masson@email.com",
      guestPhone: "+32 495 89 01 23",
      guestCount: 2,
      startTime: "2026-10-14T12:00:00.000Z",
      endTime: "2026-10-14T13:30:00.000Z",
      status: "Cancelled"
    },
    {
      id: "res-26",
      tableId: "3",
      tableName: "Table 3",
      guestName: "Noémie Vidal",
      guestEmail: "noemie.v@email.be",
      guestPhone: "+32 494 78 90 12",
      guestCount: 2,
      startTime: "2026-10-14T21:15:00.000Z",
      endTime: "2026-10-14T22:45:00.000Z",
      status: "Cancelled"
    },

    // --- SERVICE DU LENDEMAIN (15/10/2026) ---
    {
      id: "res-27",
      tableId: "1",
      tableName: "Table 1",
      guestName: "David Moreels",
      guestEmail: "david.m@email.be",
      guestPhone: "+32 497 01 23 45",
      guestCount: 2,
      startTime: "2026-10-15T12:30:00.000Z",
      endTime: "2026-10-15T14:00:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-28",
      tableId: "9",
      tableName: "Table 9",
      guestName: "Inès Marchand",
      guestEmail: "ines.m@email.com",
      guestPhone: "+32 498 12 34 56",
      guestCount: 4,
      startTime: "2026-10-15T19:30:00.000Z",
      endTime: "2026-10-15T21:00:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-29",
      tableId: "10",
      tableName: "Table 10",
      guestName: "Céline Denis",
      guestEmail: "celine.d@email.be",
      guestPhone: "+32 496 90 12 34",
      guestCount: 4,
      startTime: "2026-10-15T20:00:00.000Z",
      endTime: "2026-10-15T21:30:00.000Z",
      status: "Confirmed"
    },
    {
      id: "res-30",
      tableId: "17",
      tableName: "Table 17",
      guestName: "Entreprise Beta",
      guestEmail: "events@beta.be",
      guestPhone: "+32 499 23 45 67",
      guestCount: 6,
      startTime: "2026-10-15T20:00:00.000Z",
      endTime: "2026-10-15T22:30:00.000Z",
      status: "Confirmed"
    }
  ]);

  // Enregistre les réservations sur le disque (appelé après chaque modification)
  save() {
    saveData("reservations", this.reservations);
  }

  // Génère le code suivant dans la séquence (ex: res-30 -> res-31)
  // On ne prend en compte que les codes au format "res-<nombre>"
  generateShortCode() {
    const maxNumber = this.reservations.reduce((max, r) => {
      const match = /^res-(\d+)$/.exec(r.id);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    let next = maxNumber + 1;
    let code = `res-${String(next).padStart(2, "0")}`;
    while (this.getById(code)) { // Sécurité : ne jamais réutiliser un code existant
      next++;
      code = `res-${String(next).padStart(2, "0")}`;
    }
    return code;
  }
  getAll() {
    return this.reservations.map(r => this.withLiveStatus(r));
  }

  // Calcule le statut en fonction de l'heure actuelle :
  //  - Cancelled : annulée (seul statut stocké qui est conservé tel quel)
  //  - Completed : le créneau est terminé (heure de fin dépassée)
  //  - Seated    : le client est à table (entre l'heure de début et l'heure de fin)
  //  - Confirmed : la réservation est à venir
  computeStatus(reservation, now = Date.now()) {
    if (reservation.status === "Cancelled") return "Cancelled";
    const start = new Date(reservation.startTime).getTime();
    const end = new Date(reservation.endTime).getTime();
    if (now >= end) return "Completed";
    if (now >= start) return "Seated";
    return "Confirmed";
  }

  // Renvoie une copie de la réservation avec son statut à jour (sans modifier l'original)
  withLiveStatus(reservation) {
    if (!reservation) return reservation;
    return { ...reservation, status: this.computeStatus(reservation) };
  }

  // Recherche insensible à la casse (res-12 ou RES-12 fonctionnent)
  getById(id) {
    if (!id) return null;
    return this.reservations.find(r => r.id.toLowerCase() === id.toLowerCase());
  }

  // Vérifie si une table est occupée (ignore la réservation en cours si on la modifie)
  isTableOccupied(tableId, startRequested, endRequested, excludeReservationId = null) {
    return this.reservations.some(res => {
      if (res.tableId !== tableId || res.status === "Cancelled" || res.id === excludeReservationId) {
        return false;
      }
      const resStart = new Date(res.startTime).getTime();
      const resEnd = new Date(res.endTime).getTime();

      return startRequested < resEnd && endRequested > resStart;
    });
  }

  // Création avec code court et assignation automatique
  createReservation(data) {
    const startRequested = new Date(data.dateTime).getTime();
    const endRequested = startRequested + this.MEAL_DURATION_MS;
    const guestCount = Number(data.guestCount);

    const candidateTables = tableRepository.getEligibleTables(guestCount);
    const freeTable = candidateTables.find(table => 
      !this.isTableOccupied(table.id, startRequested, endRequested)
    );

    if (!freeTable) {
      return null;
    }

    const newReservation = {
      id: this.generateShortCode(), // Ex: res-31
      tableId: freeTable.id,
      tableName: freeTable.number,
      guestName: data.guestName,
      guestEmail: data.guestEmail,
      guestPhone: data.guestPhone,
      guestCount: guestCount,
      guestMessage: (data.guestMessage || "").toString().trim().slice(0, 500), // Message libre (allergies, occasion...)
      startTime: new Date(startRequested).toISOString(),
      endTime: new Date(endRequested).toISOString(),
      status: "Confirmed"
    };

    this.reservations.push(newReservation);
    this.save();
    return newReservation;
  }

  // Modifier une réservation existante (recalcule la meilleure table disponible)
  updateReservation(id, data) {
    const existing = this.getById(id);
    if (!existing || existing.status === "Cancelled") return null;

    const startRequested = data.dateTime ? new Date(data.dateTime).getTime() : new Date(existing.startTime).getTime();
    const endRequested = startRequested + this.MEAL_DURATION_MS;
    const guestCount = data.guestCount ? Number(data.guestCount) : existing.guestCount;

    // Chercher une table disponible (en ignorant la réservation actuelle pour ne pas se bloquer soi-même)
    const candidateTables = tableRepository.getEligibleTables(guestCount);
    const freeTable = candidateTables.find(table => 
      !this.isTableOccupied(table.id, startRequested, endRequested, existing.id)
    );

    if (!freeTable) {
      return { conflict: true };
    }

    existing.guestName = data.guestName || existing.guestName;
    if (data.guestMessage !== undefined) {
      existing.guestMessage = data.guestMessage.toString().trim().slice(0, 500);
    }
    existing.guestCount = guestCount;
    existing.tableId = freeTable.id;
    existing.tableName = freeTable.number;
    existing.startTime = new Date(startRequested).toISOString();
    existing.endTime = new Date(endRequested).toISOString();

    this.save();
    return existing;
  }

  deleteById(id) {
    const res = this.getById(id);
    if (!res) return false;
    res.status = "Cancelled";
    this.save();
    return true;
  }
}

export default new ReservationMemoryRepository();