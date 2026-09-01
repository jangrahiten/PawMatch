"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImages = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

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

        await api.post(
          `/pets/${petId}/images`,
          imageFormData
        );
      }

      router.push("/dashboard/shelter");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Unable to create pet listing"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <main className="p-8">Loading...</main>;
  }

  if (
    !user ||
    !["SHELTER", "OWNER"].includes(user.role)
  ) {
    return (
      <main className="p-8">
        You are not authorized to create pet listings.
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Add a Pet
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
          placeholder="Pet name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
          required
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
          placeholder="Breed"
          value={form.breed}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
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
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full border rounded-lg p-3"
          required
        />

        <textarea
          name="description"
          placeholder="Tell adopters about this pet..."
          value={form.description}
          onChange={handleChange}
          rows={6}
          className="w-full border rounded-lg p-3"
          required
        />

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
            label="Good with other pets"
            checked={form.goodWithPets}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">
            Pet Images
          </label>

          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
          />

          <p className="text-sm text-gray-500 mt-1">
            Maximum 5 images.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white rounded-lg py-3"
        >
          {submitting
            ? "Creating listing..."
            : "Create Pet Listing"}
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