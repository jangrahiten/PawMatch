import cloudinary from "../config/cloudinary.js";
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

export const updatePetListing = async (petId, ownerId, data) => {
  const pet = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });

  if (!pet) {
    const error = new Error("Pet not found");
    error.statusCode = 404;
    throw error;
  }

  if (pet.ownerId !== ownerId) {
    const error = new Error("You are not allowed to modify this pet");
    error.statusCode = 403;
    throw error;
  }

  return prisma.pet.update({
    where: {
      id: petId,
    },
    data,
    include: {
      images: true,
    },
  });
};

export const deactivatePetListing = async (petId, ownerId) => {
  const pet = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });

  if (!pet) {
    const error = new Error("Pet not found");
    error.statusCode = 404;
    throw error;
  }

  if (pet.ownerId !== ownerId) {
    const error = new Error("You are not allowed to delete this pet");
    error.statusCode = 403;
    throw error;
  }

  return prisma.pet.update({
    where: {
      id: petId,
    },
    data: {
      status: "INACTIVE",
    },
  });
};

const uploadBufferToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pawmatch/pets",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};

export const uploadImagesForPet = async (petId,ownerId,files) => {
  const pet = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });

  if (!pet) {
    const error = new Error("Pet not found");
    error.statusCode = 404;
    throw error;
  }

  if (pet.ownerId !== ownerId) {
    const error = new Error(
      "You are not allowed to upload images for this pet"
    );
    error.statusCode = 403;
    throw error;
  }

  if (!files || files.length === 0) {
    const error = new Error("At least one image is required");
    error.statusCode = 400;
    throw error;
  }

  const uploadedImages = await Promise.all(
    files.map((file) =>
      uploadBufferToCloudinary(file.buffer)
    )
  );

  const currentImageCount = await prisma.petImage.count({
    where: {
      petId,
    },
  });

  const imageRecords = await Promise.all(
    uploadedImages.map((image, index) =>
      prisma.petImage.create({
        data: {
          imageUrl: image.secure_url,
          position: currentImageCount + index,
          petId,
        },
      })
    )
  );

  return imageRecords;
};