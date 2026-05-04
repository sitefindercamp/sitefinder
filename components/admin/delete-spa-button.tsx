"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type DeleteSpaButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  name: string;
  slug: string;
};

export function DeleteSpaButton({ action, id, name, slug }: DeleteSpaButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        aria-label={`Delete ${name}`}
        title={`Delete ${name}`}
        className="size-9 border-red-200 p-0 text-red-700 hover:bg-red-50"
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
