"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
        setError(
          error.response?.data?.message ||
            "Unable to load pet"
        );
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
    setNewImages(Array.from(e.target.files));
  };

  const handleDeleteImage = async (imageId) => {
    const confirmed = window.confirm(
      "Delete this image?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/pets/${petId}/images/${imageId}`
      );

      setExistingImages((current) =>
        current.filter((image) => image.id !== imageId)
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to delete image"
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

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

        await api.post(
          `/pets/${petId}/images`,
          formData
        );
      }

      router.push("/dashboard/shelter");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update pet"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="p-8">
        Loading...
      </main>
    );
  }

  if (
    !user ||
    !["SHELTER", "OWNER"].includes(user.role)
  ) {
    return (
      <main className="p-8">
        You are not authorized to edit pet listings.
      </main>
    );
  }

  if (error && !form.name) {
    return (
      <main className="p-8">
        <p className="text-red-500">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Edit {form.name}
      </h1>

      {error && (
        <p className="text-red-500 mb-4">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Pet name"
          className="w-full border rounded-lg p-3"
        />

        <select
          name="animalType"
          value={form.animalType}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
        >
          <option value="DOG">Dog</option>
          <option value="CAT">Cat</option>
          <option value="BIRD">Bird</option>
          <option value="RABBIT">Rabbit</option>
          <option value="OTHER">Other</option>
        </select>

        <input
          name="breed"
          value={form.breed}
          onChange={handleChange}
          placeholder="Breed"
          className="w-full border rounded-lg p-3"
        />

        <input
          type="number"
          name="age"
          value={form.age}
          onChange={handleChange}
          placeholder="Age"
          min="0"
          className="w-full border rounded-lg p-3"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
        >
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="UNKNOWN">Unknown</option>
        </select>

        <select
          name="size"
          value={form.size}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
        >
          <option value="SMALL">Small</option>
          <option value="MEDIUM">Medium</option>
          <option value="LARGE">Large</option>
        </select>

        <input
          name="city"
          value={form.city}
          onChange={handleChange}
          placeholder="City"
          className="w-full border rounded-lg p-3"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={6}
          className="w-full border rounded-lg p-3"
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
        >
          <option value="AVAILABLE">Available</option>
          <option value="PENDING">Pending</option>
          <option value="ADOPTED">Adopted</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <div className="grid sm:grid-cols-2 gap-4">
          <Checkbox
            name="vaccinated"
            label="Vaccinated"
            checked={form.vaccinated}
            onChange={handleChange}
          />

          <Checkbox
            name="neutered"
            label="Neutered"
            checked={form.neutered}
            onChange={handleChange}
          />

          <Checkbox
            name="goodWithChildren"
            label="Good with children"
            checked={form.goodWithChildren}
            onChange={handleChange}
          />

          <Checkbox
            name="goodWithPets"
            label="Good with pets"
            checked={form.goodWithPets}
            onChange={handleChange}
          />
        </div>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            Existing Images
          </h2>

          {existingImages.length === 0 ? (
            <p className="text-gray-500">
              No images uploaded.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {existingImages.map((image) => (
                <div
                  key={image.id}
                  className="border rounded-lg overflow-hidden"
                >
                  <img
                    src={image.imageUrl}
                    alt={form.name}
                    className="w-full h-36 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteImage(image.id)
                    }
                    className="w-full border-t py-2 text-red-500"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <label className="block font-medium mb-2">
            Add More Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleNewImages}
          />
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white rounded-lg py-3"
        >
          {submitting
            ? "Saving..."
            : "Save Changes"}
        </button>
      </form>
    </main>
  );
}

function Checkbox({
  name,
  label,
  checked,
  onChange,
}) {
  return (
    <label className="flex items-center gap-2 border rounded-lg p-3">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />

      <span>{label}</span>
    </label>
  );
}