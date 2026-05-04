"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteUserAction } from "./actions";

export function DeleteUserButton({ userId, email }: { userId: string; email: string }) {
  return (
    <form
      action={deleteUserAction}
      onSubmit={(e) => {
        if (!confirm(`Delete ${email}? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="user_id" value={userId} />
      <Button
        type="submit"
        size="sm"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
