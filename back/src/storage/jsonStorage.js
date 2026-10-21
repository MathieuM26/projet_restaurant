import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Dossier où sont enregistrées les données : back/data/
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "data");

function getFilePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

// Charge les données depuis back/data/<name>.json
// Si le fichier n'existe pas encore (premier lancement), on le crée avec les données par défaut.
export function loadData(name, defaultData) {
  const filePath = getFilePath(name);
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  } catch (err) {
    console.error(`Impossible de lire ${filePath}, utilisation des données par défaut :`, err.message);
  }
  saveData(name, defaultData);
  return defaultData;
}

// Enregistre les données dans back/data/<name>.json (appelé après chaque modification)
export function saveData(name, data) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2), "utf-8");
}
