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