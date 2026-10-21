import { Router } from "express";
import tableRepository from "../repository/tableMemory.repository.js";

const tablesRouter = Router();

// GET /api/tables
tablesRouter.get("/", (req, res) => {
  res.status(200).json(tableRepository.getAll());
});

// GET /api/tables/:id
tablesRouter.get("/:id", (req, res) => {
  const table = tableRepository.getById(req.params.id);
  if (!table) {
    return res.status(404).json({ message: "Table introuvable." });
  }
  res.status(200).json(table);
});

// POST /api/tables
tablesRouter.post("/", (req, res) => {
  const { number, capacity } = req.body;
  if (!number || !capacity) {
    return res.status(400).json({ message: "Numéro et capacité requis." });
  }
  const created = tableRepository.create(req.body);
  res.status(201).json(created);
});

// DELETE /api/tables/:id
tablesRouter.delete("/:id", (req, res) => {
  const deleted = tableRepository.deleteById(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Table introuvable." });
  }
  res.status(200).json({ message: "Table supprimée avec succès." });
});

export default tablesRouter;