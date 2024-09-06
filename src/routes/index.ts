import { Router } from "express";
import { loginHandler } from "../controllers/auth.controller";
import {
  chatCompletionHandler,
  createGroup,
} from "../controllers/gpt.controller";
import {
  getUsers,
  createUser,
  getInfoGroups,
} from "../controllers/user.controller";
import { getGroups, getListStudents } from "../controllers/group.controller";

const router = Router();

router.get("/api/users", getUsers);
router.post("/api/registerUser", createUser);
router.post("/api/login", loginHandler);
router.post("/api/chat", chatCompletionHandler);
router.post("/api/createGroups", createGroup);
router.get("/api/groups", getGroups); //Listado de grupos
router.get("/api/listStudents", getListStudents); //Listado de estudiantes (especificar luego de qué curso)
router.post("/api/infoGroups", getInfoGroups); //Info de grupos por estudiante

export default router;
