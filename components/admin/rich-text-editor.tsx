"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
  MessageSquarePlus,
  ChevronDown,
  CheckSquare,
  MapPin,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CalloutExtension,
  CALLOUT_TYPES,
  type CalloutType,
} from "./extensions/callout-extension";
import {
  ChecklistBlockExtension,
  ChecklistItemExtension,
} from "./extensions/checklist-extension";
import { CtaExtension } from "./extensions/cta-extension";
import { CTA_VARIANTS, type CtaVariant } from "@/lib/cta-variants";

type RichTextEditorProps = {
  /** The hidden <input> name that gets submitted with the form */
  name: string;
  /** Initial HTML content */
  defaultValue?: string | null;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Min height class e.g. "min-h-[160px]" */
  minHeight?: string;
  /** Max height class for the scrollable content area e.g. "max-h-[600px]" */
  maxHeight?: string;
  /** Called whenever the editor content changes (for autosave) */
  onContentChange?: () => void;
};

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-sm transition-colors",
        isActive
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

// ── Callout dropdown ─────────────────────────────────────────────────────────

type CalloutDropdownProps = {
  onInsert: (type: CalloutType) => void;
};

function CalloutDropdown({ onInsert }: CalloutDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Insert callout box"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 items-center gap-0.5 rounded-lg px-1.5 text-sm transition-colors",
          open
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <MessageSquarePlus className="size-3.5" />
        <ChevronDown className="size-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          {(Object.entries(CALLOUT_TYPES) as [CalloutType, (typeof CALLOUT_TYPES)[CalloutType]][]).map(
            ([type, meta]) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onInsert(type);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm hover:bg-secondary/60"
              >
                <span
                  className={cn(
                    "text-xs font-semibold uppercase tracking-wide",
                    meta.labelColor
                  )}
                >
                  {meta.label}
                </span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── CTA block dropdown ────────────────────────────────────────────────────────

type CtaDropdownProps = {
  onInsert: (variant: CtaVariant) => void;
};

function CtaDropdown({ onInsert }: CtaDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Insert 'Find a spa' CTA"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 items-center gap-0.5 rounded-lg px-1.5 text-sm transition-colors",
          open
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <MapPin className="size-3.5" />
        <ChevronDown className="size-3" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-background shadow-lg">
          <p className="border-b border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Spa finder CTA
          </p>
          {(Object.entries(CTA_VARIANTS) as [CtaVariant, (typeof CTA_VARIANTS)[CtaVariant]][]).map(
            ([variant, meta]) => (
              <button
                key={variant}
                type="button"
                onClick={() => { onInsert(variant); setOpen(false); }}
                className="flex w-full flex-col items-start px-3 py-2 text-sm hover:bg-secondary/60"
              >
                <span className="font-medium text-foreground">{meta.label}</span>
                <span className="text-xs text-muted-foreground">{meta.heading}</span>
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

// ── Main editor component ────────────────────────────────────────────────────

export function RichTextEditor({
  name,
  defaultValue,
  placeholder = "Start typing…",
  minHeight = "min-h-[160px]",
  maxHeight,
  onContentChange,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        blockquote: false,
      }),
      Underline,
      CalloutExtension,
      ChecklistBlockExtension,
      ChecklistItemExtension,
      CtaExtension,
    ],
    content: defaultValue || "",
    onUpdate: () => {
      onContentChange?.();
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none px-4 py-3",
          minHeight,
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold",
          "[&_strong]:font-semibold [&_em]:italic [&_u]:underline",
          "[&_hr]:border-border [&_p]:leading-6"
        ),
      },
    },
    immediatelyRender: false,
  });

  // Attach a 'formdata' listener to the parent <form>.
  // This fires synchronously when the browser collects form data,
  // guaranteeing the current editor HTML is included at submit time.
  useEffect(() => {
    if (!editor) return;
    const form = containerRef.current?.closest("form");
    if (!form) return;

    const handleFormData = (e: FormDataEvent) => {
      // Remove any stale value from the hidden input, then inject the live HTML
      e.formData.delete(name);
      const html = editor.getHTML();
      // Don't submit an empty paragraph as content
      if (html && html !== "<p></p>") {
        e.formData.append(name, html);
      }
    };

    form.addEventListener("formdata", handleFormData);
    return () => form.removeEventListener("formdata", handleFormData);
  }, [editor, name]);

  const insertCallout = (type: CalloutType) => {
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: "callout",
        attrs: { type },
        content: [{ type: "paragraph" }],
      })
      .run();
  };

  const insertCta = (variant: CtaVariant) => {
    editor
      ?.chain()
      .focus()
      .insertContent({ type: "guideCta", attrs: { variant } })
      .run();
  };

  const insertChecklist = () => {
    editor
      ?.chain()
      .focus()
      .insertContent({
        type: "checklistBlock",
        content: [
          { type: "checklistItem", content: [{ type: "text", text: "First item" }] },
          { type: "checklistItem", content: [{ type: "text", text: "Second item" }] },
          { type: "checklistItem", content: [{ type: "text", text: "Third item" }] },
        ],
      })
      .run();
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring"
    >
      {/* Toolbar + editor — only shown once Tiptap has initialised client-side */}
      {editor ? (
        <>
          <div className="flex flex-wrap items-center gap-0.5 rounded-t-2xl border-b border-border bg-card px-2 py-1.5">
            {/* History */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
              <Undo className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
              <Redo className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Headings */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Inline formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet list"
            >
              <List className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered list"
            >
              <ListOrdered className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Divider line */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Divider line"
            >
              <Minus className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Callout box insert */}
            <CalloutDropdown onInsert={insertCallout} />

            {/* Checklist insert */}
            <ToolbarButton
              onClick={insertChecklist}
              isActive={editor.isActive("checklistBlock")}
              title="Insert checklist"
            >
              <CheckSquare className="size-3.5" />
            </ToolbarButton>

            {/* Spa CTA insert */}
            <CtaDropdown onInsert={insertCta} />
          </div>

          <div className={cn("relative overflow-y-auto rounded-b-2xl", minHeight, maxHeight)}>
            {editor.isEmpty && (
              <p className="pointer-events-none absolute px-4 py-3 text-sm text-muted-foreground/60">
                {placeholder}
              </p>
            )}
            <EditorContent editor={editor} />
          </div>
        </>
      ) : (
        /* Skeleton shown during SSR / before hydration */
        <div className={cn("px-4 py-3 text-sm text-muted-foreground/60", minHeight)}>
          {placeholder}
        </div>
      )}
    </div>
  );
}
