import { z } from "zod";

export const createStatementSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
  }),
});

export type CreateStatementInput = z.infer<typeof createStatementSchema>;
