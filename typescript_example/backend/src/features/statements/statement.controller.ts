import { Response } from "express";
import { createStatement, getStatementsByUser } from "./statement.service";
import { AuthRequest } from "../../middleware/auth";

export const createStatementHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { name } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const statement = await createStatement(userId, name);
    res.status(201).json(statement);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const listStatementsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const statements = await getStatementsByUser(userId);
    res.json(statements);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};
