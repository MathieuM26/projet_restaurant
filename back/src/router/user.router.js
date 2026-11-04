import { Router } from "express";
import { isEmail, isNotEmpty } from "class-validator";
import userService from "../services/user.service.js";

const userRouter = Router();

// POST /api/users/login (Validation du format de l'email dans le routeur avec class-validator)
userRouter.post("/login", (req, res) => {
  const { email } = req.body;

  if (!isNotEmpty(email)) {
    return res.status(400).json({ error: "L'adresse email est requise." });
  }
  if (!isEmail(String(email).trim())) {
    return res.status(400).json({ error: "Le format de l'adresse email est invalide." });
  }

  const result = userService.authenticate(email);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  res.status(result.status).json(result.data);
});

// GET /api/users
userRouter.get("/", (req, res) => {
  res.status(200).json(userService.getAllUsers());
});

// GET /api/users/:id
userRouter.get("/:id", (req, res) => {
  const user = userService.getById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }
  res.status(200).json(user);
});

// POST /api/users
userRouter.post("/", (req, res) => {
  const newUser = userService.create(req.body);
  res.status(201).json(newUser);
});

// DELETE /api/users/:id
userRouter.delete("/:id", (req, res) => {
  const deleted = userService.deleteById(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }
  res.status(200).json({ message: "Utilisateur supprimé avec succès." });
});

export default userRouter;
