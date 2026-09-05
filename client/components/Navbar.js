"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "../context/AuthContext";

export default function Navbar() {
   const router = useRouter();
   const pathname = usePathname();

   const { user, loading, logout } = useAuth();

   const [menuOpen, setMenuOpen] = useState(false);

   const handleLogout = async () => {
      await logout();
      setMenuOpen(false);
      router.push("/login");
   };

   const closeMenu = () => {
      setMenuOpen(false);
   };

   const dashboardHref =
      user?.role === "ADOPTER"
         ? "/dashboard/adopter"
         : ["SHELTER", "OWNER"].includes(user?.role)
           ? "/dashboard/shelter"
           : null;

   const navLinkClass = (href) =>
      `transition ${
         pathname === href
            ? "font-semibold text-black"
            : "text-gray-600 hover:text-black"
      }`;

   return (
      <nav className="border-b bg-white">
         <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link href="/" onClick={closeMenu} className="text-2xl font-bold">
               PawMatch
            </Link>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-6">
               <Link href="/" className={navLinkClass("/")}>
                  Discover
               </Link>

               {!loading && !user && (
                  <>
                     <Link href="/login" className={navLinkClass("/login")}>
                        Login
                     </Link>

                     <Link
                        href="/register"
                        className={navLinkClass("/register")}
                     >
                        Register
                     </Link>
                  </>
               )}

               {dashboardHref && (
                  <Link
                     href={dashboardHref}
                     className={navLinkClass(dashboardHref)}
                  >
                     Dashboard
                  </Link>
               )}

               {user && (
                  <Link href="/messages" className={navLinkClass("/messages")}>
                     Messages
                  </Link>
               )}

               {!loading && user && (
                  <>
                     <div className="text-right">
                        <p className="text-sm font-medium">{user.name}</p>

                        <p className="text-xs text-gray-500">
                           {formatRole(user.role)}
                        </p>
                     </div>

                     <button
                        onClick={handleLogout}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 transition"
                     >
                        Logout
                     </button>
                  </>
               )}
            </div>

            {/* Mobile hamburger */}
            <button
               type="button"
               onClick={() => setMenuOpen((current) => !current)}
               className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border"
               aria-label="Toggle navigation menu"
               aria-expanded={menuOpen}
            >
               {menuOpen ? (
                  <span className="text-xl">✕</span>
               ) : (
                  <span className="text-xl">☰</span>
               )}
            </button>
         </div>

         {/* Mobile menu */}
         {menuOpen && (
            <div className="border-t px-6 py-4 md:hidden">
               <div className="flex flex-col gap-4">
                  <Link
                     href="/"
                     onClick={closeMenu}
                     className={navLinkClass("/")}
                  >
                     Discover
                  </Link>

                  {!loading && !user && (
                     <>
                        <Link
                           href="/login"
                           onClick={closeMenu}
                           className={navLinkClass("/login")}
                        >
                           Login
                        </Link>

                        <Link
                           href="/register"
                           onClick={closeMenu}
                           className={navLinkClass("/register")}
                        >
                           Register
                        </Link>
                     </>
                  )}

                  {dashboardHref && (
                     <Link
                        href={dashboardHref}
                        onClick={closeMenu}
                        className={navLinkClass(dashboardHref)}
                     >
                        Dashboard
                     </Link>
                  )}

                  {user && (
                     <Link
                        href="/messages"
                        onClick={closeMenu}
                        className={navLinkClass("/messages")}
                     >
                        Messages
                     </Link>
                  )}

                  {!loading && user && (
                     <>
                        <div className="border-t pt-4">
                           <p className="font-medium">{user.name}</p>

                           <p className="text-sm text-gray-500">
                              {formatRole(user.role)}
                           </p>
                        </div>

                        <button
                           onClick={handleLogout}
                           className="w-full rounded-lg border px-4 py-2 text-left hover:bg-gray-50 transition"
                        >
                           Logout
                        </button>
                     </>
                  )}
               </div>
            </div>
         )}
      </nav>
   );
}

function formatRole(role) {
   const labels = {
      ADOPTER: "Adopter",
      SHELTER: "Shelter",
      OWNER: "Pet Owner",
      ADMIN: "Admin",
   };

   return labels[role] || role;
}
