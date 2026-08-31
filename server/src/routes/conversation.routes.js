import { Router } from "express";

import {
  createConversation,
  createMessage,
  getConversations,
  getMessages,
} from "../controllers/conversation.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {
  sendMessageSchema,
} from "../validators/message.validator.js";

const router = Router();

router.get(
  "/",
  protect,
  getConversations
);

router.post(
  "/request/:requestId",
  protect,
  createConversation
);

router.get(
  "/:conversationId/messages",
  protect,
  getMessages
);

router.post(
  "/:conversationId/messages",
  protect,
  validate(sendMessageSchema),
  createMessage
);

export default router;