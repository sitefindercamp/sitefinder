"use client";

import { useRef, useState, useCallback, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { AMENITY_CATEGORIES, normalizeAmenitySelection } from "@/lib/amenities";
import type { SpaStatus } from "@/lib/admin-spas";

const CATEGORY_OPTIONS = [
  "Gym",
  "Hammam",
  "Korean Spa",
  "Onsen",
  "Resort Spa",
  "Sauna Only",
] as const;

type SpaEditorFormProps = {
  submitLabel: string;
  formAction: (formData: FormData) => void | Promise<void>;
  /** When provided, the form autosaves after 1.5 s of inactivity. */
  autoSaveAction?: (formData: FormData) => Promise<void>;
  /** Hide status/is_featured fields — use for owner-facing edit forms. */
  hideAdminFields?: boolean;
  defaultValues?: {
    name?: string;
    slug?: string;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    address_line_1?: string | null;
    address_line_2?: string | null;
    city?: string;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
    summary?: string | null;
    description?: string | null;
    hours_text?: string | null;
    pricing_text?: string | null;
    what_to_know?: string | null;
    important_notes?: string | null;
    google_review_url?: string | null;
    yelp_review_url?: string | null;
    status?: SpaStatus;
    is_featured?: boolean;
    business_email?: string | null;
    business_website?: string | null;
    business_phone?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    tiktok_url?: string | null;
    twitter_url?: string | null;
    youtube_url?: string | null;
    day_pass_offered?: boolean;
    day_pass_price?: string | null;
    listing_categories?: string[];
    amenities?: string[];
  };
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-3xl border border-border bg-secondary/20 p-5 md:col-span-2">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function SpaEditorForm({
  submitLabel,
  formAction,
  autoSaveAction,
  defaultValues,
  hideAdminFields = false,
}: SpaEditorFormProps) {
  const selectedAmenities = new Set(
    normalizeAmenitySelection(defaultValues?.amenities ?? [])
  );
  const selectedCategories = new Set(defaultValues?.listing_categories ?? []);

  const formRef = useRef<HTMLFormElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const triggerAutosave = useCallback(() => {
    if (!autoSaveAction || !formRef.current) return;

    // Reset any pending debounce
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      if (!formRef.current) return;
      setSaveStatus("saving");
      try {
        // new FormData(form) fires the 'formdata' event, which lets
        // RichTextEditor instances inject their current HTML content.
        const formData = new FormData(formRef.current);
        await autoSaveAction(formData);
        setSaveStatus("saved");
        // Auto-clear the "Saved" badge after 3 s
        if (savedTimer.current) clearTimeout(savedTimer.current);
        savedTimer.current = setTimeout(() => setSaveStatus("idle"), 3000);
      } catch {
        setSaveStatus("idle");
      }
    }, 1500);
  }, [autoSaveAction]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spa profile</CardTitle>
        <CardDescription>
          Create or update the full directory listing using the current Supabase
          fields, plus the existing admin-only amenities and media options.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* onChange bubbles from all native inputs/selects/textareas */}
        <form
          ref={formRef}
          action={formAction}
          onChange={triggerAutosave}
          className="grid gap-5 md:grid-cols-2"
        >
          <Section title="Basic Info">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={defaultValues?.name} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={defaultValues?.slug} />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="summary">Summary</Label>
              <Textarea
                id="summary"
                name="summary"
                rows={3}
                defaultValue={defaultValues?.summary ?? ""}
              />
            </div>
          </Section>

          <Section title="Location">
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="address_line_1">Address Line 1</Label>
              <Input
                id="address_line_1"
                name="address_line_1"
                defaultValue={defaultValues?.address_line_1 ?? ""}
                placeholder="123 Main St"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="address_line_2">Address Line 2</Label>
              <Input
                id="address_line_2"
                name="address_line_2"
                defaultValue={defaultValues?.address_line_2 ?? ""}
                placeholder="Suite, floor, or landmark"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={defaultValues?.city} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="state">State / Province</Label>
              <Input id="state" name="state" defaultValue={defaultValues?.state ?? ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                name="postal_code"
                defaultValue={defaultValues?.postal_code ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                defaultValue={defaultValues?.country ?? ""}
                placeholder="e.g. United States, Canada"
              />
            </div>
          </Section>

          <Section title="Contact">
            <div className="flex flex-col gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={defaultValues?.website ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={defaultValues?.phone ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={defaultValues?.email ?? ""}
              />
            </div>
          </Section>

          <Section title="Listing Content">
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label>Description</Label>
              <RichTextEditor
                name="description"
                defaultValue={defaultValues?.description}
                placeholder="Full description of the spa…"
                minHeight="min-h-[200px]"
                onContentChange={triggerAutosave}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Hours</Label>
              <RichTextEditor
                name="hours_text"
                defaultValue={defaultValues?.hours_text}
                placeholder="e.g. Mon–Fri 9am–10pm, Sat–Sun 8am–11pm"
                minHeight="min-h-[140px]"
                onContentChange={triggerAutosave}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Pricing</Label>
              <RichTextEditor
                name="pricing_text"
                defaultValue={defaultValues?.pricing_text}
                placeholder="e.g. Day pass $45, couples $80…"
                minHeight="min-h-[140px]"
                onContentChange={triggerAutosave}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>What to Know</Label>
              <RichTextEditor
                name="what_to_know"
                defaultValue={defaultValues?.what_to_know}
                placeholder="Tips for first-time visitors…"
                minHeight="min-h-[160px]"
                onContentChange={triggerAutosave}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Important Notes</Label>
              <RichTextEditor
                name="important_notes"
                defaultValue={defaultValues?.important_notes}
                placeholder="Anything guests should be aware of…"
                minHeight="min-h-[160px]"
                onContentChange={triggerAutosave}
              />
            </div>
          </Section>

          <Section title="Links">
            <div className="flex flex-col gap-2">
              <Label htmlFor="google_review_url">Google Review URL</Label>
              <Input
                id="google_review_url"
                name="google_review_url"
                type="url"
                defaultValue={defaultValues?.google_review_url ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="yelp_review_url">Yelp Review URL</Label>
              <Input
                id="yelp_review_url"
                name="yelp_review_url"
                type="url"
                defaultValue={defaultValues?.yelp_review_url ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="facebook_url">Facebook Link</Label>
              <Input
                id="facebook_url"
                name="facebook_url"
                type="url"
                defaultValue={defaultValues?.facebook_url ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="instagram_url">Instagram Link</Label>
              <Input
                id="instagram_url"
                name="instagram_url"
                type="url"
                defaultValue={defaultValues?.instagram_url ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tiktok_url">TikTok Link</Label>
              <Input
                id="tiktok_url"
                name="tiktok_url"
                type="url"
                defaultValue={defaultValues?.tiktok_url ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="twitter_url">Twitter/X Link</Label>
              <Input
                id="twitter_url"
                name="twitter_url"
                type="url"
                defaultValue={defaultValues?.twitter_url ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="youtube_url">YouTube Link</Label>
              <Input
                id="youtube_url"
                name="youtube_url"
                type="url"
                defaultValue={defaultValues?.youtube_url ?? ""}
              />
            </div>
          </Section>

          {!hideAdminFields && (
            <Section title="Publishing">
              <div className="flex flex-col gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={defaultValues?.status ?? "draft"}
                  className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex h-11 w-full items-center gap-3 rounded-2xl border border-border px-4 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="is_featured"
                    defaultChecked={defaultValues?.is_featured ?? false}
                    className="size-4 rounded border-input"
                  />
                  Featured spa
                </label>
              </div>
            </Section>
          )}

          <Section
            title="Directory Options"
            description="These existing admin settings stay available alongside the core spa table fields."
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="day_pass_offered">Day Pass Offered?</Label>
              <select
                id="day_pass_offered"
                name="day_pass_offered"
                defaultValue={defaultValues?.day_pass_offered ? "yes" : "no"}
                className="flex h-11 w-full rounded-2xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="day_pass_price">Day Pass Price</Label>
              <Input
                id="day_pass_price"
                name="day_pass_price"
                defaultValue={defaultValues?.day_pass_price ?? ""}
                placeholder="$45"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <Label htmlFor="listing_categories">Listing Categories</Label>
              <p className="text-sm text-muted-foreground">
                Choose one or more categories for this listing.
              </p>
              <div
                id="listing_categories"
                className="grid gap-3 rounded-3xl border border-border bg-background/80 p-4 sm:grid-cols-2"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <label
                    key={category}
                    className="flex items-center gap-3 rounded-2xl bg-secondary/30 px-3 py-3 text-sm font-medium"
                  >
                    <input
                      type="checkbox"
                      name="listing_categories"
                      value={category}
                      defaultChecked={selectedCategories.has(category)}
                      className="size-4 rounded border-input"
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>
          </Section>

          <section className="grid gap-4 rounded-3xl border border-border bg-secondary/20 p-5 md:col-span-2">
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Amenities</h3>
              <p className="text-sm text-muted-foreground">
                Amenities are grouped for display automatically on the public listing.
              </p>
            </div>
            <div id="amenities" className="grid gap-4">
              {AMENITY_CATEGORIES.map((category) => (
                <div
                  key={category.title}
                  className="rounded-3xl border border-border bg-background/80 p-4"
                >
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-foreground">{category.title}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {category.items.map((amenity) => (
                      <label
                        key={amenity.label}
                        className="flex items-center gap-3 rounded-2xl bg-secondary/30 px-3 py-3 text-sm font-medium"
                      >
                        <input
                          type="checkbox"
                          name="amenities"
                          value={amenity.label}
                          defaultChecked={selectedAmenities.has(amenity.label)}
                          className="size-4 rounded border-input"
                        />
                        <span className={amenity.italic ? "italic" : undefined}>
                          {amenity.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center gap-4 md:col-span-2">
            <Button type="submit">{submitLabel}</Button>
            {saveStatus === "saving" && (
              <span className="text-sm text-muted-foreground">Saving…</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-sm text-green-600">Saved ✓</span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
