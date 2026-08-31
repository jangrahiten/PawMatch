import prisma from "../config/prisma.js";

const getConversationForUser = async (
  conversationId,
  userId
) => {
  const conversation =
    await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        adoptionRequest: {
          include: {
            adopter: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            pet: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
                images: true,
              },
            },
          },
        },
      },
    });

  if (!conversation) {
    const error = new Error("Conversation not found");
    error.statusCode = 404;
    throw error;
  }

  const adopterId =
    conversation.adoptionRequest.adopterId;

  const ownerId =
    conversation.adoptionRequest.pet.ownerId;

  if (
    userId !== adopterId &&
    userId !== ownerId
  ) {
    const error = new Error(
      "You are not allowed to access this conversation"
    );
    error.statusCode = 403;
    throw error;
  }

  return conversation;
};

export const createConversationForRequest = async (
  adoptionRequestId,
  userId
) => {
  const request =
    await prisma.adoptionRequest.findUnique({
      where: {
        id: adoptionRequestId,
      },
      include: {
        pet: true,
      },
    });

  if (!request) {
    const error = new Error(
      "Adoption request not found"
    );
    error.statusCode = 404;
    throw error;
  }

  if (request.status !== "ACCEPTED") {
    const error = new Error(
      "Conversation is only available after the adoption request is accepted"
    );
    error.statusCode = 409;
    throw error;
  }

  const ownerId = request.pet.ownerId;

  if (
    userId !== request.adopterId &&
    userId !== ownerId
  ) {
    const error = new Error(
      "You are not allowed to create this conversation"
    );
    error.statusCode = 403;
    throw error;
  }

  const existing =
    await prisma.conversation.findUnique({
      where: {
        adoptionRequestId,
      },
    });

  if (existing) {
    return existing;
  }

  return prisma.conversation.create({
    data: {
      adoptionRequestId,
    },
  });
};

export const getMyConversations = async (userId) => {
  return prisma.conversation.findMany({
    where: {
      OR: [
        {
          adoptionRequest: {
            adopterId: userId,
          },
        },
        {
          adoptionRequest: {
            pet: {
              ownerId: userId,
            },
          },
        },
      ],
    },
    include: {
      adoptionRequest: {
        include: {
          adopter: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          pet: {
            include: {
              images: {
                orderBy: {
                  position: "asc",
                },
                take: 1,
              },
              owner: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
};

export const getConversationMessages = async (
  conversationId,
  userId
) => {
  await getConversationForUser(
    conversationId,
    userId
  );

  return prisma.message.findMany({
    where: {
      conversationId,
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
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const sendMessage = async (
  conversationId,
  senderId,
  content
) => {
  await getConversationForUser(
    conversationId,
    senderId
  );

  return prisma.message.create({
    data: {
      conversationId,
      senderId,
      content,
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
};