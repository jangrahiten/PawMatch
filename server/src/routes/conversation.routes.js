import { Router } from "express";

import {
  createConversation,
  createMessage,
  getConversations,
  getMessages,
  markConversationAsRead,
} from "../controllers/conversation.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";

import {getMessagesQuerySchema,sendMessageSchema} from "../validators/message.validator.js";

const router = Router();

router.get("/",protect,getConversations);

router.get("/:conversationId/messages",protect,validate(getMessagesQuerySchema, "query"),getMessages);

router.post("/request/:requestId",protect,createConversation);

router.post("/:conversationId/messages",protect,validate(sendMessageSchema),createMessage);

router.patch("/:conversationId/read",protect,markConversationAsRead)

export default router;