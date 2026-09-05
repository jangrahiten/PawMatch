"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import api from "../../../lib/api";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "@/components/ConfirmModal";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function ShelterDashboardPage() {
   const { user, loading: authLoading } = useAuth();

   const [pets, setPets] = useState([]);
   const [requests, setRequests] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   const [requestToComplete, setRequestToComplete] = useState(null);

   const [completeLoading, setCompleteLoading] = useState(false);

   useEffect(() => {
      const fetchDashboard = async () => {
         if (!user || !["SHELTER", "OWNER"].includes(user.role)) {
            return;
         }

         try {
            setLoading(true);
            setError("");

            const [petsResponse, requestsResponse] = await Promise.all([
               api.get("/pets/mine"),
               api.get("/adoptions/received"),
            ]);

            const myPets = petsResponse.data.pets.filter(
               (pet) => pet.ownerId === user.id,
            );

            setPets(myPets);
            setRequests(requestsResponse.data.requests);
         } catch (error) {
            setError(
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

   const handleRequestStatus = async (requestId, status) => {
      try {
         await api.patch(`/adoptions/${requestId}/status`, {
            status,
         });

         setRequests((current) =>
            current.map((request) =>
               request.id === requestId
                  ? {
                       ...request,
                       status,
                       pet:
                          status === "ACCEPTED"
                             ? {
                                  ...request.pet,
                                  status: "PENDING",
                               }
                             : request.pet,
                    }
                  : request,
            ),
         );

         toast.success(
            status === "ACCEPTED"
               ? "Adoption request accepted"
               : "Adoption request rejected",
         );
      } catch (error) {
         toast.error(
            error.response?.data?.message || "Unable to update request",
         );
      }
   };

   const handleCompleteAdoption = async () => {
      if (!requestToComplete) return;

      try {
         setCompleteLoading(true);

         const response = await api.patch(
            `/adoptions/${requestToComplete}/complete`,
         );

         setRequests((current) =>
            current.map((request) =>
               request.id === requestToComplete
                  ? {
                       ...request,
                       pet: {
                          ...request.pet,
                          status: "ADOPTED",
                       },
                    }
                  : request,
            ),
         );

         setPets((current) =>
            current.map((pet) =>
               pet.id === response.data.request.pet.id
                  ? {
                       ...pet,
                       status: "ADOPTED",
                    }
                  : pet,
            ),
         );

         toast.success("Adoption marked as completed");

         setRequestToComplete(null);
      } catch (error) {
         toast.error(
            error.response?.data?.message || "Unable to complete adoption",
         );
      } finally {
         setCompleteLoading(false);
      }
   };

   if (authLoading || loading) {
      return <LoadingSpinner text="Loading shelter dashboard..." />;
   }

   if (!user || !["SHELTER", "OWNER"].includes(user.role)) {
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
                  Manage your pet listings and adoption requests.
               </p>
            </div>

            <Link
               href="/dashboard/shelter/profile"
               className="w-fit shrink-0 rounded-lg border px-4 py-2 transition hover:bg-gray-50"
            >
               Edit Profile
            </Link>
         </div>

         {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
               {error}
            </div>
         )}

         {/* My Pets */}
         <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
               <div>
                  <h2 className="text-2xl font-semibold">My Pets</h2>

                  <p className="mt-1 text-sm text-gray-500">
                     Manage your active and past pet listings.
                  </p>
               </div>

               <Link
                  href="/dashboard/shelter/pets/new"
                  className="w-fit rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
               >
                  Add Pet
               </Link>
            </div>

            {pets.length === 0 ? (
               <EmptyState
                  title="No pets listed yet"
                  description="Create your first pet listing so adopters can discover it."
                  action={
                     <Link
                        href="/dashboard/shelter/pets/new"
                        className="inline-block rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
                     >
                        Add a Pet
                     </Link>
                  }
               />
            ) : (
               <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pets.map((pet) => (
                     <div
                        key={pet.id}
                        className="group overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                     >
                        <Link href={`/pets/${pet.id}`}>
                           <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                              {pet.images?.length > 0 ? (
                                 <img
                                    src={pet.images[0].imageUrl}
                                    alt={pet.name}
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                 />
                              ) : (
                                 <div className="flex h-full w-full items-center justify-center text-gray-400">
                                    No image
                                 </div>
                              )}

                              <div className="absolute left-3 top-3">
                                 <PetStatusBadge status={pet.status} />
                              </div>
                           </div>
                        </Link>

                        <div className="p-5">
                           <div className="flex items-start justify-between gap-3">
                              <div>
                                 <Link
                                    href={`/pets/${pet.id}`}
                                    className="text-xl font-semibold hover:underline"
                                 >
                                    {pet.name}
                                 </Link>

                                 <p className="mt-1 text-sm text-gray-500">
                                    {pet.breed ||
                                       formatAnimalType(pet.animalType)}
                                 </p>
                              </div>

                              {pet.age !== null && pet.age !== undefined && (
                                 <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                                    {pet.age} {pet.age === 1 ? "yr" : "yrs"}
                                 </span>
                              )}
                           </div>

                           <div className="mt-4 flex flex-wrap gap-2">
                              {pet.gender && (
                                 <PetTag value={formatValue(pet.gender)} />
                              )}

                              {pet.size && (
                                 <PetTag value={formatValue(pet.size)} />
                              )}
                           </div>

                           <p className="mt-4 text-sm text-gray-600">
                              📍 {pet.city}
                           </p>

                           <div className="mt-5 flex gap-3 border-t pt-4">
                              <Link
                                 href={`/pets/${pet.id}`}
                                 className="flex-1 rounded-lg border px-3 py-2 text-center text-sm font-medium transition hover:bg-gray-50"
                              >
                                 View
                              </Link>

                              <Link
                                 href={`/dashboard/shelter/pets/${pet.id}/edit`}
                                 className="flex-1 rounded-lg bg-black px-3 py-2 text-center text-sm font-medium text-white transition hover:bg-gray-800"
                              >
                                 Edit
                              </Link>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </section>

         {/* Adoption Requests */}
         <section>
            <div className="mb-5">
               <h2 className="text-2xl font-semibold">Adoption Requests</h2>

               <p className="mt-1 text-sm text-gray-500">
                  Review and manage requests from interested adopters.
               </p>
            </div>

            {requests.length === 0 ? (
               <EmptyState
                  title="No adoption requests yet"
                  description="Requests from interested adopters will appear here."
               />
            ) : (
               <div className="space-y-4">
                  {requests.map((request) => (
                     <div
                        key={request.id}
                        className="rounded-2xl border bg-white p-5 shadow-sm"
                     >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                           <div>
                              <Link
                                 href={`/pets/${request.pet.id}`}
                                 className="text-xl font-semibold hover:underline"
                              >
                                 {request.pet.name}
                              </Link>

                              <p className="mt-1 text-sm text-gray-500">
                                 Request from{" "}
                                 <span className="font-medium text-gray-700">
                                    {request.adopter.name}
                                 </span>
                              </p>

                              <p className="mt-2 text-sm text-gray-500">
                                 {request.pet.breed ||
                                    formatAnimalType(request.pet.animalType)}
                              </p>
                           </div>

                           <RequestStatusBadge
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
                                 Adopter's message
                              </p>

                              <p className="text-sm leading-6 text-gray-700">
                                 {request.message}
                              </p>
                           </div>
                        )}

                        {request.status === "PENDING" && (
                           <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                              <button
                                 onClick={() =>
                                    handleRequestStatus(request.id, "ACCEPTED")
                                 }
                                 className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                              >
                                 Accept
                              </button>

                              <button
                                 onClick={() =>
                                    handleRequestStatus(request.id, "REJECTED")
                                 }
                                 className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                              >
                                 Reject
                              </button>
                           </div>
                        )}

                        {request.status === "ACCEPTED" &&
                           request.pet.status !== "ADOPTED" && (
                              <div className="mt-5">
                                 <button
                                    onClick={() =>
                                       setRequestToComplete(request.id)
                                    }
                                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                                 >
                                    Mark as Adopted
                                 </button>
                              </div>
                           )}

                        {request.pet.status === "ADOPTED" && (
                           <div className="mt-5 rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                              Adoption completed
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </section>

         <ConfirmModal
            isOpen={Boolean(requestToComplete)}
            title="Mark adoption as completed?"
            message="This will mark the pet as adopted and complete the adoption process."
            confirmText="Mark as Adopted"
            loading={completeLoading}
            onConfirm={handleCompleteAdoption}
            onCancel={() => {
               if (!completeLoading) {
                  setRequestToComplete(null);
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

function PetStatusBadge({ status }) {
   const labels = {
      AVAILABLE: "Available",
      PENDING: "Pending",
      ADOPTED: "Adopted",
      INACTIVE: "Inactive",
   };

   const styles = {
      AVAILABLE: "bg-green-50 text-green-700 border-green-200",
      PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ADOPTED: "bg-blue-50 text-blue-700 border-blue-200",
      INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
   };

   return (
      <span
         className={`rounded-full border px-3 py-1 text-xs font-medium ${
            styles[status] || "border-gray-200 bg-gray-50 text-gray-700"
         }`}
      >
         {labels[status] || status}
      </span>
   );
}

function RequestStatusBadge({ status }) {
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
