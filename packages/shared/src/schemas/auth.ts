import { z } from "zod";

import { optionalTrimmedString, requiredTrimmedString } from "./helpers";

export const registerSchema = z.object({
  email: requiredTrimmedString().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: requiredTrimmedString(2),
  phone: optionalTrimmedString,
  confirmPassword: z.string().optional()
}).refine((value) => !value.confirmPassword || value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match"
});

export const loginSchema = z.object({
  email: requiredTrimmedString().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1)
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
