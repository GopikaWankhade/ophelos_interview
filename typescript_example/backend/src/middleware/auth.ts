import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.header("Authorization")?.split(" ")[1];

  if (!auth) {
    res.status(401).json({ message: "Missing Authorization header" });
    return;
  }

  try {
    const payload = jwt.verify(auth, process.env.JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  }
};
