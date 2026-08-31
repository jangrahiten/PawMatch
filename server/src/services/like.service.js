import prisma from "../config/prisma.js";

export const likePet = async (userId, petId) => {
  const pet = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });

  if (!pet || pet.status !== "AVAILABLE") {
    const error = new Error("Pet not found or unavailable");
    error.statusCode = 404;
    throw error;
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_petId: {
        userId,
        petId,
      },
    },
  });

  if (existingLike) {
    const error = new Error("You have already liked this pet");
    error.statusCode = 409;
    throw error;
  }

  return prisma.like.create({
    data: {
      userId,
      petId,
    },
  });
};

export const unlikePet = async (userId, petId) => {
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_petId: {
        userId,
        petId,
      },
    },
  });

  if (!existingLike) {
    const error = new Error("Like not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.like.delete({
    where: {
      id: existingLike.id,
    },
  });
};

export const getLikedPets = async (userId) => {
  return prisma.like.findMany({
    where: {
      userId,
    },
    include: {
      pet: {
        include: {
          images: true,
          owner: {
            select: {
              id: true,
              name: true,
              role: true,
              city: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};