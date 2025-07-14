import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createStatementSchema } from "./statement.schema";
import { createStatementHandler, listStatementsHandler } from "./statement.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router({ mergeParams: true });

router.use(requireAuth);
router.post("/", validate(createStatementSchema), createStatementHandler);
router.get("/", listStatementsHandler);

export default router;
