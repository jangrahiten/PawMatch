import { Router } from "express";

import { createPet, deletePet, deletePetImageController, getPet, getPets, updatePet, uploadPetImagesController } from "../controllers/pet.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPetSchema, getPetsQuerySchema, updatePetSchema } from "../validators/pet.validator.js";
import { uploadPetImages } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", validate(getPetsQuerySchema, "query"), getPets);
router.get("/:id", getPet);
router.post("/",protect,allowRoles("SHELTER","OWNER"), validate(createPetSchema),createPet);
router.patch("/:id", protect, allowRoles("SHELTER","OWNER"),validate(updatePetSchema),updatePet);
router.delete("/:id",protect,allowRoles("SHELTER","OWNER"),deletePet);
router.post("/:id/images",protect,allowRoles("SHELTER","OWNER"),uploadPetImages,uploadPetImagesController);
router.delete("/:petId/images/:imageId",protect,allowRoles("SHELTER","OWNER"),deletePetImageController);
export default router;