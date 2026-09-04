"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
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
         setError("");

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
      <main className="max-w-3xl mx-auto p-6">
         <h1 className="text-3xl font-bold mb-2">Adopter Profile</h1>

         <p className="text-gray-500 mb-8">
            Tell shelters more about yourself and the kind of pet you are
            looking for.
         </p>

         {error && <p className="text-red-500 mb-4">{error}</p>}

         <form onSubmit={handleSubmit} className="space-y-6">
            <div>
               <label className="block font-medium mb-2">Bio</label>

               <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Tell shelters a little about yourself..."
               />
            </div>

            <div>
               <label className="block font-medium mb-2">Housing Type</label>

               <select
                  name="housingType"
                  value={form.housingType}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
               >
                  <option value="">Select housing type</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Independent Floor">Independent Floor</option>
                  <option value="Other">Other</option>
               </select>
            </div>

            <div className="flex gap-8">
               <label className="flex items-center gap-2">
                  <input
                     type="checkbox"
                     name="hasChildren"
                     checked={form.hasChildren}
                     onChange={handleChange}
                  />
                  Have children
               </label>

               <label className="flex items-center gap-2">
                  <input
                     type="checkbox"
                     name="hasOtherPets"
                     checked={form.hasOtherPets}
                     onChange={handleChange}
                  />
                  Have other pets
               </label>
            </div>

            <div>
               <label className="block font-medium mb-2">Preferred Pet</label>

               <select
                  name="preferredPet"
                  value={form.preferredPet}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
               >
                  <option value="">No preference</option>
                  <option value="DOG">Dog</option>
                  <option value="CAT">Cat</option>
                  <option value="BIRD">Bird</option>
                  <option value="RABBIT">Rabbit</option>
                  <option value="OTHER">Other</option>
               </select>
            </div>

            <div>
               <label className="block font-medium mb-2">Preferred Size</label>

               <select
                  name="preferredSize"
                  value={form.preferredSize}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
               >
                  <option value="">No preference</option>
                  <option value="SMALL">Small</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LARGE">Large</option>
               </select>
            </div>

            <div>
               <label className="block font-medium mb-2">Preferred Age</label>

               <input
                  type="text"
                  name="preferredAge"
                  value={form.preferredAge}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Example: 2-5 years"
               />
            </div>

            <div>
               <label className="block font-medium mb-2">Pet Experience</label>

               <textarea
                  name="petExperience"
                  value={form.petExperience}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Tell shelters about your experience with pets..."
               />
            </div>

            <button
               type="submit"
               disabled={saving}
               className="bg-black text-white px-6 py-3 rounded-xl disabled:opacity-50"
            >
               {saving ? "Saving..." : "Save Profile"}
            </button>
         </form>
      </main>
   );
}
