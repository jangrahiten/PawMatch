"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";

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
        setError(
          error.response?.data?.message ||
            "Unable to load pets"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, []);

  if (loading) {
    return (
      <main className="p-8">
        <p>Loading pets...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-8">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          Find your new best friend
        </h1>

        <p className="text-gray-600 mt-2">
          Discover pets looking for a loving home.
        </p>
      </div>

      {pets.length === 0 ? (
        <p>No pets are currently available.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Link
              href={`/pets/${pet.id}`}
              key={pet.id}
              className="border rounded-xl overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-64 bg-gray-100">
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

              <div className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {pet.name}
                  </h2>

                  {pet.age !== null && (
                    <span className="text-sm text-gray-500">
                      {pet.age} yrs
                    </span>
                  )}
                </div>

                <p className="text-gray-600">
                  {pet.breed || pet.animalType}
                </p>

                <div className="flex gap-2 text-sm text-gray-500">
                  {pet.gender && <span>{pet.gender}</span>}
                  {pet.size && <span>• {pet.size}</span>}
                </div>

                <p className="text-sm">
                  📍 {pet.city}
                </p>

                <p className="text-xs text-gray-500">
                  Listed by{" "}
                  {pet.owner?.shelterProfile?.shelterName ||
                    pet.owner?.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}