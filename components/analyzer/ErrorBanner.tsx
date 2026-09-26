export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-300">
      <span className="mt-0.5 text-red-400">⚠</span>
      <span>{message}</span>
    </div>
  );
}
