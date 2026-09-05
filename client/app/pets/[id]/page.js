"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

import api from "../../../lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function PetDetailPage() {
   const params = useParams();
   const petId = params.id;

   const { user } = useAuth();

   const [pet, setPet] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [liked, setLiked] = useState(false);
   const [likeLoading, setLikeLoading] = useState(false);
   const [selectedImage, setSelectedImage] = useState(null);

   const [showAdoptionForm, setShowAdoptionForm] = useState(false);

   const [adoptionMessage, setAdoptionMessage] = useState("");

   const [adoptionLoading, setAdoptionLoading] = useState(false);

   useEffect(() => {
      const fetchPet = async () => {
         try {
            setLoading(true);
            setError("");

            const response = await api.get(`/pets/${petId}`);

            setPet(response.data.pet);
            if (response.data.pet.images?.length > 0) {
               setSelectedImage(response.data.pet.images[0]);
            }
         } catch (error) {
            setError(error.response?.data?.message || "Unable to load pet");
         } finally {
            setLoading(false);
         }
      };

      if (petId) {
         fetchPet();
      }
   }, [petId]);

   useEffect(() => {
      const fetchLikeStatus = async () => {
         if (!user || user.role !== "ADOPTER") {
            return;
         }

         try {
            const response = await api.get("/likes");

            const isLiked = response.data.likes.some(
               (like) => like.petId === petId,
            );

            setLiked(isLiked);
         } catch (error) {
            console.error("Unable to fetch likes:", error);
         }
      };

      if (petId && user) {
         fetchLikeStatus();
      }
   }, [petId, user]);

   const handleLike = async () => {
      try {
         setLikeLoading(true);

         if (liked) {
            await api.delete(`/likes/${petId}`);

            setLiked(false);

            toast.info(`${pet.name} removed from your likes`);
         } else {
            await api.post(`/likes/${petId}`);

            setLiked(true);

            toast.success(`${pet.name} added to your likes`);
         }
      } catch (error) {
         toast.error(error.response?.data?.message || "Unable to update like");
      } finally {
         setLikeLoading(false);
      }
   };

   const handleAdoptionRequest = async (e) => {
      e.preventDefault();

      try {
         setAdoptionLoading(true);

         const response = await api.post(`/adoptions/${petId}`, {
            message: adoptionMessage,
         });

         toast.success(
            response.data.message || "Adoption request submitted successfully",
         );

         setAdoptionMessage("");
         setShowAdoptionForm(false);
      } catch (error) {
         toast.error(
            error.response?.data?.message ||
               "Unable to submit adoption request",
         );
      } finally {
         setAdoptionLoading(false);
      }
   };

   if (loading) {
      return <LoadingSpinner text="Loading pet..." />;
   }

   if (error) {
      return (
         <main className="p-8">
            <p className="text-red-500">{error}</p>
         </main>
      );
   }

   if (!pet) {
      return null;
   }

   return (
      <main className="max-w-6xl mx-auto p-6">
         <div className="grid gap-8 md:grid-cols-2">
            {/* Images */}
            <div>
               {pet.images?.length > 0 ? (
                  <div className="space-y-4">
                     <img
                        src={selectedImage?.imageUrl}
                        alt={pet.name}
                        className="w-full aspect-4/3 object-cover rounded-2xl"
                     />

                     {pet.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-3">
                           {pet.images.map((image) => (
                              <button
                                 key={image.id}
                                 type="button"
                                 onClick={() => setSelectedImage(image)}
                                 className={`overflow-hidden rounded-lg border-2 transition ${
                                    selectedImage?.id === image.id
                                       ? "border-black"
                                       : "border-transparent"
                                 }`}
                              >
                                 <img
                                    src={image.imageUrl}
                                    alt={pet.name}
                                    className="w-full aspect-square object-cover"
                                 />
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
               ) : (
                  <div className="h-125 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                     No image available
                  </div>
               )}
            </div>

            {/* Pet information */}
            <div className="space-y-6">
               <div>
                  <h1 className="text-4xl font-bold">{pet.name}</h1>

                  <p className="text-gray-600 mt-2">
                     {pet.breed || pet.animalType}
                  </p>

                  <p className="mt-2">📍 {pet.city}</p>

                  <span
                     className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        pet.status === "AVAILABLE"
                           ? "bg-green-50 text-green-700"
                           : pet.status === "PENDING"
                             ? "bg-yellow-50 text-yellow-700"
                             : pet.status === "ADOPTED"
                               ? "bg-blue-50 text-blue-700"
                               : "bg-gray-100 text-gray-600"
                     }`}
                  >
                     {pet.status}
                  </span>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <Detail
                     label="Age"
                     value={pet.age !== null ? `${pet.age} years` : "Unknown"}
                  />

                  <Detail label="Gender" value={pet.gender || "Unknown"} />

                  <Detail label="Size" value={pet.size || "Unknown"} />

                  <Detail
                     label="Vaccinated"
                     value={pet.vaccinated ? "Yes" : "No"}
                  />

                  <Detail
                     label="Neutered"
                     value={pet.neutered ? "Yes" : "No"}
                  />

                  <Detail
                     label="Good with children"
                     value={
                        pet.goodWithChildren === null
                           ? "Unknown"
                           : pet.goodWithChildren
                             ? "Yes"
                             : "No"
                     }
                  />

                  <Detail
                     label="Good with pets"
                     value={
                        pet.goodWithPets === null
                           ? "Unknown"
                           : pet.goodWithPets
                             ? "Yes"
                             : "No"
                     }
                  />
               </div>

               {/* Like button */}
               {user?.role === "ADOPTER" && (
                  <button
                     onClick={handleLike}
                     disabled={likeLoading}
                     className="w-full border rounded-xl py-3 text-lg font-medium disabled:opacity-50"
                  >
                     {likeLoading
                        ? "Please wait..."
                        : liked
                          ? "♥ Liked"
                          : "♡ Like"}
                  </button>
               )}

               {/* Adoption request */}
               {user?.role === "ADOPTER" && (
                  <div className="space-y-3">
                     <button
                        onClick={() => setShowAdoptionForm((prev) => !prev)}
                        disabled={pet.status !== "AVAILABLE"}
                        className="w-full bg-black text-white rounded-xl py-3 text-lg font-medium disabled:cursor-not-allowed disabled:opacity-40"
                     >
                        {pet.status !== "AVAILABLE"
                           ? "Not available for adoption"
                           : showAdoptionForm
                             ? "Cancel"
                             : `Apply to adopt ${pet.name}`}
                     </button>

                     {showAdoptionForm && (
                        <form
                           onSubmit={handleAdoptionRequest}
                           className="border rounded-xl p-4 space-y-3"
                        >
                           <label className="block font-medium">
                              Tell the owner why you'd like to adopt {pet.name}
                           </label>

                           <textarea
                              value={adoptionMessage}
                              onChange={(e) =>
                                 setAdoptionMessage(e.target.value)
                              }
                              placeholder={`I'd love to adopt ${pet.name} because...`}
                              rows={5}
                              className="w-full border rounded-lg p-3 resize-none"
                           />

                           <button
                              type="submit"
                              disabled={adoptionLoading}
                              className="w-full bg-black text-white rounded-lg py-3 disabled:opacity-50"
                           >
                              {adoptionLoading
                                 ? "Submitting..."
                                 : "Submit adoption request"}
                           </button>
                        </form>
                     )}
                  </div>
               )}

               {/* Description */}
               <div>
                  <h2 className="text-xl font-semibold mb-2">
                     About {pet.name}
                  </h2>

                  <p className="text-gray-700 leading-7">{pet.description}</p>
               </div>

               {/* Owner */}
               <div className="border rounded-xl p-4">
                  <p className="text-sm text-gray-500">Listed by</p>

                  <p className="font-semibold">
                     {pet.owner?.shelterProfile?.shelterName || pet.owner?.name}
                  </p>

                  {pet.owner?.shelterProfile?.isVerified && (
                     <p className="text-sm mt-1">✓ Verified shelter</p>
                  )}
               </div>
            </div>
         </div>
      </main>
   );
}

function Detail({ label, value }) {
   return (
      <div className="border rounded-lg p-3">
         <p className="text-xs text-gray-500">{label}</p>

         <p className="font-medium mt-1">{value}</p>
      </div>
   );
}
