import { Router } from "express";
import { loginHandler, signUpHandler } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { createUserSchema } from "../users/user.schema";
import { loginSchema } from "./auth.schema";

const router = Router();

router.post("/signup", validate(createUserSchema), signUpHandler);
router.post("/login", validate(loginSchema), loginHandler);

export default router;
