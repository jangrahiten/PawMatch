import prisma from "../config/prisma.js";

export const getMyProfileService = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      adopterProfile: true,
      shelterProfile: true,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

export const updateAdopterProfileService = async (
  userId,
  data
) => {
  const profile = await prisma.adopterProfile.upsert({
    where: {
      userId,
    },
    update: {
      bio: data.bio,
      housingType: data.housingType,
      hasChildren: data.hasChildren,
      hasOtherPets: data.hasOtherPets,
      preferredPet: data.preferredPet,
      preferredSize: data.preferredSize,
      preferredAge: data.preferredAge,
      petExperience: data.petExperience,
    },
    create: {
      userId,
      bio: data.bio,
      housingType: data.housingType,
      hasChildren: data.hasChildren,
      hasOtherPets: data.hasOtherPets,
      preferredPet: data.preferredPet,
      preferredSize: data.preferredSize,
      preferredAge: data.preferredAge,
      petExperience: data.petExperience,
    },
  });

  return profile;
};

export const updateShelterProfileService = async (
  userId,
  data
) => {
  const profile = await prisma.shelterProfile.upsert({
    where: {
      userId,
    },
    update: {
      shelterName: data.shelterName,
      description: data.description,
      address: data.address,
      phone: data.phone,
      website: data.website,
    },
    create: {
      userId,
      shelterName: data.shelterName,
      description: data.description,
      address: data.address,
      phone: data.phone,
      website: data.website,
    },
  });

  return profile;
};