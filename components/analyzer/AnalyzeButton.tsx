interface AnalyzeButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function AnalyzeButton({ onClick, loading, disabled }: AnalyzeButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-zinc-50 px-6 text-sm font-semibold text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] transition-all hover:bg-zinc-200 hover:shadow-[0_0_24px_rgba(129,140,248,0.3)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
      )}
      {loading ? "Analyzing..." : "Analyze Dependencies"}
    </button>
  );
}
