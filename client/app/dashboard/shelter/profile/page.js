"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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
      <main className="mx-auto max-w-4xl p-6 pb-16">
         <div className="mb-8">
            <Link
               href="/dashboard/shelter"
               className="text-sm text-gray-500 transition hover:text-black"
            >
               ← Back to dashboard
            </Link>

            <h1 className="mt-4 text-3xl font-bold">Shelter Profile</h1>

            <p className="mt-2 text-gray-500">
               Manage the information adopters see about your shelter or
               organization.
            </p>
         </div>

         {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
               {error}
            </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
               title="Shelter Information"
               description="Introduce your shelter to potential adopters."
            >
               <div className="space-y-5">
                  <Field label="Shelter Name">
                     <input
                        type="text"
                        name="shelterName"
                        value={form.shelterName}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Happy Paws Shelter"
                     />
                  </Field>

                  <Field
                     label="Description"
                     helper="Explain your mission, the animals you care for, or anything adopters should know."
                  >
                     <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={6}
                        className={`${inputClass} resize-none`}
                        placeholder="Tell adopters about your shelter..."
                     />
                  </Field>
               </div>
            </FormSection>

            <FormSection
               title="Contact Details"
               description="Help adopters know where and how to reach you."
            >
               <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                     <Field label="Address">
                        <input
                           type="text"
                           name="address"
                           value={form.address}
                           onChange={handleChange}
                           className={inputClass}
                           placeholder="Shelter address"
                        />
                     </Field>
                  </div>

                  <Field label="Phone">
                     <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="+91 98765 43210"
                     />
                  </Field>

                  <Field
                     label="Website"
                     helper="Include https:// if you have a website."
                  >
                     <input
                        type="url"
                        name="website"
                        value={form.website}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="https://example.com"
                     />
                  </Field>
               </div>
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

            <p className="mt-1 text-sm text-gray-500">{description}</p>
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
