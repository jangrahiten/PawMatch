"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <nav className="border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold">
        PawMatch
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/">Discover</Link>

        {!loading && !user && (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}

        {user?.role === "ADOPTER" && (
            <Link href="/dashboard/adopter">
                Dashboard
            </Link>
        )}

        {!loading && user && (
          <>
            <span className="text-sm">
              {user.name} · {user.role}
            </span>

            <button
              onClick={handleLogout}
              className="border rounded-lg px-4 py-2"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}