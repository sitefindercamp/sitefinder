"use client";

import { Node } from "@tiptap/core";
import {
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";

// ── ChecklistItem NodeView ────────────────────────────────────────────────────

function ChecklistItemView(_props: NodeViewProps) {
  return (
    <NodeViewWrapper as="li" className="flex items-start gap-2.5 py-0.5">
      {/* Static visual checkbox — not interactive, meant for screenshots */}
      <div
        contentEditable={false}
        className="mt-[3px] flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border-2 border-primary/50 bg-primary/8 select-none"
      >
        {/* Empty — checked state would go here */}
      </div>
      <NodeViewContent as="span" className="flex-1 leading-6" />
    </NodeViewWrapper>
  );
}

// ── ChecklistItem Node ────────────────────────────────────────────────────────

export const ChecklistItemExtension = Node.create({
  name: "checklistItem",
  group: "checklistContent",
  content: "inline*",
  defining: true,

  parseHTML() {
    return [{ tag: "ul.guide-checklist > li" }];
  },

  renderHTML() {
    return ["li", 0];
  },

  addKeyboardShortcuts() {
    return {
      // On Enter inside an empty checklistItem, exit the checklist
      Enter: () => {
        const { $from, empty } = this.editor.state.selection;
        if (!empty) return false;
        if ($from.parent.type.name !== "checklistItem") return false;
        if ($from.parent.content.size !== 0) return false;
        // Empty item → convert current block to paragraph (exits list)
        return this.editor.commands.clearNodes();
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChecklistItemView);
  },
});

// ── ChecklistBlock Node ───────────────────────────────────────────────────────

export const ChecklistBlockExtension = Node.create({
  name: "checklistBlock",
  group: "block",
  content: "checklistContent+",

  parseHTML() {
    return [{ tag: "ul.guide-checklist" }];
  },

  renderHTML() {
    return ["ul", { class: "guide-checklist" }, 0];
  },
});
