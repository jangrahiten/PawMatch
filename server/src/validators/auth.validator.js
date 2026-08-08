import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters"),

  email: z.string().trim().email("Please enter a valid email address").transform((value) => value.toLowerCase()),

  password: z.string().min(8, "Password must contain at least 8 characters").max(72, "Password must not exceed 72 characters"),

  role: z.enum(["ADOPTER", "SHELTER", "OWNER"]).default("ADOPTER"),

  city: z.string().trim().min(2, "City must be at least 2 characters").max(50, "City must not exceed 50 characters").optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").transform((value) => value.toLowerCase()),

  password: z.string().min(1, "Password is required"),
}); 