import { Router } from "express";
import { createUserSchema } from "./user.schema";
import { validate } from "../../middleware/validate";
import { createUserHandler, getUserHandler } from "./user.controller";

const router = Router();

router.post("/", validate(createUserSchema), createUserHandler);

router.get("/:id", getUserHandler);

export default router;
