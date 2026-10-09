import { z } from "zod";

export const signupSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(25, { message: "Password limit is 25 characters" }),
});

export const loginSchema = z.object({
  email: z.email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(25, { message: "Password limit is 25 characters" }),
});

