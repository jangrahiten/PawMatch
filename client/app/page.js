"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "../lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";

export default function HomePage() {
   const [pets, setPets] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");

   useEffect(() => {
      const fetchPets = async () => {
         try {
            setLoading(true);
            setError("");

            const response = await api.get("/pets");

            setPets(response.data.pets);
         } catch (error) {
            setError(error.response?.data?.message || "Unable to load pets");
         } finally {
            setLoading(false);
         }
      };

      fetchPets();
   }, []);

   if (loading) {
      return <LoadingSpinner text="Finding pets for you..." />;
   }

   if (error) {
      return (
         <main className="mx-auto max-w-7xl p-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
               {error}
            </div>
         </main>
      );
   }

   return (
      <main>
         {/* Hero */}
         <section className="border-b bg-gray-50">
            <div className="mx-auto max-w-7xl px-6 py-12 sm:py-20">
               <div className="max-w-3xl">
                  <span className="inline-flex rounded-full border bg-white px-3 py-1 text-sm font-medium text-gray-600">
                     Find. Connect. Adopt.
                  </span>

                  <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                     Find your new
                     <span className="block">best friend.</span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                     Discover pets looking for loving homes and connect directly
                     with shelters and pet owners.
                  </p>
               </div>
            </div>
         </section>

         {/* Discover */}
         <section className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
               <div>
                  <h2 className="text-2xl font-bold sm:text-3xl">
                     Pets waiting for a home
                  </h2>

                  <p className="mt-1 text-gray-500">
                     Meet pets currently available for adoption.
                  </p>
               </div>

               {pets.length > 0 && (
                  <p className="text-sm text-gray-500">
                     {pets.length} {pets.length === 1 ? "pet" : "pets"}{" "}
                     available
                  </p>
               )}
            </div>

            {pets.length === 0 ? (
               <EmptyState
                  title="No pets available right now"
                  description="There aren't any available pet listings at the moment. Check back again soon."
               />
            ) : (
               <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {pets.map((pet) => (
                     <PetCard key={pet.id} pet={pet} />
                  ))}
               </div>
            )}
         </section>
      </main>
   );
}

function PetCard({ pet }) {
   return (
      <Link
         href={`/pets/${pet.id}`}
         className="group overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
         {/* Image */}
         <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
            {pet.images?.length > 0 ? (
               <img
                  src={pet.images[0].imageUrl}
                  alt={pet.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
               />
            ) : (
               <div className="flex h-full w-full items-center justify-center text-gray-400">
                  No image available
               </div>
            )}

            {/* Animal type badge */}
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
               {formatAnimalType(pet.animalType)}
            </span>
         </div>

         {/* Details */}
         <div className="p-5">
            <div className="flex items-start justify-between gap-4">
               <div>
                  <h3 className="text-xl font-bold transition group-hover:underline">
                     {pet.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                     {pet.breed || formatAnimalType(pet.animalType)}
                  </p>
               </div>

               {pet.age !== null && pet.age !== undefined && (
                  <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                     {pet.age} {pet.age === 1 ? "yr" : "yrs"}
                  </span>
               )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
               {pet.gender && <PetTag value={formatValue(pet.gender)} />}

               {pet.size && <PetTag value={formatValue(pet.size)} />}

               {pet.vaccinated && <PetTag value="Vaccinated" />}
            </div>

            <div className="mt-5 border-t pt-4">
               <p className="text-sm font-medium text-gray-700">
                  📍 {pet.city}
               </p>

               <p className="mt-2 text-xs text-gray-500">
                  Listed by{" "}
                  <span className="font-medium text-gray-700">
                     {pet.owner?.shelterProfile?.shelterName ||
                        pet.owner?.name ||
                        "Pet owner"}
                  </span>
               </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm font-medium">
               <span>View profile</span>
               <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
               </span>
            </div>
         </div>
      </Link>
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
