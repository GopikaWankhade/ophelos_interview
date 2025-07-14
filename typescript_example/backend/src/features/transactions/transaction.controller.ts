import { Request, Response } from "express";
import { parseId } from "../../utils/parseId";
import { CreateTransactionInput } from "./transaction.schema";
import { createTransactions, getTransactionsByStatement } from "./transaction.service";

export const createTransactionsHandler = async (req: Request, res: Response) => {
  try {
    const statementId = parseId(req.params.sid, "statement Id");
    const items = req.body as CreateTransactionInput["body"];
    const createdTransactions = await createTransactions(statementId, items);

    res.status(201).json(createdTransactions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const listTransactionsHandler = async (req: Request, res: Response) => {
  try {
    const statementId = parseId(req.params.sid, "statement Id");
    const transactions = await getTransactionsByStatement(statementId);

    res.json(transactions);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};
