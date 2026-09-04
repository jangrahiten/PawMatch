"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ShelterProfilePage() {
   const { user, loading: authLoading } = useAuth();

   const [form, setForm] = useState({
      shelterName: "",
      description: "",
      address: "",
      phone: "",
      website: "",
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

            const profile = response.data.profile.shelterProfile;

            if (profile) {
               setForm({
                  shelterName: profile.shelterName || "",
                  description: profile.description || "",
                  address: profile.address || "",
                  phone: profile.phone || "",
                  website: profile.website || "",
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
      const { name, value } = e.target;

      setForm((current) => ({
         ...current,
         [name]: value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();

      try {
         setSaving(true);
         setError("");

         await api.patch("/profile/shelter", form);

         toast.success("Shelter profile updated successfully");
      } catch (error) {
         toast.error(
            error.response?.data?.message || "Unable to update profile",
         );
      } finally {
         setSaving(false);
      }
   };

   if (authLoading || loading) {
      return <LoadingSpinner text="Loading profile..." />;
   }

   if (!user) {
      return (
         <main className="p-8">
            <p>You need to log in.</p>
         </main>
      );
   }

   if (user.role !== "SHELTER" && user.role !== "OWNER") {
      return (
         <main className="p-8">
            <p>You are not allowed to access this page.</p>
         </main>
      );
   }

   return (
      <main className="max-w-3xl mx-auto p-6">
         <h1 className="text-3xl font-bold mb-2">Shelter Profile</h1>

         <p className="text-gray-500 mb-8">
            Manage your shelter information and contact details.
         </p>

         {error && <p className="text-red-500 mb-4">{error}</p>}

         <form onSubmit={handleSubmit} className="space-y-6">
            <div>
               <label className="block font-medium mb-2">Shelter Name</label>

               <input
                  type="text"
                  name="shelterName"
                  value={form.shelterName}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Happy Paws Shelter"
               />
            </div>

            <div>
               <label className="block font-medium mb-2">Description</label>

               <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Tell adopters about your shelter..."
               />
            </div>

            <div>
               <label className="block font-medium mb-2">Address</label>

               <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="Shelter address"
               />
            </div>

            <div>
               <label className="block font-medium mb-2">Phone</label>

               <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="+91..."
               />
            </div>

            <div>
               <label className="block font-medium mb-2">Website</label>

               <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="https://example.com"
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
