import { Router } from "express";
import userService from "../services/user.service.js";
import { validateLogin } from "./user.validation.js";

const userRouter = Router();

// POST /api/users/login
userRouter.post("/login", validateLogin, (req, res) => {
  const result = userService.authenticate(req.body.email);
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
