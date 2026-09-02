import {
  getMyProfileService,
  updateAdopterProfileService,
  updateShelterProfileService,
} from "../services/profile.service.js";

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await getMyProfileService(req.user.id);

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdopterProfile = async (req, res, next) => {
  try {
    const profile = await updateAdopterProfileService(
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Adopter profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateShelterProfile = async (req, res, next) => {
  try {
    const profile = await updateShelterProfileService(
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Shelter profile updated successfully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};