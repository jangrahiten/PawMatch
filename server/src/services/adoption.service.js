import prisma from "../config/prisma.js";

export const createAdoptionRequest = async (
  adopterId,
  petId,
  data
) => {
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
  });

  if (!pet || pet.status !== "AVAILABLE") {
    const error = new Error("Pet not found or unavailable");
    error.statusCode = 404;
    throw error;
  }

  const existingRequest =
    await prisma.adoptionRequest.findUnique({
      where: {
        adopterId_petId: {
          adopterId,
          petId,
        },
      },
    });

  if (existingRequest) {
    const error = new Error(
      "You have already submitted an adoption request for this pet"
    );
    error.statusCode = 409;
    throw error;
  }

  return prisma.adoptionRequest.create({
    data: {
      adopterId,
      petId,
      message: data.message,
    },
    include: {
      pet: {
        include: {
          images: true,
        },
      },
    },
  });
};

export const getMyAdoptionRequests = async (adopterId) => {
  return prisma.adoptionRequest.findMany({
    where: {
      adopterId,
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

export const getReceivedAdoptionRequests = async (ownerId) => {
  return prisma.adoptionRequest.findMany({
    where: {
      pet: {
        ownerId,
      },
    },
    include: {
      adopter: {
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          adopterProfile: true,
        },
      },
      pet: {
        include: {
          images: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const updateAdoptionRequestStatus = async (
  requestId,
  ownerId,
  status
) => {
  const request = await prisma.adoptionRequest.findUnique({
    where: {
      id: requestId,
    },
    include: {
      pet: true,
    },
  });

  if (!request) {
    const error = new Error("Adoption request not found");
    error.statusCode = 404;
    throw error;
  }

  if (request.pet.ownerId !== ownerId) {
    const error = new Error(
      "You are not allowed to manage this adoption request"
    );
    error.statusCode = 403;
    throw error;
  }

  if (request.status !== "PENDING") {
    const error = new Error(
      "This adoption request has already been processed"
    );
    error.statusCode = 409;
    throw error;
  }

  if (status === "ACCEPTED") {
    return prisma.$transaction(async (tx) => {
      const updatedRequest =
        await tx.adoptionRequest.update({
          where: {
            id: requestId,
          },
          data: {
            status: "ACCEPTED",
          },
        });

      await tx.pet.update({
        where: {
          id: request.petId,
        },
        data: {
          status: "PENDING",
        },
      });

      return updatedRequest;
    });
  }

  return prisma.adoptionRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: "REJECTED",
    },
  });
};