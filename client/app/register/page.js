"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADOPTER",
    city: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await register(form);

      toast.success("Account created successfully");

      router.push("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to create account"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4"
      >
        <h1 className="text-3xl font-bold">
          Create your PawMatch account
        </h1>

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-3"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-3"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-3"
          required
        />

        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-3"
        >
          <option value="ADOPTER">
            Adopter
          </option>

          <option value="SHELTER">
            Shelter
          </option>

          <option value="OWNER">
            Pet Owner
          </option>
        </select>

        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-3"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white rounded-lg py-3 disabled:opacity-50"
        >
          {submitting
            ? "Creating account..."
            : "Create account"}
        </button>
      </form>
    </main>
  );
}