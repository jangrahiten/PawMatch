import { z } from "zod";

export const createPetSchema = z.object({
  name: z.string().trim().min(2).max(50),

  animalType: z.enum(["DOG","CAT","BIRD","RABBIT","OTHER",]),

  breed: z.string().trim().max(50).optional(),

  age: z.number().int().min(0).max(40).optional(),

  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),

  size: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),

  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),

  city: z.string().trim().min(2).max(50),
  vaccinated: z.boolean().optional(),
  neutered: z.boolean().optional(),
  goodWithChildren: z.boolean().optional(),
  goodWithPets: z.boolean().optional(),
});

export const getPetsQuerySchema = z.object({
  animalType: z
    .enum(["DOG", "CAT", "BIRD", "RABBIT", "OTHER"])
    .optional(),

  gender: z
    .enum(["MALE", "FEMALE", "UNKNOWN"])
    .optional(),

  size: z
    .enum(["SMALL", "MEDIUM", "LARGE"])
    .optional(),

  city: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .optional(),

  vaccinated: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  neutered: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),

  page: z
    .coerce
    .number()
    .int()
    .min(1, "Page must be at least 1")
    .default(1),

  limit: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(50, "Limit must not exceed 50")
    .default(10),
});
export const updatePetSchema = createPetSchema
  .partial()
  .extend({
    status: z.enum(["AVAILABLE", "PENDING", "ADOPTED", "INACTIVE"]).optional(),
  })
  .refine((data)=> Object.keys(data).length > 0, {
    message: "Atleast one field must be provided",
  });