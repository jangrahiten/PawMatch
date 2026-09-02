import * as cookie from "cookie"
import prisma from "../config/prisma.js";
import { verifyToken } from "../utils/jwt.js";


export const initializeSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;

      if (!rawCookie) {
        return next(new Error("Authentication required"));
      }

      const cookies = cookie.parseCookie(rawCookie);
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = verifyToken(token);

      if (!decoded?.userId) {
        return next(new Error("Invalid authentication token"));
      }

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
        },
        select: {
          id: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      console.error("SOCKET AUTH ERROR:",error);
      next(new Error(error.message));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      `Socket connected: ${socket.id} - ${socket.user.name}`
    );
    
    socket.on("mark-conversation-read",
      ({conversationId})=>{
        io.emit("conversation-read-update",{
          conversationId,
          userId: socket.user.id,
        });
      });

    socket.on("join-conversation", async (conversationId) => {
      try {
        const conversation =
          await prisma.conversation.findUnique({
            where: {
              id: conversationId,
            },
            include: {
              adoptionRequest: {
                include: {
                  pet: true,
                },
              },
            },
          });

        if (!conversation) {
          return socket.emit("socket-error", {
            message: "Conversation not found",
          });
        }

        const adopterId =
          conversation.adoptionRequest.adopterId;

        const ownerId =
          conversation.adoptionRequest.pet.ownerId;

        if (
          socket.user.id !== adopterId &&
          socket.user.id !== ownerId
        ) {
          return socket.emit("socket-error", {
            message:
              "You are not allowed to access this conversation",
          });
        }

        socket.join(conversationId);

        socket.emit("conversation-joined", {
          conversationId,
        });
      } catch (error) {
        console.error(error);

        socket.emit("socket-error", {
          message: "Unable to join conversation",
        });
      }
    });

    socket.on("leave-conversation", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });

    socket.on("send-message", async ({ conversationId, content }) => {
    try {
        if (!conversationId || !content?.trim()) {
            return socket.emit("socket-error", {
                message: "Conversation ID and message content are required",
            });
        }

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
            include: {
                adoptionRequest: {
                include: {
                    pet: true,
                },
                },
            },
        });

        if (!conversation) {
        return socket.emit("socket-error", {
            message: "Conversation not found",
        });
        }

        const adopterId = conversation.adoptionRequest.adopterId;
        const ownerId = conversation.adoptionRequest.pet.ownerId;

        if (socket.user.id !== adopterId && socket.user.id !== ownerId) {
        return socket.emit("socket-error", {
            message: "You are not allowed to send messages in this conversation",
        });
        }

        const message = await prisma.message.create({
        data: {
            conversationId,
            senderId: socket.user.id,
            content: content.trim(),
        },
        include: {
            sender: {
            select: {
                id: true,
                name: true,
                avatar: true,
            },
            },
        },
        });

        io.to(conversationId).emit("new-message", message);
        
        const receiverId = socket.user.id === adopterId ? ownerId : adopterId;

        io.emit("conversation-unread-update", {
          conversationId,
          receiverId,
        });

        io.emit("conversation-preview-update", {
          conversationId,
          message,
        });

    } catch (error) {
        console.error(error);

        socket.emit("socket-error", {
        message: "Unable to send message",
        });
    }
    });

    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user-typing", {
        conversationId,
        userId: socket.user.id,
        name: socket.user.name,
      });
    });

    socket.on("stop-typing", ({ conversationId }) => {
      socket.to(conversationId).emit("user-stop-typing", {
        conversationId,
        userId: socket.user.id,
      });
    });

  });

};
