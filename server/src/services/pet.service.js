import prisma from "../config/prisma.js";

export const createPetListing = async (petData, ownerId) => {
    const pet = await prisma.pet.create({
        data: {
            ...petData,
            ownerId,
        },
        include: {
            images: true,
        },
    });

    return pet;
}

export const getAllPets = async (filters) => {
  const {
    animalType,
    gender,
    size,
    city,
    vaccinated,
    neutered,
    page,
    limit,
  } = filters;

  const where = {
    status: "AVAILABLE",
  };

  if (animalType) {
    where.animalType = animalType;
  }

  if (gender) {
    where.gender = gender;
  }

  if (size) {
    where.size = size;
  }

  if (city) {
    where.city = {
      equals: city,
      mode: "insensitive",
    };
  }

  if (vaccinated !== undefined) {
    where.vaccinated = vaccinated;
  }

  if (neutered !== undefined) {
    where.neutered = neutered;
  }

  const skip = (page - 1) * limit;

  const [pets, total] = await Promise.all([
    prisma.pet.findMany({
      where,
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            role: true,
            city: true,
            shelterProfile: {
              select: {
                shelterName: true,
                isVerified: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.pet.count({
      where,
    }),
  ]);

  return {
    pets,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getPetById = async (petId)=>{
    return prisma.pet.findUnique({
        where: {
            id: petId,
        },
        include: {
        images: true,
        owner: {
            select: {
                id: true,
                name: true,
                role: true,
                city: true,
                shelterProfile: {
                    select: {
                    shelterName: true,
                    description: true,
                    phone: true,
                    website: true,
                    isVerified: true,
                    },
                },
            },
        },
    },
  });
};