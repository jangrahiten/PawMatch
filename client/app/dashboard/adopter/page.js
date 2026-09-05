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
      <main className="mx-auto max-w-7xl space-y-12 p-6">
         {/* Header */}
         <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
               <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>

               <p className="mt-1 text-gray-600">
                  Manage your liked pets and adoption requests.
               </p>
            </div>

            <Link
               href="/dashboard/adopter/profile"
               className="w-fit shrink-0 rounded-lg border px-4 py-2 transition hover:bg-gray-50"
            >
               Edit Profile
            </Link>
         </div>

         {/* Liked Pets */}
         <section>
            <div className="mb-5">
               <h2 className="text-2xl font-semibold">Liked Pets</h2>

               <p className="mt-1 text-sm text-gray-500">
                  Pets you've saved while browsing.
               </p>
            </div>

            {likes.length === 0 ? (
               <EmptyState
                  title="No liked pets yet"
                  description="Pets you like will appear here so you can easily come back to them."
                  action={
                     <Link
                        href="/"
                        className="inline-block rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
                     >
                        Discover Pets
                     </Link>
                  }
               />
            ) : (
               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {likes.map((like) => (
                     <Link
                        key={like.id}
                        href={`/pets/${like.pet.id}`}
                        className="group overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                     >
                        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                           {like.pet.images?.length > 0 ? (
                              <img
                                 src={like.pet.images[0].imageUrl}
                                 alt={like.pet.name}
                                 className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                              />
                           ) : (
                              <div className="flex h-full w-full items-center justify-center text-gray-400">
                                 No image
                              </div>
                           )}
                        </div>

                        <div className="p-5">
                           <div className="flex items-start justify-between gap-3">
                              <div>
                                 <h3 className="text-xl font-semibold">
                                    {like.pet.name}
                                 </h3>

                                 <p className="mt-1 text-sm text-gray-500">
                                    {like.pet.breed ||
                                       formatAnimalType(like.pet.animalType)}
                                 </p>
                              </div>

                              {like.pet.age !== null &&
                                 like.pet.age !== undefined && (
                                    <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                       {like.pet.age}{" "}
                                       {like.pet.age === 1 ? "yr" : "yrs"}
                                    </span>
                                 )}
                           </div>

                           <div className="mt-4 flex flex-wrap gap-2">
                              {like.pet.gender && (
                                 <PetTag value={formatValue(like.pet.gender)} />
                              )}

                              {like.pet.size && (
                                 <PetTag value={formatValue(like.pet.size)} />
                              )}
                           </div>

                           <div className="mt-5 border-t pt-4">
                              <p className="text-sm text-gray-600">
                                 📍 {like.pet.city}
                              </p>
                           </div>
                        </div>
                     </Link>
                  ))}
               </div>
            )}
         </section>

         {/* Adoption Requests */}
         <section>
            <div className="mb-5">
               <h2 className="text-2xl font-semibold">My Adoption Requests</h2>

               <p className="mt-1 text-sm text-gray-500">
                  Track the progress of pets you've applied to adopt.
               </p>
            </div>

            {requests.length === 0 ? (
               <EmptyState
                  title="No adoption requests yet"
                  description="When you apply to adopt a pet, you’ll be able to track the request here."
                  action={
                     <Link
                        href="/"
                        className="inline-block rounded-lg border px-4 py-2 transition hover:bg-gray-50"
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
                        className="flex flex-col gap-5 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row"
                     >
                        <div className="h-32 w-full shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-28 sm:w-28">
                           {request.pet.images?.length > 0 ? (
                              <img
                                 src={request.pet.images[0].imageUrl}
                                 alt={request.pet.name}
                                 className="h-full w-full object-cover"
                              />
                           ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                 No image
                              </div>
                           )}
                        </div>

                        <div className="min-w-0 flex-1">
                           <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                 <Link
                                    href={`/pets/${request.pet.id}`}
                                    className="text-xl font-semibold hover:underline"
                                 >
                                    {request.pet.name}
                                 </Link>

                                 <p className="mt-1 text-sm text-gray-500">
                                    {request.pet.breed ||
                                       formatAnimalType(request.pet.animalType)}
                                 </p>

                                 <p className="mt-2 text-sm text-gray-500">
                                    📍 {request.pet.city}
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
                              <div className="mt-4 rounded-xl bg-gray-50 p-4">
                                 <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                                    Your message
                                 </p>

                                 <p className="text-sm leading-6 text-gray-700">
                                    {request.message}
                                 </p>
                              </div>
                           )}

                           {request.status === "PENDING" && (
                              <button
                                 onClick={() => setRequestToCancel(request.id)}
                                 className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
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

function PetTag({ value }) {
   return (
      <span className="rounded-full border bg-gray-50 px-3 py-1 text-xs text-gray-600">
         {value}
      </span>
   );
}

function formatValue(value) {
   if (!value) return "";

   return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function formatAnimalType(type) {
   const labels = {
      DOG: "Dog",
      CAT: "Cat",
      BIRD: "Bird",
      RABBIT: "Rabbit",
      OTHER: "Other",
   };

   return labels[type] || type;
}

function StatusBadge({ status }) {
   const labels = {
      PENDING: "Pending",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      CANCELLED: "Cancelled",
      ADOPTED: "Adopted",
   };

   const styles = {
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ACCEPTED: "bg-green-50 text-green-700 border-green-200",
      REJECTED: "bg-red-50 text-red-700 border-red-200",
      CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
      ADOPTED: "bg-blue-50 text-blue-700 border-blue-200",
   };

   return (
      <span
         className={`h-fit w-fit rounded-full border px-3 py-1 text-sm ${
            styles[status] || "border-gray-200 bg-gray-50 text-gray-700"
         }`}
      >
         {labels[status] || status}
      </span>
   );
}
