import { Router } from "express";

import {getMyProfile,updateAdopterProfile,updateShelterProfile} from "../controllers/profile.controller.js";
import { updateAdopterProfileSchema, updateShelterProfileSchema } from "../validators/profile.validator.js";



import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.get("/me", protect, getMyProfile);

router.patch("/adopter", protect, allowRoles("ADOPTER"), updateAdopterProfile);

router.patch(
   "/shelter",
   protect,
   allowRoles("SHELTER", "OWNER"),
   updateShelterProfile,
);

router.patch(
  "/adopter",
  protect,
  allowRoles("ADOPTER"),
  validate(updateAdopterProfileSchema),
  updateAdopterProfile
);

router.patch(
  "/shelter",
  protect,
  allowRoles("SHELTER", "OWNER"),
  validate(updateShelterProfileSchema),
  updateShelterProfile
);
export default router;
