import { Router } from "express";

import { createPet, getPet, getPets } from "../controllers/pet.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPetSchema, getPetsQuerySchema } from "../validators/pet.validator.js";

const router = Router();

router.get("/", validate(getPetsQuerySchema, "query"), getPets);
router.get("/:id", getPet);
router.post("/",protect,allowRoles("SHELTER","OWNER"), validate(createPetSchema),createPet);

export default router;