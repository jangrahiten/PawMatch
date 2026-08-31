import { z } from "zod";

export const createAdoptionRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000)
    .optional(),
});

export const updateAdoptionStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "REJECTED"]),
});