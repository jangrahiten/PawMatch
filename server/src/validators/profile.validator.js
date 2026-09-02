import { z } from "zod";

export const updateAdopterProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(500).optional(),
    housingType: z.string().max(100).optional(),
    hasChildren: z.boolean().optional(),
    hasOtherPets: z.boolean().optional(),
    preferredPet: z.string().max(50).optional(),
    preferredSize: z.string().max(50).optional(),
    preferredAge: z.string().max(50).optional(),
    petExperience: z.string().max(500).optional(),
  }),
});

export const updateShelterProfileSchema = z.object({
  body: z.object({
    shelterName: z.string().min(2).max(100).optional(),
    description: z.string().max(1000).optional(),
    address: z.string().max(250).optional(),
    phone: z.string().max(20).optional(),
    website: z.string().url().optional().or(z.literal("")),
  }),
});