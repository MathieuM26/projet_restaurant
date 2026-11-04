import { Router } from "express";
import tableService from "../services/table.service.js";
import { validateCreateTable } from "./tables.validation.js";

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

// POST /api/tables
tablesRouter.post("/", validateCreateTable, (req, res) => {
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
