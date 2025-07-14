import { PrismaClient } from "../../../generated/prisma_client";
import { hashPassword, verifyPassword } from "../../utils/hash";
import { CreateUserInput } from "../users/user.schema";
import { createUser, getUserByEmail } from "../users/user.service";
import { AuthResponse } from "./auth.interfaces";
import jwt from "jsonwebtoken";
import { LoginInput } from "./auth.schema";
import { PublicUserData } from "../users/user.interfaces";

const prisma = new PrismaClient();

export const signUp = async (data: CreateUserInput): Promise<PublicUserData> => {
  const { email, password, name } = data.body;
  const existing = await getUserByEmail(email);

  if (existing) {
    throw new Error("User already Exists");
  }

  const hashed = await hashPassword(password);
  const user = await createUser({ email: email, name: name, password: hashed });

  return {
    ...user,
  };
};

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const { email, password } = data.body;
  const user = await getUserByEmail(email);

  if (!user) throw new Error("Invalid credentials");

  const valid = await verifyPassword(password, user.password);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "2d" });

  return {
    user: {
      name: user.name,
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
    token: token,
  };
};
