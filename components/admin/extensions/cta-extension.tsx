"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { MapPin, ArrowRight, X } from "lucide-react";

import { CTA_VARIANTS, type CtaVariant } from "@/lib/cta-variants";

// ── Editor NodeView ───────────────────────────────────────────────────────────

function CtaNodeView({ node, deleteNode }: NodeViewProps) {
  const variant = (node.attrs.variant ?? "general") as CtaVariant;
  const meta = CTA_VARIANTS[variant] ?? CTA_VARIANTS.general;

  return (
    <NodeViewWrapper
      contentEditable={false}
      className="my-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 select-none"
    >
      <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{meta.heading}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta.body}</p>
        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-primary">
          {meta.linkText}
          <ArrowRight className="size-3" />
        </p>
      </div>
      {/* Right side: variant badge + delete button */}
      <div className="flex shrink-0 flex-col items-end gap-2">
        <button
          type="button"
          onClick={deleteNode}
          title="Remove CTA block"
          className="flex size-5 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-3.5" />
        </button>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          {meta.label}
        </span>
      </div>
    </NodeViewWrapper>
  );
}

// ── Tiptap Node ───────────────────────────────────────────────────────────────

export const CtaExtension = Node.create({
  name: "guideCta",
  group: "block",
  atom: true, // non-editable, treated as a single unit

  addAttributes() {
    return {
      variant: {
        default: "general" as CtaVariant,
        parseHTML: (element) => element.getAttribute("data-variant") ?? "general",
        renderHTML: (attributes) => ({
          "data-variant": attributes.variant as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[class="guide-cta"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes({ class: "guide-cta" }, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CtaNodeView);
  },
});
