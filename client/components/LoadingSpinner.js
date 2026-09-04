export default function LoadingSpinner({
  text = "Loading...",
}) {
  return (
    <div className="flex min-h-50 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

        <p className="text-sm text-gray-500">
          {text}
        </p>
      </div>
    </div>
  );
}