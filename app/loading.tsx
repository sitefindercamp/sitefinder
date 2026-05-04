export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
