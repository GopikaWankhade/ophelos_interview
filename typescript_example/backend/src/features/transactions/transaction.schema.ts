import { z } from "zod";

const transactionItem = z.object({
  type: z.enum(["Income", "Expenditure"]),
  amount_in_cents: z.number().int().positive(),
  label: z.string().min(1),
  description: z.string().optional(),
});

export const createTransactionsSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^\d+$/)
      .transform((v) => parseInt(v, 10)), // userId
    sid: z
      .string()
      .regex(/^\d+$/)
      .transform((v) => parseInt(v, 10)), // statementId
  }),
  body: z.array(transactionItem).min(1),
});

export type CreateTransactionInput = z.infer<typeof createTransactionsSchema>;
