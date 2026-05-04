"use client";

import { deleteBlogPostAction } from "@/app/(admin)/admin/blog/actions";

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={deleteBlogPostAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="inline-flex h-8 items-center rounded-lg px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => {
          if (!confirm(`Delete "${title}"?`)) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
