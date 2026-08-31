import { Router } from "express";

import {
  createRequest,
  getMyRequests,
  getReceivedRequests,
  updateRequestStatus,
} from "../controllers/adoption.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  createAdoptionRequestSchema,
  updateAdoptionStatusSchema,
} from "../validators/adoption.validator.js";

const router = Router();

router.get(
  "/mine",
  protect,
  allowRoles("ADOPTER"),
  getMyRequests
);

router.get(
  "/received",
  protect,
  allowRoles("SHELTER", "OWNER"),
  getReceivedRequests
);

router.post(
  "/:petId",
  protect,
  allowRoles("ADOPTER"),
  validate(createAdoptionRequestSchema),
  createRequest
);

router.patch(
  "/:requestId/status",
  protect,
  allowRoles("SHELTER", "OWNER"),
  validate(updateAdoptionStatusSchema),
  updateRequestStatus
);

export default router;