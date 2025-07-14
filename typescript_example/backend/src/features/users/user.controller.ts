import { Request, Response } from "express";
import { createUser, getUserById } from "./user.service";
import { RequiredUserData } from "./user.interfaces";
import { parseId } from "../../utils/parseId";

export const getUserHandler = async (req: Request, res: Response) => {
  try {
    const id = parseId(req.params.id, "user ID");

    const user = await getUserById(id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body as RequiredUserData;

    const user = await createUser({ email, name, password });
    res.status(201).json(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};
