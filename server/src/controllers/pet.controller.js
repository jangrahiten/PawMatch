import { createPetListing } from "../services/pet.service.js";

export const createPet = async (req,res,next) => {
    try {
        const pet = await createPetListing(req.body,req.user.id);
        return res.status(201).json({
            success: true,
            message: "Pet listing created successfully",
            pet,
        });
    } catch (error){
        next(error);
    }
};