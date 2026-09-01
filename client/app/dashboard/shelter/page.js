"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "../../../lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ShelterDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [pets, setPets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (
        !user ||
        !["SHELTER", "OWNER"].includes(user.role)
      ) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [petsResponse, requestsResponse] =
          await Promise.all([
            api.get("/pets"),
            api.get("/adoptions/received"),
          ]);

        const myPets = petsResponse.data.pets.filter(
          (pet) => pet.ownerId === user.id
        );

        setPets(myPets);
        setRequests(requestsResponse.data.requests);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDashboard();
    }
  }, [user, authLoading]);

  const handleRequestStatus = async (
    requestId,
    status
  ) => {
    try {
      await api.patch(
        `/adoptions/${requestId}/status`,
        { status }
      );

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status }
            : request
        )
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to update request"
      );
    }
  };

  if (authLoading || loading) {
    return (
      <main className="p-8">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (
    !user ||
    !["SHELTER", "OWNER"].includes(user.role)
  ) {
    return (
      <main className="p-8">
        <p>You are not authorized to view this page.</p>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-10">
      <div>
        <h1 className="text-3xl font-bold">
          {user.name}
        </h1>

        <p className="text-gray-600 mt-1">
          Manage your pet listings and adoption requests.
        </p>
      </div>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      <section>
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-semibold">
            My Pets
          </h2>

          <Link
            href="/dashboard/shelter/pets/new"
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            Add Pet
          </Link>
        </div>

        {pets.length === 0 ? (
          <p className="text-gray-500">
            You don't have any active listings.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="border rounded-xl overflow-hidden"
              >
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

                <div className="p-4">
                  <div className="flex justify-between">
                    <h3 className="text-xl font-semibold">
                      {pet.name}
                    </h3>

                    <span className="text-sm">
                      {pet.status}
                    </span>
                  </div>

                  <p className="text-gray-600">
                    {pet.breed || pet.animalType}
                  </p>

                  <p className="text-sm mt-2">
                    📍 {pet.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-5">
          Adoption Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-500">
            No adoption requests yet.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-xl p-5"
              >
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
                        handleRequestStatus(
                          request.id,
                          "ACCEPTED"
                        )
                      }
                      className="bg-black text-white px-4 py-2 rounded-lg"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleRequestStatus(
                          request.id,
                          "REJECTED"
                        )
                      }
                      className="border px-4 py-2 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}