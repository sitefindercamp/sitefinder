"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";

import { uploadFeaturedImageAction } from "@/app/(admin)/admin/blog/actions";

type Props = {
  name: string;
  defaultValue?: string | null;
};

export function FeaturedImageUploader({ name, defaultValue }: Props) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadFeaturedImageAction(fd);
    if ("error" in result) {
      setError(result.error);
    } else {
      setUrl(result.url);
    }
    setUploading(false);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Hidden form field — submitted with the parent form */}
      <input type="hidden" name={name} value={url} />

      {/* Preview / drop zone */}
      {url ? (
        <div className="group relative overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Featured image preview"
            className="h-52 w-full object-cover"
          />
          {/* Overlay buttons */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-foreground hover:bg-white"
            >
              <Upload className="size-4" />
              Replace
            </button>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-sm font-medium text-red-600 hover:bg-white"
            >
              <X className="size-4" />
              Remove
            </button>
          </div>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="size-6 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`flex h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <ImageIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  Click to upload <span className="text-muted-foreground font-normal">or drag and drop</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP, GIF</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileInput}
      />

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* URL paste fallback */}
      <div className="flex flex-col gap-1">
        <p className="text-xs text-muted-foreground">Or paste an image URL</p>
        <input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={url}
          onChange={(e) => { setUrl(e.target.value); setError(null); }}
          className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60"
        />
      </div>
    </div>
  );
}
