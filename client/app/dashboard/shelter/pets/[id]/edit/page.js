"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "@/components/ConfirmModal";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EditPetPage() {
   const params = useParams();
   const petId = params.id;

   const router = useRouter();
   const { user, loading: authLoading } = useAuth();

   const [form, setForm] = useState({
      name: "",
      animalType: "DOG",
      breed: "",
      age: "",
      gender: "MALE",
      size: "MEDIUM",
      description: "",
      city: "",
      vaccinated: false,
      neutered: false,
      goodWithChildren: false,
      goodWithPets: false,
      status: "AVAILABLE",
   });

   const [existingImages, setExistingImages] = useState([]);

   const [newImages, setNewImages] = useState([]);

   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);

   const [error, setError] = useState("");

   const [imageToDelete, setImageToDelete] = useState(null);

   const [deleteImageLoading, setDeleteImageLoading] = useState(false);

   useEffect(() => {
      const fetchPet = async () => {
         try {
            setLoading(true);
            setError("");

            const response = await api.get(`/pets/${petId}`);

            const pet = response.data.pet;

            if (pet.ownerId !== user?.id) {
               setError("You are not allowed to edit this pet");
               return;
            }

            setForm({
               name: pet.name || "",
               animalType: pet.animalType || "DOG",
               breed: pet.breed || "",
               age: pet.age ?? "",
               gender: pet.gender || "MALE",
               size: pet.size || "MEDIUM",
               description: pet.description || "",
               city: pet.city || "",
               vaccinated: pet.vaccinated || false,
               neutered: pet.neutered || false,
               goodWithChildren: pet.goodWithChildren || false,
               goodWithPets: pet.goodWithPets || false,
               status: pet.status || "AVAILABLE",
            });

            setExistingImages(pet.images || []);
         } catch (error) {
            setError(error.response?.data?.message || "Unable to load pet");
         } finally {
            setLoading(false);
         }
      };

      if (!authLoading && user && petId) {
         fetchPet();
      }
   }, [authLoading, user, petId]);

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;

      setForm((current) => ({
         ...current,
         [name]: type === "checkbox" ? checked : value,
      }));
   };

   const handleNewImages = (e) => {
      const selectedImages = Array.from(e.target.files || []);

      const totalImages = existingImages.length + selectedImages.length;

      if (totalImages > 5) {
         toast.error(
            `A pet can have a maximum of 5 images. You currently have ${existingImages.length}.`,
         );

         e.target.value = "";
         setNewImages([]);
         return;
      }

      setNewImages(selectedImages);
   };

   const handleDeleteImage = async () => {
      if (!imageToDelete) return;

      try {
         setDeleteImageLoading(true);

         await api.delete(`/pets/${petId}/images/${imageToDelete}`);

         setExistingImages((current) =>
            current.filter((image) => image.id !== imageToDelete),
         );

         toast.success("Image deleted successfully");

         setImageToDelete(null);
      } catch (error) {
         toast.error(error.response?.data?.message || "Unable to delete image");
      } finally {
         setDeleteImageLoading(false);
      }
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         setSubmitting(true);

         const payload = {
            ...form,
            age: form.age === "" ? undefined : Number(form.age),
            breed: form.breed || undefined,
         };

         await api.patch(`/pets/${petId}`, payload);

         if (newImages.length > 0) {
            const formData = new FormData();

            newImages.forEach((image) => {
               formData.append("images", image);
            });

            await api.post(`/pets/${petId}/images`, formData);

            toast.success("Images uploaded successfully");
         }

         toast.success("Pet updated successfully");

         router.push("/dashboard/shelter");
      } catch (error) {
         toast.error(error.response?.data?.message || "Unable to update pet");
      } finally {
         setSubmitting(false);
      }
   };

   if (authLoading || loading) {
      return <LoadingSpinner text="Loading Pet Details..." />;
   }

   if (!user || !["SHELTER", "OWNER"].includes(user.role)) {
      return (
         <main className="p-8">
            You are not authorized to edit pet listings.
         </main>
      );
   }

   if (error && !form.name) {
      return (
         <main className="p-8">
            <p className="text-red-500">{error}</p>
         </main>
      );
   }

   return (
      <main className="mx-auto max-w-4xl p-6 pb-16">
         <div className="mb-8">
            <Link
               href="/dashboard/shelter"
               className="text-sm text-gray-500 transition hover:text-black"
            >
               ← Back to dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold">Edit {form.name}</h1>

            <p className="mt-2 text-gray-500">
               Update the listing information, availability and images.
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
               title="Basic Information"
               description="Update the main details adopters see."
            >
               <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Pet Name">
                     <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Pet name"
                        className={inputClass}
                     />
                  </Field>

                  <Field label="Animal Type">
                     <select
                        name="animalType"
                        value={form.animalType}
                        onChange={handleChange}
                        className={inputClass}
                     >
                        <option value="DOG">Dog</option>
                        <option value="CAT">Cat</option>
                        <option value="BIRD">Bird</option>
                        <option value="RABBIT">Rabbit</option>
                        <option value="OTHER">Other</option>
                     </select>
                  </Field>

                  <Field label="Breed">
                     <input
                        name="breed"
                        value={form.breed}
                        onChange={handleChange}
                        placeholder="Breed"
                        className={inputClass}
                     />
                  </Field>

                  <Field label="Age">
                     <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="Age"
                        min="0"
                        className={inputClass}
                     />
                  </Field>

                  <Field label="Gender">
                     <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className={inputClass}
                     >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="UNKNOWN">Unknown</option>
                     </select>
                  </Field>

                  <Field label="Size">
                     <select
                        name="size"
                        value={form.size}
                        onChange={handleChange}
                        className={inputClass}
                     >
                        <option value="SMALL">Small</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LARGE">Large</option>
                     </select>
                  </Field>

                  <Field label="City">
                     <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="City"
                        className={inputClass}
                     />
                  </Field>

                  <Field
                     label="Listing Status"
                     helper="Controls whether adopters can currently apply."
                  >
                     <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className={inputClass}
                     >
                        <option value="AVAILABLE">Available</option>
                        <option value="PENDING">Pending</option>
                        <option value="ADOPTED">Adopted</option>
                        <option value="INACTIVE">Inactive</option>
                     </select>
                  </Field>
               </div>
            </FormSection>

            <FormSection
               title="About the Pet"
               description="Keep the description accurate and useful for adopters."
            >
               <Field label="Description">
                  <textarea
                     name="description"
                     value={form.description}
                     onChange={handleChange}
                     rows={6}
                     className={`${inputClass} resize-none`}
                  />
               </Field>
            </FormSection>

            <FormSection
               title="Health & Compatibility"
               description="Select everything that currently applies."
            >
               <div className="grid gap-4 sm:grid-cols-2">
                  <Checkbox
                     name="vaccinated"
                     label="Vaccinated"
                     description="Vaccinations are up to date."
                     checked={form.vaccinated}
                     onChange={handleChange}
                  />

                  <Checkbox
                     name="neutered"
                     label="Neutered / Spayed"
                     description="The pet has been neutered or spayed."
                     checked={form.neutered}
                     onChange={handleChange}
                  />

                  <Checkbox
                     name="goodWithChildren"
                     label="Good with children"
                     description="Comfortable around children."
                     checked={form.goodWithChildren}
                     onChange={handleChange}
                  />

                  <Checkbox
                     name="goodWithPets"
                     label="Good with other pets"
                     description="Comfortable around other animals."
                     checked={form.goodWithPets}
                     onChange={handleChange}
                  />
               </div>
            </FormSection>

            <FormSection
               title="Images"
               description={`${existingImages.length}/5 images currently uploaded.`}
            >
               {existingImages.length === 0 ? (
                  <div className="rounded-xl border border-dashed bg-gray-50 p-8 text-center text-sm text-gray-500">
                     No images uploaded yet.
                  </div>
               ) : (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                     {existingImages.map((image) => (
                        <div
                           key={image.id}
                           className="overflow-hidden rounded-xl border bg-white"
                        >
                           <img
                              src={image.imageUrl}
                              alt={form.name}
                              className="aspect-square w-full object-cover"
                           />

                           <button
                              type="button"
                              onClick={() => setImageToDelete(image.id)}
                              className="w-full border-t py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                           >
                              Delete Image
                           </button>
                        </div>
                     ))}
                  </div>
               )}

               {existingImages.length < 5 && (
                  <div className="mt-6 rounded-xl border border-dashed bg-gray-50 p-5">
                     <label className="mb-3 block font-medium">
                        Add More Images
                     </label>

                     <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleNewImages}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
                     />

                     <p className="mt-3 text-sm text-gray-500">
                        Maximum 5 images total.
                     </p>

                     {newImages.length > 0 && (
                        <div className="mt-4 rounded-lg bg-white px-4 py-3 text-sm">
                           {newImages.length} new image
                           {newImages.length > 1 ? "s" : ""} selected
                        </div>
                     )}
                  </div>
               )}
            </FormSection>

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
               <Link
                  href="/dashboard/shelter"
                  className="rounded-xl border px-6 py-3 text-center font-medium transition hover:bg-gray-50"
               >
                  Cancel
               </Link>

               <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  {submitting ? "Saving..." : "Save Changes"}
               </button>
            </div>
         </form>

         <ConfirmModal
            isOpen={Boolean(imageToDelete)}
            title="Delete image?"
            message="Are you sure you want to delete this image? This action cannot be undone."
            confirmText="Delete"
            danger
            loading={deleteImageLoading}
            onConfirm={handleDeleteImage}
            onCancel={() => {
               if (!deleteImageLoading) {
                  setImageToDelete(null);
               }
            }}
         />
      </main>
   );
}

const inputClass =
   "w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black focus:ring-1 focus:ring-black";

function FormSection({ title, description, children }) {
   return (
      <section className="rounded-2xl border bg-white p-6">
         <div className="mb-6">
            <h2 className="text-xl font-semibold">{title}</h2>

            {description && (
               <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
         </div>

         {children}
      </section>
   );
}

function Field({ label, helper, children }) {
   return (
      <div>
         <label className="mb-2 block text-sm font-medium">{label}</label>

         {children}

         {helper && <p className="mt-2 text-xs text-gray-500">{helper}</p>}
      </div>
   );
}

function Checkbox({ name, label, description, checked, onChange }) {
   return (
      <label
         className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
            checked ? "border-black bg-gray-50" : "hover:bg-gray-50"
         }`}
      >
         <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="mt-1 h-4 w-4 accent-black"
         />

         <div>
            <p className="font-medium">{label}</p>

            <p className="mt-1 text-sm text-gray-500">{description}</p>
         </div>
      </label>
   );
}
