import { Router } from "express";

import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;