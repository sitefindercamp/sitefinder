"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { AUDIENCE_TAGS } from "@/lib/audience-tags";

export { AUDIENCE_TAGS };

type Props = {
  /** FormData field name — submitted as comma-separated values */
  name: string;
  /** Pre-selected tags (array of tag values) */
  defaultValue?: string[];
};

export function AudienceTagPicker({ name, defaultValue = [] }: Props) {
  const [selected, setSelected] = useState<string[]>(defaultValue);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {AUDIENCE_TAGS.map(({ value, label }) => {
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      {/* Hidden input — submits as comma-separated string */}
      <input type="hidden" name={name} value={selected.join(",")} />
      {selected.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Preview: <span className="font-medium text-foreground">Good for:</span>{" "}
          {selected
            .map((v) => AUDIENCE_TAGS.find((t) => t.value === v)?.label ?? v)
            .join(" · ")}
        </p>
      )}
    </div>
  );
}
