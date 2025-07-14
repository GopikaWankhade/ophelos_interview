import { z } from "zod";

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
