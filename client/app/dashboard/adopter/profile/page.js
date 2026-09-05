"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdopterProfilePage() {
   const { user, loading: authLoading } = useAuth();

   const [form, setForm] = useState({
      bio: "",
      housingType: "",
      hasChildren: false,
      hasOtherPets: false,
      preferredPet: "",
      preferredSize: "",
      preferredAge: "",
      petExperience: "",
   });

   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState("");

   useEffect(() => {
      const fetchProfile = async () => {
         if (!user) return;

         try {
            setLoading(true);
            setError("");

            const response = await api.get("/profile/me");

            const profile = response.data.profile.adopterProfile;

            if (profile) {
               setForm({
                  bio: profile.bio || "",
                  housingType: profile.housingType || "",
                  hasChildren: profile.hasChildren || false,
                  hasOtherPets: profile.hasOtherPets || false,
                  preferredPet: profile.preferredPet || "",
                  preferredSize: profile.preferredSize || "",
                  preferredAge: profile.preferredAge || "",
                  petExperience: profile.petExperience || "",
               });
            }
         } catch (error) {
            setError(error.response?.data?.message || "Unable to load profile");
         } finally {
            setLoading(false);
         }
      };

      if (!authLoading) {
         fetchProfile();
      }
   }, [user, authLoading]);

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;

      setForm((current) => ({
         ...current,
         [name]: type === "checkbox" ? checked : value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         setSaving(true);

         await api.patch("/profile/adopter", form);

         toast.success("Profile updated successfully");
      } catch (error) {
         toast.error(
            error.response?.data?.message || "Unable to update profile",
         );
      } finally {
         setSaving(false);
      }
   };

   if (authLoading || loading) {
      return <LoadingSpinner text="Loading Profile..." />;
   }

   if (!user) {
      return (
         <main className="p-8">
            <p>You need to log in.</p>
         </main>
      );
   }

   if (user.role !== "ADOPTER") {
      return (
         <main className="p-8">
            <p>You are not allowed to access this page.</p>
         </main>
      );
   }

   return (
      <main className="mx-auto max-w-4xl p-6 pb-16">
         {/* Header */}
         <div className="mb-8">
            <Link
               href="/dashboard/adopter"
               className="text-sm text-gray-500 transition hover:text-black"
            >
               ← Back to dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold">Adopter Profile</h1>

            <p className="mt-2 text-gray-500">
               Help shelters understand your lifestyle, experience, and the kind
               of pet you are looking for.
            </p>
         </div>

         {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
               {error}
            </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* About You */}
            <FormSection
               title="About You"
               description="Tell shelters a little about your home and lifestyle."
            >
               <div className="space-y-5">
                  <Field
                     label="Bio"
                     helper="A short introduction helps shelters understand who you are."
                  >
                     <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        rows={5}
                        className={`${inputClass} resize-none`}
                        placeholder="Tell shelters a little about yourself..."
                     />
                  </Field>

                  <Field label="Housing Type">
                     <select
                        name="housingType"
                        value={form.housingType}
                        onChange={handleChange}
                        className={inputClass}
                     >
                        <option value="">Select housing type</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Independent Floor">
                           Independent Floor
                        </option>
                        <option value="Other">Other</option>
                     </select>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                     <Checkbox
                        name="hasChildren"
                        label="Children at home"
                        description="There are children living in the household."
                        checked={form.hasChildren}
                        onChange={handleChange}
                     />

                     <Checkbox
                        name="hasOtherPets"
                        label="Other pets at home"
                        description="There are already other pets in the household."
                        checked={form.hasOtherPets}
                        onChange={handleChange}
                     />
                  </div>
               </div>
            </FormSection>

            {/* Preferences */}
            <FormSection
               title="Adoption Preferences"
               description="Tell shelters what kind of companion you are looking for."
            >
               <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Preferred Pet">
                     <select
                        name="preferredPet"
                        value={form.preferredPet}
                        onChange={handleChange}
                        className={inputClass}
                     >
                        <option value="">No preference</option>
                        <option value="DOG">Dog</option>
                        <option value="CAT">Cat</option>
                        <option value="BIRD">Bird</option>
                        <option value="RABBIT">Rabbit</option>
                        <option value="OTHER">Other</option>
                     </select>
                  </Field>

                  <Field label="Preferred Size">
                     <select
                        name="preferredSize"
                        value={form.preferredSize}
                        onChange={handleChange}
                        className={inputClass}
                     >
                        <option value="">No preference</option>
                        <option value="SMALL">Small</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LARGE">Large</option>
                     </select>
                  </Field>

                  <div className="sm:col-span-2">
                     <Field
                        label="Preferred Age"
                        helper="For example: puppy, adult, senior, or 2–5 years."
                     >
                        <input
                           type="text"
                           name="preferredAge"
                           value={form.preferredAge}
                           onChange={handleChange}
                           className={inputClass}
                           placeholder="Example: 2–5 years"
                        />
                     </Field>
                  </div>
               </div>
            </FormSection>

            {/* Experience */}
            <FormSection
               title="Pet Experience"
               description="Share any previous experience caring for animals."
            >
               <Field
                  label="Your Experience"
                  helper="You can mention previous pets, fostering, volunteering, or first-time ownership."
               >
                  <textarea
                     name="petExperience"
                     value={form.petExperience}
                     onChange={handleChange}
                     rows={5}
                     className={`${inputClass} resize-none`}
                     placeholder="Tell shelters about your experience with pets..."
                  />
               </Field>
            </FormSection>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
               <Link
                  href="/dashboard/adopter"
                  className="rounded-xl border px-6 py-3 text-center font-medium transition hover:bg-gray-50"
               >
                  Cancel
               </Link>

               <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
               >
                  {saving ? "Saving..." : "Save Profile"}
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
