import { createPetListing, deactivatePetListing, getAllPets, getPetById, updatePetListing } from "../services/pet.service.js";

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

export const getPets = async (req, res, next) => {
  try {
    const result = await getAllPets(req.validated.query);

    return res.status(200).json({
      success: true,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      pets: result.pets,
    });
  } catch (error) {
    next(error);
  }
};

export const getPet = async (req,res,next)=>{
    try {
        const pet = await getPetById(req.params.id);
        if (!pet) {
            return res.status(404).json({
                success: false,
                message: "Pet not found",
            });
        }
        return res.status(200).json({
            success: true,
            pet,
        });
    } catch (error) {
        next (error);
    }
};

export const updatePet = async (req, res, next) => {
  try {
    const pet = await updatePetListing(
      req.params.id,
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Pet listing updated successfully",
      pet,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePet = async (req, res, next) => {
  try {
    const pet = await deactivatePetListing(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Pet listing deactivated successfully",
      pet,
    });
  } catch (error) {
    next(error);
  }
};