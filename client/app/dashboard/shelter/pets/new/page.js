"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function NewPetPage() {
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
   });

   const [images, setImages] = useState([]);
   const [submitting, setSubmitting] = useState(false);

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;

      setForm((current) => ({
         ...current,
         [name]: type === "checkbox" ? checked : value,
      }));
   };

   const handleImages = (e) => {
      const selectedImages = Array.from(e.target.files || []);

      if (selectedImages.length > 5) {
         toast.error("You can upload a maximum of 5 images");

         e.target.value = "";
         setImages([]);
         return;
      }

      setImages(selectedImages);
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         setSubmitting(true);

         const petPayload = {
            ...form,
            age: form.age ? Number(form.age) : undefined,
            breed: form.breed || undefined,
         };

         const petResponse = await api.post("/pets", petPayload);

         const petId = petResponse.data.pet.id;

         if (images.length > 0) {
            const imageFormData = new FormData();

            images.forEach((image) => {
               imageFormData.append("images", image);
            });

            await api.post(`/pets/${petId}/images`, imageFormData);
         }

         toast.success("Pet listed successfully");

         router.push("/dashboard/shelter");
      } catch (error) {
         console.error(error);

         toast.error(
            error.response?.data?.message || "Unable to create pet listing",
         );
      } finally {
         setSubmitting(false);
      }
   };

   if (authLoading) {
      return <LoadingSpinner text="Loading..." />;
   }

   if (!user || !["SHELTER", "OWNER"].includes(user.role)) {
      return (
         <main className="p-8">
            You are not authorized to create pet listings.
         </main>
      );
   }

   return (
      <main className="mx-auto max-w-4xl p-6 pb-16">
         {/* Header */}
         <div className="mb-8">
            <Link
               href="/dashboard/shelter"
               className="text-sm text-gray-500 transition hover:text-black"
            >
               ← Back to dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold">Add a Pet</h1>

            <p className="mt-2 text-gray-500">
               Create a detailed listing to help adopters find the right
               companion.
            </p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <FormSection
               title="Basic Information"
               description="Tell adopters the essentials about this pet."
            >
               <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Pet Name" required>
                     <input
                        name="name"
                        placeholder="e.g. Bruno"
                        value={form.name}
                        onChange={handleChange}
                        className={inputClass}
                        required
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

                  <Field label="Breed" helper="Leave blank if unknown.">
                     <input
                        name="breed"
                        placeholder="e.g. Labrador Retriever"
                        value={form.breed}
                        onChange={handleChange}
                        className={inputClass}
                     />
                  </Field>

                  <Field label="Age">
                     <input
                        type="number"
                        name="age"
                        placeholder="Age in years"
                        value={form.age}
                        onChange={handleChange}
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

                  <div className="sm:col-span-2">
                     <Field label="City" required>
                        <input
                           name="city"
                           placeholder="e.g. Delhi"
                           value={form.city}
                           onChange={handleChange}
                           className={inputClass}
                           required
                        />
                     </Field>
                  </div>
               </div>
            </FormSection>

            {/* Description */}
            <FormSection
               title="About the Pet"
               description="A good description helps adopters understand the pet's personality and needs."
            >
               <Field
                  label="Description"
                  required
                  helper="Mention temperament, habits, activity level, or anything adopters should know."
               >
                  <textarea
                     name="description"
                     placeholder="Tell adopters about this pet..."
                     value={form.description}
                     onChange={handleChange}
                     rows={6}
                     className={`${inputClass} resize-none`}
                     required
                  />
               </Field>
            </FormSection>

            {/* Health */}
            <FormSection
               title="Health & Compatibility"
               description="Select everything that applies."
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

            {/* Images */}
            <FormSection
               title="Pet Images"
               description="Upload clear photos that show the pet well."
            >
               <div className="rounded-xl border border-dashed bg-gray-50 p-5">
                  <input
                     type="file"
                     accept="image/*"
                     multiple
                     onChange={handleImages}
                     className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
                  />

                  <p className="mt-3 text-sm text-gray-500">
                     JPG, PNG or other supported images. Maximum 5 images.
                  </p>

                  {images.length > 0 && (
                     <div className="mt-4 rounded-lg bg-white px-4 py-3 text-sm text-gray-700">
                        {images.length} image
                        {images.length > 1 ? "s" : ""} selected
                     </div>
                  )}
               </div>
            </FormSection>

            {/* Actions */}
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
                  {submitting ? "Creating listing..." : "Create Pet Listing"}
               </button>
            </div>
         </form>
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

function Field({ label, helper, required, children }) {
   return (
      <div>
         <label className="mb-2 block text-sm font-medium">
            {label}

            {required && <span className="ml-1 text-red-500">*</span>}
         </label>

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

            {description && (
               <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
         </div>
      </label>
   );
}
