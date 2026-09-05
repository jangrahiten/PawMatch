import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-gray-500">
          404
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Page not found
        </h1>

        <p className="mt-4 text-gray-500">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:bg-gray-800"
        >
          Back to Discover
        </Link>
      </div>
    </main>
  );
}