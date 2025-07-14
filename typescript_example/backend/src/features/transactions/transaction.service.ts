import { PrismaClient, Transaction } from "../../../generated/prisma_client";
import { TransactionItem } from "./transaction.interface";

const prisma = new PrismaClient();

export const createTransactions = async (
  statementId: number,
  items: Array<TransactionItem>,
): Promise<Transaction[]> => {
  return prisma.$transaction(
    items.map((item) =>
      prisma.transaction.create({
        data: {
          ...item,
          statement: { connect: { id: statementId } },
        },
      }),
    ),
  );
};

export const getTransactionsByStatement = (statementId: number): Promise<Transaction[]> => {
  return prisma.transaction.findMany({
    where: { statementId },
    orderBy: { createdAt: "desc" },
  });
};
