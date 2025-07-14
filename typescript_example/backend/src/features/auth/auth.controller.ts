import { Request, Response } from "express";
import { login, signUp } from "./auth.service";

export const signUpHandler = async (req: Request, res: Response) => {
  try {
    const { email, name, password } = req.body;
    const user = await signUp({ body: { email: email, name: name, password: password } });

    res.status(201).json(user);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await login({ body: { email: email, password: password } });

    res.status(200).json({ user: user, token: token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    }
  }
};

export const logoutHandler = async (_req: Request, res: Response) => {
  res.status(204).end();
};
