import { Router } from "express";
import { loginHandler } from "../controllers/auth.controller";
import {
  chatCompletionHandler,
  createGroup,
} from "../controllers/gpt.controller";
import { getUsers, createUser } from "../controllers/user.controller";

const router = Router();

router.get("/api/users", getUsers);
router.post("/api/registerUser", createUser);
router.post("/api/login", loginHandler);
router.post("/api/chat", chatCompletionHandler);
router.post("/api/createGroups", createGroup);

export default router;
