import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { PageIntro } from "@/components/layout/page-intro";
import { SpaEditorForm } from "@/components/admin/spa-editor-form";
import { SpaImageManager } from "@/components/admin/spa-image-manager";
import { verifyOwnerAccess } from "@/lib/owner-auth";
import { getAdminSpaById } from "@/lib/admin-spas";
import {
  uploadSpaLogoAction,
  uploadSpaGalleryImagesAction,
  setFeaturedSpaImageAction,
  reorderSpaImageAction,
  deleteSpaImageAction,
} from "@/app/(admin)/admin/spas/actions";
import { updateOwnerSpaAction } from "@/app/(owner)/actions";
import { listSpaImagesBySpaId } from "@/lib/spa-images";
import { ChevronLeft } from "lucide-react";

type Props = {
  params: Promise<{ "spa-id": string }>;
};

export const metadata = {
  title: "Edit Spa | Owner Dashboard",
};

export default async function OwnerEditSpaPage({ params }: Props) {
  const { "spa-id": spaId } = await params;

  // Verify owner access
  await verifyOwnerAccess(spaId);

  // Fetch spa data
  const spa = await getAdminSpaById(spaId);
  if (!spa) {
    notFound();
  }

  // Fetch images
  const images = await listSpaImagesBySpaId(spaId);

  return (
    <Container className="py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Link
          href={"/owner/dashboard" as Route}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-6"
        >
          <ChevronLeft className="size-4" />
          Back to dashboard
        </Link>

        <PageIntro
          eyebrow="Edit Spa"
          title={spa.name}
          description="Update your spa listing information"
        />

        {/* Image Manager */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Images</h2>
          <SpaImageManager
            images={images}
            logoAction={uploadSpaLogoAction.bind(null, spaId, spa.slug)}
            galleryAction={uploadSpaGalleryImagesAction.bind(null, spaId, spa.slug)}
            setFeaturedAction={setFeaturedSpaImageAction.bind(null, spaId, spa.slug)}
            reorderImageAction={reorderSpaImageAction.bind(null, spaId, spa.slug)}
            deleteImageAction={deleteSpaImageAction.bind(null, spaId, spa.slug)}
          />
        </div>

        {/* Edit Form */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Spa Information</h2>
          <SpaEditorForm
            formAction={updateOwnerSpaAction.bind(null, spaId)}
            submitLabel="Save changes"
            hideAdminFields
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
      </div>
    </Container>
  );
}
