import { PrismaClient, Statement, Transaction } from "../../../generated/prisma_client";

const prisma = new PrismaClient();

type StatementWithTransactions = Statement & { transactions: Transaction[] };

export const createStatement = async (
  userId: string,
  name: string,
): Promise<StatementWithTransactions> => {
  const parsedUserId = parseInt(userId);

  return prisma.statement.create({
    data: {
      user: {
        connect: {
          id: parsedUserId,
        },
      },
      name: name,
    },
    include: { transactions: true },
  });
};

export const getStatementsByUser = async (userId: string): Promise<StatementWithTransactions[]> => {
  const parsedUserId = parseInt(userId);

  return prisma.statement.findMany({
    where: { userId: parsedUserId },
    orderBy: { createdAt: "desc" },
    include: { transactions: true },
  });
};
