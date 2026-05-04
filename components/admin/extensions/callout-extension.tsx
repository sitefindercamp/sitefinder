"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import {
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";

// ── Callout type registry ────────────────────────────────────────────────────

export const CALLOUT_TYPES = {
  tip: {
    label: "Pro Tip",
    border: "border-green-200",
    bg: "bg-green-50/60",
    labelColor: "text-green-700",
  },
  note: {
    label: "First-timer Note",
    border: "border-blue-200",
    bg: "bg-blue-50/60",
    labelColor: "text-blue-700",
  },
  etiquette: {
    label: "Etiquette",
    border: "border-purple-200",
    bg: "bg-purple-50/60",
    labelColor: "text-purple-700",
  },
  warning: {
    label: "Watch Out",
    border: "border-amber-200",
    bg: "bg-amber-50/60",
    labelColor: "text-amber-700",
  },
} as const;

export type CalloutType = keyof typeof CALLOUT_TYPES;

// ── React NodeView — how the callout appears inside the editor ───────────────

function CalloutNodeView({ node }: NodeViewProps) {
  const type = (node.attrs.type ?? "tip") as CalloutType;
  const meta = CALLOUT_TYPES[type] ?? CALLOUT_TYPES.tip;

  return (
    <NodeViewWrapper
      className={`my-6 rounded-2xl border px-5 pt-3 pb-4 ${meta.border} ${meta.bg}`}
    >
      {/* Uneditable label */}
      <p
        contentEditable={false}
        className={`mb-2 select-none text-xs font-semibold uppercase tracking-[0.14em] ${meta.labelColor}`}
      >
        {meta.label}
      </p>

      {/* Editable content area */}
      <NodeViewContent className="text-sm leading-6 [&_p:last-child]:mb-0" />
    </NodeViewWrapper>
  );
}

// ── Tiptap Node extension ────────────────────────────────────────────────────

export const CalloutExtension = Node.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      type: {
        default: "tip" as CalloutType,
        parseHTML: (element) => {
          for (const t of Object.keys(CALLOUT_TYPES)) {
            if (element.classList.contains(`callout-${t}`)) return t;
          }
          return "tip";
        },
        renderHTML: (attributes) => ({
          class: `callout callout-${attributes.type as string}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.callout",
        // Only parse content from inside the .callout-content wrapper,
        // so the .callout-label paragraph isn't included as editable content.
        contentElement: "div.callout-content",
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const meta = CALLOUT_TYPES[node.attrs.type as CalloutType] ?? CALLOUT_TYPES.tip;
    return [
      "div",
      mergeAttributes(HTMLAttributes),
      // Static label paragraph (not editable)
      ["p", { class: "callout-label" }, meta.label],
      // Content wrapper — the `0` marks where ProseMirror places child nodes
      ["div", { class: "callout-content" }, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});
