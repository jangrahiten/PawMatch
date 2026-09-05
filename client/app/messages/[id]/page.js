"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

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

   const [connected, setConnected] = useState(socket.connected);

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
         setConnected(true);

         socket.emit("join-conversation", conversationId);
      };

      const handleDisconnect = () => {
         setConnected(false);
      };
      const handleReadUpdate = (data) => {
         if (
            data.conversationId !== conversationId ||
            data.userId === user.id
         ) {
            return;
         }

         setMessages((current) =>
            current.map((message) =>
               message.senderId === user.id
                  ? {
                       ...message,
                       isRead: true,
                    }
                  : message,
            ),
         );
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
               await api.patch(`/conversations/${conversationId}/read`);

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

      const handleSocketError = (data) => {
         console.error("SOCKET ERROR:", data);
      };

      const handleConnectError = (error) => {
         setConnected(false);

         console.error("SOCKET CONNECTION ERROR:", error.message);
      };

      socket.on("new-message", handleNewMessage);

      socket.on("user-typing", handleTyping);

      socket.on("user-stop-typing", handleStopTyping);

      socket.on("socket-error", handleSocketError);

      socket.on("connect_error", handleConnectError);

      socket.on("disconnect", handleDisconnect);

      socket.on("conversation-read-update",handleReadUpdate)
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

         socket.off("disconnect", handleDisconnect);

         socket.off("new-message", handleNewMessage);

         socket.off("user-typing", handleTyping);

         socket.off("user-stop-typing", handleStopTyping);

         socket.off("socket-error", handleSocketError);

         socket.off("connect_error", handleConnectError);
         
         socket.off("conversation-read-update",handleReadUpdate)
      };
   }, [user, conversationId]);

   useEffect(() => {
      bottomRef.current?.scrollIntoView({
         behavior: "smooth",
      });
   }, [messages, typingUser]);

   useEffect(() => {
      return () => {
         clearTimeout(typingTimeoutRef.current);
      };
   }, []);

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
         toast.error("Chat connection is not ready yet");

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
         <main className="mx-auto max-w-4xl p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
               {error}
            </div>
         </main>
      );
   }

   return (
      <main className="mx-auto flex h-[calc(100vh-73px)] max-w-5xl flex-col p-3 sm:p-6">
         <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b px-4 py-4 sm:px-5">
               <div className="flex min-w-0 items-center gap-3">
                  <Link
                     href="/messages"
                     className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition hover:bg-gray-50"
                     aria-label="Back to messages"
                  >
                     ←
                  </Link>

                  <div className="min-w-0">
                     <h1 className="font-semibold">Conversation</h1>

                     <div className="mt-0.5 flex items-center gap-2 text-xs">
                        <span
                           className={`h-2 w-2 rounded-full ${
                              connected ? "bg-green-500" : "bg-gray-300"
                           }`}
                        />

                        <span className="text-gray-500">
                           {connected ? "Connected" : "Reconnecting..."}
                        </span>
                     </div>
                  </div>
               </div>

               <Link
                  href="/messages"
                  className="hidden text-sm text-gray-500 transition hover:text-black sm:block"
               >
                  All messages
               </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-gray-50/50 px-4 py-5 sm:px-6">
               {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                     <div className="w-full max-w-lg">
                        <EmptyState
                           title="No messages yet"
                           description="Start the conversation by sending the first message."
                        />
                     </div>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {messages.map((message, index) => {
                        const mine = message.senderId === user.id;

                        const previousMessage = messages[index - 1];

                        const sameSender =
                           previousMessage?.senderId === message.senderId;

                        return (
                           <div
                              key={message.id}
                              className={`flex ${
                                 mine ? "justify-end" : "justify-start"
                              }`}
                           >
                              <div
                                 className={`max-w-[85%] sm:max-w-[70%] ${
                                    mine ? "items-end" : "items-start"
                                 }`}
                              >
                                 {!mine && !sameSender && (
                                    <p className="mb-1 ml-1 text-xs font-medium text-gray-500">
                                       {message.sender?.name || "User"}
                                    </p>
                                 )}

                                 <div
                                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                                       mine
                                          ? "rounded-br-md bg-black text-white"
                                          : "rounded-bl-md border bg-white text-gray-900"
                                    }`}
                                 >
                                    <p className="whitespace-pre-wrap wrap-break-word text-sm leading-6">
                                       {message.content}
                                    </p>

                                    <div
                                       className={`mt-1.5 flex items-center justify-end gap-1 text-[11px] ${
                                          mine
                                             ? "text-gray-300"
                                             : "text-gray-400"
                                       }`}
                                    >
                                       <span>
                                          {formatTime(message.createdAt)}
                                       </span>

                                       {mine && (
                                          <span>
                                             {message.isRead ? "✓✓" : "✓"}
                                          </span>
                                       )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        );
                     })}

                     {typingUser && (
                        <div className="flex justify-start">
                           <div>
                              <p className="mb-1 ml-1 text-xs text-gray-500">
                                 {typingUser}
                              </p>

                              <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border bg-white px-4 py-3 shadow-sm">
                                 <TypingDot />
                                 <TypingDot delay="150ms" />
                                 <TypingDot delay="300ms" />
                              </div>
                           </div>
                        </div>
                     )}

                     <div ref={bottomRef} />
                  </div>
               )}
            </div>

            {/* Composer */}
            <div className="border-t bg-white p-3 sm:p-4">
               <form onSubmit={handleSubmit} className="flex items-end gap-3">
                  <div className="flex-1">
                     <textarea
                        value={content}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                           if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();

                              handleSubmit(e);
                           }
                        }}
                        placeholder="Write a message..."
                        rows={1}
                        className="max-h-32 min-h-12 w-full resize-none rounded-xl border px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                     />

                     <p className="mt-1 hidden text-xs text-gray-400 sm:block">
                        Press Enter to send · Shift + Enter for a new line
                     </p>
                  </div>

                  <button
                     type="submit"
                     disabled={!content.trim() || !connected}
                     className="h-12 rounded-xl bg-black px-5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
                  >
                     Send
                  </button>
               </form>
            </div>
         </div>
      </main>
   );
}

function formatTime(date) {
   return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
   });
}

function TypingDot({ delay = "0ms" }) {
   return (
      <span
         className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
         style={{
            animationDelay: delay,
         }}
      />
   );
}
