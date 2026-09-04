"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

      await login(form.email, form.password);

      toast.success("Logged in successfully");

      router.push("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to log in"
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
          Login to PawMatch
        </h1>

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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white rounded-lg py-3 disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}