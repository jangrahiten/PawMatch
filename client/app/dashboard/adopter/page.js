"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import api from "../../../lib/api";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "@/components/ConfirmModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function AdopterDashboardPage() {
   const { user, loading: authLoading } = useAuth();

   const [likes, setLikes] = useState([]);
   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [requestToCancel, setRequestToCancel] = useState(null);
   const [cancelLoading, setCancelLoading] = useState(false);

   useEffect(() => {
      const fetchDashboard = async () => {
         if (!user || user.role !== "ADOPTER") {
            return;
         }

         try {
            setLoading(true);

            const [likesResponse, requestsResponse] = await Promise.all([
               api.get("/likes"),
               api.get("/adoptions/mine"),
            ]);

            setLikes(likesResponse.data.likes);
            setRequests(requestsResponse.data.requests);
         } catch (error) {
            toast.error(
               error.response?.data?.message || "Unable to load dashboard",
            );
         } finally {
            setLoading(false);
         }
      };

      if (!authLoading) {
         fetchDashboard();
      }
   }, [user, authLoading]);

   const handleCancelRequest = async () => {
      if (!requestToCancel) return;

      try {
         setCancelLoading(true);

         await api.patch(`/adoptions/${requestToCancel}/cancel`);

         setRequests((current) =>
            current.map((request) =>
               request.id === requestToCancel
                  ? {
                       ...request,
                       status: "CANCELLED",
                    }
                  : request,
            ),
         );

         toast.success("Adoption request withdrawn successfully");

         setRequestToCancel(null);
      } catch (error) {
         toast.error(
            error.response?.data?.message ||
               "Unable to cancel adoption request",
         );
      } finally {
         setCancelLoading(false);
      }
   };

   if (authLoading || loading) {
      return <LoadingSpinner text="Loading dashboard..." />;
   }

   if (!user || user.role !== "ADOPTER") {
      return (
         <main className="p-8">
            <p>You are not authorized to view this page.</p>
         </main>
      );
   }

   return (
      <main className="max-w-7xl mx-auto p-6 space-y-10">
         <div className="flex items-start justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>

               <p className="text-gray-600 mt-1">
                  Manage your liked pets and adoption requests.
               </p>
            </div>

            <Link
               href="/dashboard/adopter/profile"
               className="shrink-0 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
               Edit Profile
            </Link>
         </div>

         <section>
            <h2 className="text-2xl font-semibold mb-5">Liked Pets</h2>

            {likes.length === 0 ? (
               <EmptyState
                  title="No liked pets yet"
                  description="Pets you like will appear here so you can easily come back to them."
                  action={
                     <Link
                        href="/"
                        className="inline-block rounded-lg bg-black px-4 py-2 text-white"
                     >
                        Discover Pets
                     </Link>
                  }
               />
            ) : (
               <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {likes.map((like) => (
                     <Link
                        key={like.id}
                        href={`/pets/${like.pet.id}`}
                        className="border rounded-xl overflow-hidden"
                     >
                        <div className="h-52 bg-gray-100">
                           {like.pet.images?.length > 0 ? (
                              <img
                                 src={like.pet.images[0].imageUrl}
                                 alt={like.pet.name}
                                 className="w-full h-full object-cover"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                 No image
                              </div>
                           )}
                        </div>

                        <div className="p-4">
                           <h3 className="text-xl font-semibold">
                              {like.pet.name}
                           </h3>

                           <p className="text-gray-600">
                              {like.pet.breed || like.pet.animalType}
                           </p>

                           <p className="text-sm mt-2">📍 {like.pet.city}</p>
                        </div>
                     </Link>
                  ))}
               </div>
            )}
         </section>

         <section>
            <h2 className="text-2xl font-semibold mb-5">
               My Adoption Requests
            </h2>

            {requests.length === 0 ? (
               <EmptyState
                  title="No adoption requests yet"
                  description="When you apply to adopt a pet, you’ll be able to track the request here."
                  action={
                     <Link
                        href="/"
                        className="inline-block rounded-lg border px-4 py-2 hover:bg-gray-50"
                     >
                        Browse Pets
                     </Link>
                  }
               />
            ) : (
               <div className="space-y-4">
                  {requests.map((request) => (
                     <div
                        key={request.id}
                        className="border rounded-xl p-5 flex gap-5"
                     >
                        <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                           {request.pet.images?.length > 0 ? (
                              <img
                                 src={request.pet.images[0].imageUrl}
                                 alt={request.pet.name}
                                 className="w-full h-full object-cover"
                              />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                                 No image
                              </div>
                           )}
                        </div>

                        <div className="flex-1">
                           <div className="flex justify-between gap-4">
                              <div>
                                 <Link
                                    href={`/pets/${request.pet.id}`}
                                    className="text-xl font-semibold"
                                 >
                                    {request.pet.name}
                                 </Link>

                                 <p className="text-sm text-gray-500">
                                    {request.pet.breed ||
                                       request.pet.animalType}
                                 </p>
                              </div>

                              <StatusBadge
                                 status={
                                    request.pet.status === "ADOPTED"
                                       ? "ADOPTED"
                                       : request.status
                                 }
                              />
                           </div>

                           {request.message && (
                              <p className="mt-3 text-gray-700">
                                 {request.message}
                              </p>
                           )}

                           {request.status === "PENDING" && (
                              <button
                                 onClick={() => setRequestToCancel(request.id)}
                                 className="mt-4 border px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                              >
                                 Withdraw Request
                              </button>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </section>
         <ConfirmModal
            isOpen={Boolean(requestToCancel)}
            title="Withdraw adoption request?"
            message="Are you sure you want to withdraw this adoption request? This action cannot be undone."
            confirmText="Withdraw"
            danger
            loading={cancelLoading}
            onConfirm={handleCancelRequest}
            onCancel={() => {
               if (!cancelLoading) {
                  setRequestToCancel(null);
               }
            }}
         />
      </main>
   );
}

function StatusBadge({ status }) {
   const labels = {
      PENDING: "Pending",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      CANCELLED: "Cancelled",
      COMPLETED: "Adopted",
   };

   const styles = {
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ACCEPTED: "bg-green-50 text-green-700 border-green-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
      CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
      COMPLETED: "bg-blue-50 text-blue-700 border-blue-200",
   };

   return (
      <span
         className={`border rounded-full px-3 py-1 text-sm h-fit ${
            styles[status] || "bg-gray-50 text-gray-700 border-gray-200"
         }`}
      >
         {labels[status] || status}
      </span>
   );
}
