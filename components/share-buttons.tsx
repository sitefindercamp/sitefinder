"use client";

import { useState, useEffect } from "react";
import { Check, Link2, Share2 } from "lucide-react";

type Props = {
  url: string;
  title: string;
  /** Optional short description passed to Web Share API */
  text?: string;
};

// ── Brand icons ───────────────────────────────────────────────────────────────

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// ── ShareButtons ──────────────────────────────────────────────────────────────

export function ShareButtons({ url, title, text }: Props) {
  const [copied, setCopied] = useState(false);
  /** null = not yet measured (SSR), true/false after hydration */
  const [canNativeShare, setCanNativeShare] = useState<boolean | null>(null);
  const [nativeShared, setNativeShared] = useState(false);

  // Detect Web Share API support after hydration
  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const xHref = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;

  async function handleNativeShare() {
    try {
      await navigator.share({ title, text: text ?? title, url });
      setNativeShared(true);
      setTimeout(() => setNativeShared(false), 2000);
    } catch {
      // User cancelled or share failed — no-op
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── Native share (mobile / supported browsers) ─────────────────────────────
  if (canNativeShare) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          {nativeShared ? (
            <Check className="size-4" />
          ) : (
            <Share2 className="size-4" />
          )}
          {nativeShared ? "Shared!" : "Share"}
        </button>

        {/* Copy-link still available as quick alternative */}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy link"
          className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
        >
          {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        </button>
      </div>
    );
  }

  // ── Desktop fallback (social icons + copy link) ────────────────────────────
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground">Share:</span>

      <a
        href={facebookHref}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Share on Facebook"
        className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
      >
        <FacebookIcon />
      </a>

      <a
        href={xHref}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Share on X"
        className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-black hover:bg-black hover:text-white"
      >
        <XIcon />
      </a>

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link"
        className="flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}
