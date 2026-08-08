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