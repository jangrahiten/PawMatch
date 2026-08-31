import {
  getLikedPets,
  likePet,
  unlikePet,
} from "../services/like.service.js";

export const addLike = async (req, res, next) => {
  try {
    const like = await likePet(
      req.user.id,
      req.params.petId
    );

    return res.status(201).json({
      success: true,
      message: "Pet liked successfully",
      like,
    });
  } catch (error) {
    next(error);
  }
};

export const removeLike = async (req, res, next) => {
  try {
    await unlikePet(
      req.user.id,
      req.params.petId
    );

    return res.status(200).json({
      success: true,
      message: "Pet unliked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLikes = async (req, res, next) => {
  try {
    const likes = await getLikedPets(req.user.id);

    return res.status(200).json({
      success: true,
      count: likes.length,
      likes,
    });
  } catch (error) {
    next(error);
  }
};