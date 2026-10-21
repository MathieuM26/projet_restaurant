import { Router } from "express";
import userRepository from "../repository/userMemory.repository.js";

const userRouter = Router();

// POST /api/users/login
userRouter.post("/login", (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "L'adresse email est requise." });
  }
  const user = userRepository.getByEmail(email);
  if (!user || !user.active) {
    return res.status(401).json({ error: "Identifiant invalide ou compte inactif." });
  }
  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
});

// GET /api/users
userRouter.get("/", (req, res) => {
  res.status(200).json(userRepository.getAllUsers());
});

// GET /api/users/:id
userRouter.get("/:id", (req, res) => {
  const user = userRepository.getById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }
  res.status(200).json(user);
});

// POST /api/users
userRouter.post("/", (req, res) => {
  const newUser = userRepository.create(req.body);
  res.status(201).json(newUser);
});

// DELETE /api/users/:id
userRouter.delete("/:id", (req, res) => {
  const deleted = userRepository.deleteById(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: "Utilisateur introuvable." });
  }
  res.status(200).json({ message: "Utilisateur supprimé avec succès." });
});

export default userRouter;
