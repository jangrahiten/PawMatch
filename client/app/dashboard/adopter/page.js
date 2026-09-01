"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "../../../lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AdopterDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [likes, setLikes] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user || user.role !== "ADOPTER") {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [likesResponse, requestsResponse] =
          await Promise.all([
            api.get("/likes"),
            api.get("/adoptions/mine"),
          ]);

        setLikes(likesResponse.data.likes);
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

  if (authLoading || loading) {
    return (
      <main className="p-8">
        <p>Loading dashboard...</p>
      </main>
    );
  }

  if (!user || user.role !== "ADOPTER") {
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
          Welcome, {user.name}
        </h1>

        <p className="text-gray-600 mt-1">
          Manage your liked pets and adoption requests.
        </p>
      </div>

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      <section>
        <h2 className="text-2xl font-semibold mb-5">
          Liked Pets
        </h2>

        {likes.length === 0 ? (
          <p className="text-gray-500">
            You haven't liked any pets yet.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {likes.map((like) => (
              <Link
                key={like.id}
                href={`/pets/${like.pet.id}`}
                className="border rounded-xl overflow-hidden"
              >
                <div className="h-52 bg-gray-100">
                  {like.pet.images?.length > 0 ? (
                    <img
                      src={like.pet.images[0].imageUrl}
                      alt={like.pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-semibold">
                    {like.pet.name}
                  </h3>

                  <p className="text-gray-600">
                    {like.pet.breed ||
                      like.pet.animalType}
                  </p>

                  <p className="text-sm mt-2">
                    📍 {like.pet.city}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-5">
          My Adoption Requests
        </h2>

        {requests.length === 0 ? (
          <p className="text-gray-500">
            You haven't submitted any adoption requests.
          </p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-xl p-5 flex gap-5"
              >
                <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  {request.pet.images?.length > 0 ? (
                    <img
                      src={
                        request.pet.images[0].imageUrl
                      }
                      alt={request.pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link
                        href={`/pets/${request.pet.id}`}
                        className="text-xl font-semibold"
                      >
                        {request.pet.name}
                      </Link>

                      <p className="text-sm text-gray-500">
                        {request.pet.breed ||
                          request.pet.animalType}
                      </p>
                    </div>

                    <StatusBadge
                      status={request.status}
                    />
                  </div>

                  {request.message && (
                    <p className="mt-3 text-gray-700">
                      {request.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function StatusBadge({ status }) {
  const labels = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

  return (
    <span className="border rounded-full px-3 py-1 text-sm h-fit">
      {labels[status] || status}
    </span>
  );
}