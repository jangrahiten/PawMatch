"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import socket from "@/lib/socket";

export default function MessagesPage() {
   const { user, loading: authLoading } = useAuth();

   const [conversations, setConversations] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      const fetchConversations = async () => {
         if (!user) return;

         try {
            setLoading(true);
            setError("");

            const response = await api.get("/conversations");

            setConversations(response.data.conversations);
         } catch (error) {
            setError(
               error.response?.data?.message || "Unable to load conversations",
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
               if (conversation.id !== data.conversationId) {
                  return conversation;
               }

               return {
                  ...conversation,
                  _count: {
                     ...conversation._count,
                     messages: (conversation._count?.messages || 0) + 1,
                  },
               };
            }),
         );
      };

      const handleReadUpdate = (data) => {
         if (data.userId !== user.id) return;

         setConversations((current) =>
            current.map((conversation) => {
               if (conversation.id !== data.conversationId) {
                  return conversation;
               }

               return {
                  ...conversation,
                  _count: {
                     ...conversation._count,
                     messages: 0,
                  },
               };
            }),
         );
      };

      const handlePreviewUpdate = (data) => {

         setConversations((current) => {
            const updated = current.map((conversation) => {
               if (conversation.id !== data.conversationId) {
                  return conversation;
               }

               return {
                  ...conversation,
                  messages: [data.message],
               };
            });

            const target = updated.find(
               (conversation) => conversation.id === data.conversationId,
            );

            const others = updated.filter(
               (conversation) => conversation.id !== data.conversationId,
            );

            return target ? [target, ...others] : updated;
         });
      };

      socket.on("conversation-read-update", handleReadUpdate);

      socket.on("conversation-unread-update", handleUnreadUpdate);

      socket.on("conversation-preview-update", handlePreviewUpdate);

      return () => {
         socket.off("conversation-unread-update", handleUnreadUpdate);

         socket.off("conversation-read-update", handleReadUpdate);

         socket.off("conversation-preview-update", handlePreviewUpdate);
      };
   }, [user]);

   if (authLoading || loading) {
      return (
         <main className="p-8">
            <p>Loading conversations...</p>
         </main>
      );
   }

   if (!user) {
      return (
         <main className="p-8">
            <p>You need to log in to view messages.</p>
         </main>
      );
   }

   return (
      <main className="max-w-4xl mx-auto p-6">
         <h1 className="text-3xl font-bold mb-6">Messages</h1>

         {error && <p className="text-red-500 mb-4">{error}</p>}

         {conversations.length === 0 ? (
            <p className="text-gray-500">
               You don't have any conversations yet.
            </p>
         ) : (
            <div className="space-y-4">
               {conversations.map((conversation) => {
                  const request = conversation.adoptionRequest;

                  const pet = request.pet;

                  const otherUser =
                     user.id === request.adopter.id
                        ? pet.owner
                        : request.adopter;

                  const lastMessage = conversation.messages?.[0];

                  const unreadCount = conversation._count?.messages || 0;

                  return (
                     <Link
                        key={conversation.id}
                        href={`/messages/${conversation.id}`}
                        className={`block border rounded-xl p-4 transition ${
                           unreadCount > 0
                              ? "bg-gray-50 border-black shadow-sm"
                              : "hover:bg-gray-50"
                        }`}
                     >
                        <div className="flex gap-4 items-center">
                           <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              {pet.images?.length > 0 ? (
                                 <img
                                    src={pet.images[0].imageUrl}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                    No image
                                 </div>
                              )}
                           </div>

                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-3">
                                 <div className="min-w-0">
                                    <h2
                                       className={`truncate ${
                                          unreadCount > 0
                                             ? "font-bold text-black"
                                             : "font-semibold"
                                       }`}
                                    >
                                       {otherUser.name}
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                       About {pet.name}
                                    </p>
                                 </div>

                                 {lastMessage?.createdAt && (
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                       {new Date(
                                          lastMessage.createdAt,
                                       ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                       })}
                                    </span>
                                 )}
                              </div>

                              <div className="flex items-center gap-3 mt-2">
                                 <p
                                    className={`text-sm truncate flex-1 ${
                                       unreadCount > 0
                                          ? "text-black font-medium"
                                          : "text-gray-600"
                                    }`}
                                 >
                                    {lastMessage
                                       ? lastMessage.content
                                       : "No messages yet"}
                                 </p>

                                 {unreadCount > 0 && (
                                    <span className="min-w-6 h-6 px-2 rounded-full bg-black text-white text-xs flex items-center justify-center shrink-0">
                                       {unreadCount}
                                    </span>
                                 )}
                              </div>
                           </div>
                        </div>
                     </Link>
                  );
               })}
            </div>
         )}
      </main>
   );
}
