"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "../../../lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
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
      <main className="max-w-7xl mx-auto p-6 space-y-10">
         <div className="flex items-start justify-between gap-4">
            <div>
               <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>

               <p className="text-gray-600 mt-1">
                  Manage your pet listings and adoption requests.
               </p>
            </div>

            <Link
               href="/dashboard/shelter/profile"
               className="shrink-0 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
               Edit Profile
            </Link>
         </div>

         {error && <p className="text-red-500">{error}</p>}

         <section>
            <div className="flex justify-between items-center mb-5">
               <h2 className="text-2xl font-semibold">My Pets</h2>

               <Link
                  href="/dashboard/shelter/pets/new"
                  className="bg-black text-white px-4 py-2 rounded-lg"
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
                        className="inline-block rounded-lg bg-black px-4 py-2 text-white"
                     >
                        Add a Pet
                     </Link>
                  }
               />
            ) : (
               <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {pets.map((pet) => (
                     <div
                        key={pet.id}
                        className="border rounded-xl overflow-hidden"
                     >
                        <Link href={`/pets/${pet.id}`}>
                           <div className="h-52 bg-gray-100">
                              {pet.images?.length > 0 ? (
                                 <img
                                    src={pet.images[0].imageUrl}
                                    alt={pet.name}
                                    className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    No image
                                 </div>
                              )}
                           </div>
                        </Link>

                        <div className="p-4">
                           <div className="flex justify-between items-center">
                              <Link href={`/pets/${pet.id}`}>
                                 <h3 className="text-xl font-semibold hover:underline">
                                    {pet.name}
                                 </h3>
                              </Link>

                              <span className="text-sm">{pet.status}</span>
                           </div>

                           <p className="text-gray-600">
                              {pet.breed || pet.animalType}
                           </p>

                           <p className="text-sm mt-2">📍 {pet.city}</p>

                           <div className="mt-4 flex gap-3">
                              <Link
                                 href={`/pets/${pet.id}`}
                                 className="border px-3 py-2 rounded-lg"
                              >
                                 View
                              </Link>

                              <Link
                                 href={`/dashboard/shelter/pets/${pet.id}/edit`}
                                 className="bg-black text-white px-3 py-2 rounded-lg"
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

         <section>
            <h2 className="text-2xl font-semibold mb-5">Adoption Requests</h2>

            {requests.length === 0 ? (
               <EmptyState
                  title="No adoption requests yet"
                  description="Requests from interested adopters will appear here."
               />
            ) : (
               <div className="space-y-4">
                  {requests.map((request) => (
                     <div key={request.id} className="border rounded-xl p-5">
                        <div className="flex justify-between gap-4">
                           <div>
                              <h3 className="text-xl font-semibold">
                                 {request.pet.name}
                              </h3>

                              <p className="text-sm text-gray-500">
                                 Request from {request.adopter.name}
                              </p>
                           </div>

                           <span className="border rounded-full px-3 py-1 text-sm h-fit">
                              {request.status}
                           </span>
                        </div>

                        {request.message && (
                           <p className="mt-4 text-gray-700">
                              {request.message}
                           </p>
                        )}

                        {request.status === "PENDING" && (
                           <div className="flex gap-3 mt-5">
                              <button
                                 onClick={() =>
                                    handleRequestStatus(request.id, "ACCEPTED")
                                 }
                                 className="bg-black text-white px-4 py-2 rounded-lg"
                              >
                                 Accept
                              </button>

                              <button
                                 onClick={() =>
                                    handleRequestStatus(request.id, "REJECTED")
                                 }
                                 className="border px-4 py-2 rounded-lg"
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
                                    className="bg-black text-white px-4 py-2 rounded-lg"
                                 >
                                    Mark as Adopted
                                 </button>
                              </div>
                           )}

                        {request.pet.status === "ADOPTED" && (
                           <p className="mt-5 text-sm font-medium">
                              Adoption completed
                           </p>
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
