"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import socket from "@/lib/socket";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();

  const [conversations, setConversations] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/conversations");

        setConversations(
          response.data.conversations
        );
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load conversations"
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchConversations();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;

    const handleUnreadUpdate = (data) => {
      if (data.receiverId !== user.id) return;

      setConversations((current) =>
        current.map((conversation) => {
          if (
            conversation.id !==
            data.conversationId
          ) {
            return conversation;
          }

          return {
            ...conversation,
            _count: {
              ...conversation._count,
              messages:
                (conversation._count
                  ?.messages || 0) + 1,
            },
          };
        })
      );
    };

    const handleReadUpdate = (data) => {
      if (data.userId !== user.id) return;

      setConversations((current) =>
        current.map((conversation) => {
          if (
            conversation.id !==
            data.conversationId
          ) {
            return conversation;
          }

          return {
            ...conversation,
            _count: {
              ...conversation._count,
              messages: 0,
            },
          };
        })
      );
    };

    const handlePreviewUpdate = (data) => {
      setConversations((current) => {
        const updated = current.map(
          (conversation) => {
            if (
              conversation.id !==
              data.conversationId
            ) {
              return conversation;
            }

            return {
              ...conversation,
              messages: [data.message],
            };
          }
        );

        const target = updated.find(
          (conversation) =>
            conversation.id ===
            data.conversationId
        );

        const others = updated.filter(
          (conversation) =>
            conversation.id !==
            data.conversationId
        );

        return target
          ? [target, ...others]
          : updated;
      });
    };

    socket.on(
      "conversation-read-update",
      handleReadUpdate
    );

    socket.on(
      "conversation-unread-update",
      handleUnreadUpdate
    );

    socket.on(
      "conversation-preview-update",
      handlePreviewUpdate
    );

    return () => {
      socket.off(
        "conversation-unread-update",
        handleUnreadUpdate
      );

      socket.off(
        "conversation-read-update",
        handleReadUpdate
      );

      socket.off(
        "conversation-preview-update",
        handlePreviewUpdate
      );
    };
  }, [user]);

  if (authLoading || loading) {
    return (
      <LoadingSpinner text="Loading conversations..." />
    );
  }

  if (!user) {
    return (
      <main className="p-8">
        <p>
          You need to log in to view messages.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl p-6 pb-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Messages
        </h1>

        <p className="mt-2 text-gray-500">
          Chat with adopters, shelters and pet
          owners about accepted adoption requests.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <EmptyState
          title="No conversations yet"
          description="A conversation will appear here after an adoption request has been accepted."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white">
          {conversations.map(
            (conversation, index) => {
              const request =
                conversation.adoptionRequest;

              const pet = request.pet;

              const otherUser =
                user.id === request.adopter.id
                  ? pet.owner
                  : request.adopter;

              const lastMessage =
                conversation.messages?.[0];

              const unreadCount =
                conversation._count?.messages ||
                0;

              return (
                <Link
                  key={conversation.id}
                  href={`/messages/${conversation.id}`}
                  className={`group block transition ${
                    index !== 0
                      ? "border-t"
                      : ""
                  } ${
                    unreadCount > 0
                      ? "bg-gray-50"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex gap-4 p-4 sm:p-5">
                    {/* Pet Image */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-18 sm:w-18">
                      {pet.images?.length > 0 ? (
                        <img
                          src={
                            pet.images[0]
                              .imageUrl
                          }
                          alt={pet.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}

                      {unreadCount > 0 && (
                        <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-black ring-2 ring-white" />
                      )}
                    </div>

                    {/* Conversation content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2
                            className={`truncate text-base ${
                              unreadCount > 0
                                ? "font-bold text-black"
                                : "font-semibold text-gray-900"
                            }`}
                          >
                            {otherUser.name}
                          </h2>

                          <p className="mt-0.5 truncate text-sm text-gray-500">
                            About{" "}
                            <span className="font-medium text-gray-700">
                              {pet.name}
                            </span>
                          </p>
                        </div>

                        {lastMessage?.createdAt && (
                          <span className="shrink-0 text-xs text-gray-400">
                            {formatMessageTime(
                              lastMessage.createdAt
                            )}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <p
                          className={`min-w-0 flex-1 truncate text-sm ${
                            unreadCount > 0
                              ? "font-medium text-gray-900"
                              : "text-gray-500"
                          }`}
                        >
                          {lastMessage
                            ? `${
                                lastMessage.senderId ===
                                user.id
                                  ? "You: "
                                  : ""
                              }${lastMessage.content}`
                            : "Start the conversation"}
                        </p>

                        {unreadCount > 0 && (
                          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-black px-2 text-xs font-medium text-white">
                            {unreadCount > 99
                              ? "99+"
                              : unreadCount}
                          </span>
                        )}

                        <span className="hidden text-gray-400 transition-transform group-hover:translate-x-1 sm:block">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }
          )}
        </div>
      )}
    </main>
  );
}

function formatMessageTime(date) {
  const messageDate = new Date(date);
  const now = new Date();

  const isToday =
    messageDate.toDateString() ===
    now.toDateString();

  if (isToday) {
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return messageDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
}