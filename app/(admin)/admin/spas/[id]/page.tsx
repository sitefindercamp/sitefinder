import {
  autoSaveSpaAction,
  deleteSpaImageAction,
  reorderSpaImageAction,
  setFeaturedSpaImageAction,
  updateSpaAction,
  uploadSpaGalleryImagesAction,
  uploadSpaLogoAction,
} from "@/app/(admin)/admin/spas/actions";
import { notFound } from "next/navigation";

import { QualityBadge } from "@/components/admin/quality-badge";
import { SpaEditorForm } from "@/components/admin/spa-editor-form";
import { SpaImageManager } from "@/components/admin/spa-image-manager";
import { PageIntro } from "@/components/layout/page-intro";
import { getAdminSpaById } from "@/lib/admin-spas";
import { calculateQualityScore, getMissingFields } from "@/lib/quality-score";
import { listSpaImagesBySpaId } from "@/lib/spa-images";

type AdminSpaEditPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
};

export async function generateMetadata({ params }: AdminSpaEditPageProps) {
  const { id } = await params;
  const spa = await getAdminSpaById(id);

  return {
    title: spa ? `Edit ${spa.name}` : "Edit Spa",
  };
}

const FIELD_LABELS: Record<string, string> = {
  website: "Website URL",
  phone: "Phone number",
  address: "Street address (with city + state)",
  hours: "Hours of operation",
  amenities: "At least one amenity",
  images: "At least one photo",
};

export default async function AdminSpaEditPage({
  params,
  searchParams,
}: AdminSpaEditPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const spa = await getAdminSpaById(id);

  if (!spa) {
    notFound();
  }

  const images = await listSpaImagesBySpaId(spa.id);
  const hasImages = images.length > 0;
  const quality = calculateQualityScore(spa, hasImages);
  const missingFields = getMissingFields(quality.breakdown);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageIntro
          eyebrow="Admin"
          title={`Edit ${spa.name}`}
          description="Update this spa listing. Warnings below show missing data — saving is never blocked."
        />
        <QualityBadge quality={quality} className="mt-1 shrink-0" />
      </div>

      {/* ── Missing field warnings ── */}
      {missingFields.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-semibold text-yellow-900">
            Missing information ({missingFields.length} item{missingFields.length !== 1 ? "s" : ""})
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {missingFields.map((field) => (
              <li key={field} className="flex items-center gap-2 text-sm text-yellow-800">
                <span aria-hidden className="text-yellow-500">⚠</span>
                {FIELD_LABELS[field] ?? field}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-yellow-700">
            These warnings are informational only — you can save the listing at any time.
          </p>
        </div>
      )}

      {query?.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {decodeURIComponent(query.error)}
        </div>
      ) : null}

      <SpaImageManager
        logoAction={uploadSpaLogoAction.bind(null, spa.id, spa.slug)}
        galleryAction={uploadSpaGalleryImagesAction.bind(null, spa.id, spa.slug)}
        setFeaturedAction={setFeaturedSpaImageAction.bind(null, spa.id, spa.slug)}
        reorderImageAction={reorderSpaImageAction.bind(null, spa.id, spa.slug)}
        deleteImageAction={deleteSpaImageAction.bind(null, spa.id, spa.slug)}
        images={images}
      />
      <SpaEditorForm
        formAction={updateSpaAction.bind(null, id)}
        autoSaveAction={autoSaveSpaAction.bind(null, id)}
        submitLabel="Save changes"
        defaultValues={{
          name: spa.name,
          slug: spa.slug,
          website: spa.website,
          phone: spa.phone,
          email: spa.email,
          address_line_1: spa.address_line_1,
          address_line_2: spa.address_line_2,
          city: spa.city,
          state: spa.state,
          postal_code: spa.postal_code,
          country: spa.country,
          hours_text: spa.hours_text,
          pricing_text: spa.pricing_text,
          what_to_know: spa.what_to_know,
          important_notes: spa.important_notes,
          google_review_url: spa.google_review_url,
          yelp_review_url: spa.yelp_review_url,
          status: spa.status,
          is_featured: spa.is_featured,
          business_email: spa.business_email,
          business_website: spa.business_website,
          business_phone: spa.business_phone,
          facebook_url: spa.facebook_url,
          instagram_url: spa.instagram_url,
          tiktok_url: spa.tiktok_url,
          twitter_url: spa.twitter_url,
          youtube_url: spa.youtube_url,
          day_pass_offered: spa.day_pass_offered,
          day_pass_price: spa.day_pass_price,
          listing_categories: spa.listing_categories,
          summary: spa.summary,
          description: spa.description ?? "",
          amenities: spa.amenities,
        }}
      />
    </div>
  );
}
