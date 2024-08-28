import { Router } from "express";
import { loginHandler } from "../controllers/auth.controller";
import { chatCompletionHandler } from "../controllers/gpt.controller";
import { getUsers } from "../controllers/user.controller";

const router = Router();

router.get("/api/users", getUsers);
router.post("/api/login", loginHandler);
router.post("/api/chat", chatCompletionHandler);

export default router;
