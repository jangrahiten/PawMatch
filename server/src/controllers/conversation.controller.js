import {
  createConversationForRequest,
  getConversationMessages,
  getMyConversations,
  markConversationAsReadService,
  sendMessage,
} from "../services/conversation.service.js";

export const createConversation = async (
  req,
  res,
  next
) => {
  try {
    const conversation =
      await createConversationForRequest(
        req.params.requestId,
        req.user.id
      );

    return res.status(201).json({
      success: true,
      conversation,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (
  req,
  res,
  next
) => {
  try {
    const conversations =
      await getMyConversations(req.user.id);

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const result = await getConversationMessages(
      req.params.conversationId,
      req.user.id,
      req.validated.query
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (
  req,
  res,
  next
) => {
  try {
    const message = await sendMessage(
      req.params.conversationId,
      req.user.id,
      req.body.content
    );

    return res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

export const markConversationAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await markConversationAsReadService(
      conversationId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    next(error);
  }
};