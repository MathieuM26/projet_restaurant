import { Router } from "express";
import { isInt, isNotEmpty, min } from "class-validator";
import tableService from "../services/table.service.js";

const tablesRouter = Router();

// GET /api/tables
tablesRouter.get("/", (req, res) => {
  res.status(200).json(tableService.getAll());
});

// GET /api/tables/:id
tablesRouter.get("/:id", (req, res) => {
  const table = tableService.getById(req.params.id);
  if (!table) {
    return res.status(404).json({ message: "Table introuvable." });
  }
  res.status(200).json(table);
});

// POST /api/tables (Validation du format dans le routeur avec class-validator)
tablesRouter.post("/", (req, res) => {
  const { number, capacity } = req.body;
  const cap = Number(capacity);

  if (!isNotEmpty(number) || !isInt(cap) || !min(cap, 1)) {
    return res.status(400).json({ message: "Numéro et capacité valide (>= 1) requis." });
  }

  const result = tableService.create(req.body);
  res.status(result.status).json(result.data);
});

// DELETE /api/tables/:id
tablesRouter.delete("/:id", (req, res) => {
  const deleted = tableService.deleteById(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Table introuvable." });
  }
  res.status(200).json({ message: "Table supprimée avec succès." });
});

export default tablesRouter;
