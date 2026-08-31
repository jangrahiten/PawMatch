import { Router } from "express";

import {
  addLike,
  getMyLikes,
  removeLike,
} from "../controllers/like.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/",
  protect,
  allowRoles("ADOPTER"),
  getMyLikes
);

router.post(
  "/:petId",
  protect,
  allowRoles("ADOPTER"),
  addLike
);

router.delete(
  "/:petId",
  protect,
  allowRoles("ADOPTER"),
  removeLike
);

export default router;