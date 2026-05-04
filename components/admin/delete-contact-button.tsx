"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteContactSubmissionAction } from "@/app/(admin)/admin/contact/actions";

type Props = {
  id: string;
  filter: string | null;
};

export function DeleteContactButton({ id, filter }: Props) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/5 px-3 py-1.5 text-xs">
        <AlertTriangle className="size-3.5 text-destructive" />
        <span className="font-medium text-destructive">Delete this message?</span>
        <form action={deleteContactSubmissionAction}>
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="filter" value={filter ?? "all"} />
          <button
            type="submit"
            className="rounded-full bg-destructive px-2.5 py-0.5 font-semibold text-destructive-foreground transition hover:opacity-90"
          >
            Yes, delete
          </button>
        </form>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
    >
      <Trash2 className="size-3.5" />
      Delete
    </button>
  );
}
