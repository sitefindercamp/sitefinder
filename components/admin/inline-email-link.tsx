"use client";

/** Mailto anchor that stops click propagation so it doesn't toggle a parent <details> element. */
export function InlineEmailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      onClick={(e) => e.stopPropagation()}
      className="text-xs text-muted-foreground hover:text-primary"
    >
      {email}
    </a>
  );
}
