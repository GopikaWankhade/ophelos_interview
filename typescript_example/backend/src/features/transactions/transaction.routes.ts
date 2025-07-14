import { Router } from "express";
import { validate } from "../../middleware/validate";
import { createTransactionsHandler, listTransactionsHandler } from "./transaction.controller";
import { createTransactionsSchema } from "./transaction.schema";

const router = Router({ mergeParams: true });

router.post("/", validate(createTransactionsSchema), createTransactionsHandler);

router.get("/", listTransactionsHandler);

export default router;
