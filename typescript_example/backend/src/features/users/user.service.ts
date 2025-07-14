import { PrismaClient, User } from "../../../generated/prisma_client";
import { PrivateUserData, PublicUserData, RequiredUserData } from "./user.interfaces";

const prisma = new PrismaClient();

export const getUserById = async (id: number): Promise<PublicUserData | null> => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

export const createUser = async (data: RequiredUserData): Promise<PublicUserData> => {
  const createdUser = await prisma.user.create({ data });

  return {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
    createdAt: createdUser.createdAt,
  };
};

export const getUserByEmail = async (email: string): Promise<PrivateUserData | null> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return null;
  }

  return {
    email: user.email,
    password: user.password,
    id: user.id,
    name: user.name,
    createdAt: user.createdAt,
  };
};
