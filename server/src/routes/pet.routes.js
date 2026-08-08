import { Router } from "express";

import { createPet } from "../controllers/pet.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPetSchema } from "../validators/pet.validator.js";

const router = Router();

router.post("/",protect,allowRoles("SHELTER","OWNER"), validate(createPetSchema),createPet);

export default router;