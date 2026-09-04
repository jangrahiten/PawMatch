"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import api from "@/lib/api";
import socket from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function ConversationPage() {
   const params = useParams();
   const conversationId = params.id;

   const { user, loading: authLoading } = useAuth();

   const [messages, setMessages] = useState([]);
   const [content, setContent] = useState("");
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   const [typingUser, setTypingUser] = useState(null);

   const typingTimeoutRef = useRef(null);
   const bottomRef = useRef(null);

   useEffect(() => {
      const fetchMessages = async () => {
         if (!user || !conversationId) return;

         try {
            setLoading(true);
            setError("");

            const response = await api.get(
               `/conversations/${conversationId}/messages?page=1&limit=30`,
            );

            const fetchedMessages = [...response.data.messages].reverse();

            setMessages(fetchedMessages);

            await api.patch(`/conversations/${conversationId}/read`);
            socket.emit("mark-conversation-read", {
               conversationId,
            });
         } catch (error) {
            setError(
               error.response?.data?.message || "Unable to load messages",
            );
         } finally {
            setLoading(false);
         }
      };

      if (!authLoading) {
         fetchMessages();
      }
   }, [user, authLoading, conversationId]);

   useEffect(() => {
      if (!user || !conversationId) return;

      const joinConversation = () => {
         socket.emit("join-conversation", conversationId);
      };

      const handleNewMessage = async (message) => {
         if (message.conversationId !== conversationId) {
            return;
         }

         setMessages((current) => {
            const alreadyExists = current.some(
               (item) => item.id === message.id,
            );

            if (alreadyExists) {
               return current;
            }

            return [...current, message];
         });

         if (message.senderId !== user.id) {
            try {
               const response = await api.patch(
                  `/conversations/${conversationId}/read`,
               );

               socket.emit("mark-conversation-read", {
                  conversationId,
               });
            } catch (error) {
               console.error("Unable to mark message as read:", error);
            }
         }
      };

      const handleTyping = (data) => {
         if (
            data.conversationId === conversationId &&
            data.userId !== user.id
         ) {
            setTypingUser(data.name);
         }
      };

      const handleStopTyping = (data) => {
         if (
            data.conversationId === conversationId &&
            data.userId !== user.id
         ) {
            setTypingUser(null);
         }
      };

      const handleConversationJoined = (data) => {};

      const handleSocketError = (data) => {
         console.error("SOCKET ERROR:", data);
      };

      const handleConnectError = (error) => {
         console.error("SOCKET CONNECTION ERROR:", error.message);
      };

      socket.on("new-message", handleNewMessage);
      socket.on("user-typing", handleTyping);
      socket.on("user-stop-typing", handleStopTyping);
      socket.on("conversation-joined", handleConversationJoined);
      socket.on("socket-error", handleSocketError);
      socket.on("connect_error", handleConnectError);

      if (socket.connected) {
         joinConversation();
      } else {
         socket.connect();
         socket.once("connect", joinConversation);
      }

      return () => {
         if (socket.connected) {
            socket.emit("leave-conversation", conversationId);
         }

         socket.off("connect", joinConversation);
         socket.off("new-message", handleNewMessage);
         socket.off("user-typing", handleTyping);
         socket.off("user-stop-typing", handleStopTyping);
         socket.off("conversation-joined", handleConversationJoined);
         socket.off("socket-error", handleSocketError);
         socket.off("connect_error", handleConnectError);
      };
   }, [user, conversationId]);

   useEffect(() => {
      bottomRef.current?.scrollIntoView({
         behavior: "smooth",
      });
   }, [messages]);

   const handleChange = (e) => {
      const value = e.target.value;

      setContent(value);

      if (!socket.connected) return;

      socket.emit("typing", {
         conversationId,
      });

      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
         socket.emit("stop-typing", {
            conversationId,
         });
      }, 1000);
   };

   const handleSubmit = (e) => {
      e.preventDefault();

      const trimmedContent = content.trim();

      if (!trimmedContent) return;

      if (!socket.connected) {
         alert("Chat connection is not ready yet");
         return;
      }

      socket.emit("send-message", {
         conversationId,
         content: trimmedContent,
      });

      socket.emit("stop-typing", {
         conversationId,
      });

      clearTimeout(typingTimeoutRef.current);

      setContent("");
   };

   if (authLoading || loading) {
      return <LoadingSpinner text="Loading conversation..." />;
   }

   if (!user) {
      return (
         <main className="p-8">
            <p>You need to log in to view this conversation.</p>
         </main>
      );
   }

   if (error) {
      return (
         <main className="p-8">
            <p className="text-red-500">{error}</p>
         </main>
      );
   }

   return (
      <main className="max-w-4xl mx-auto h-[calc(100vh-80px)] p-6 flex flex-col">
         <div className="border rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="border-b p-4">
               <h1 className="text-xl font-semibold">Conversation</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {messages.length === 0 ? (
                  <EmptyState
                     title="No messages yet"
                     description="Start the conversation by sending the first message."
                  />
               ) : (
                  messages.map((message) => {
                     const mine = message.senderId === user.id;

                     return (
                        <div
                           key={message.id}
                           className={`flex ${
                              mine ? "justify-end" : "justify-start"
                           }`}
                        >
                           <div
                              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                 mine ? "bg-black text-white" : "bg-gray-100"
                              }`}
                           >
                              {!mine && (
                                 <p className="text-xs font-semibold mb-1">
                                    {message.sender?.name}
                                 </p>
                              )}

                              <p>{message.content}</p>

                              <p
                                 className={`text-xs mt-1 ${
                                    mine ? "text-gray-300" : "text-gray-500"
                                 }`}
                              >
                                 {new Date(
                                    message.createdAt,
                                 ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                 })}
                              </p>
                           </div>
                        </div>
                     );
                  })
               )}

               {typingUser && (
                  <p className="text-sm text-gray-500">
                     {typingUser} is typing...
                  </p>
               )}

               <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4 flex gap-3">
               <input
                  value={content}
                  onChange={handleChange}
                  placeholder="Write a message..."
                  className="flex-1 border rounded-xl px-4 py-3"
               />

               <button
                  type="submit"
                  disabled={!content.trim()}
                  className="bg-black text-white px-6 rounded-xl disabled:opacity-50"
               >
                  Send
               </button>
            </form>
         </div>
      </main>
   );
}
