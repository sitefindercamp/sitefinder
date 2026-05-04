import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const REVIEW_PHOTO_BUCKET = "review-photos";
export const MAX_REVIEW_PHOTO_COUNT = 3;

const MAX_REVIEW_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_REVIEW_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const ALLOWED_REVIEW_PHOTO_MIME_TYPES = [...ALLOWED_REVIEW_PHOTO_TYPES];

export type ReviewStatus = "pending" | "approved" | "rejected" | "hidden";

export type ReviewPhoto = {
  id: string;
  review_id: string;
  user_id: string;
  spa_id: string;
  image_url: string;
  storage_path: string;
  created_at: string | null;
};

export type SpaReview = {
  id: string;
  spa_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
  created_at: string | null;
  updated_at: string | null;
  user_display_name: string;
  user_email: string | null;
  spa_name: string | null;
  photos: ReviewPhoto[];
};

type ReviewRow = {
  id: string;
  spa_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  body: string;
  status: ReviewStatus;
  created_at: string | null;
  updated_at: string | null;
  /** Set for admin-imported reviews that have no linked user account. */
  reviewer_name: string | null;
};

type PhotoRow = {
  id: string;
  review_id: string;
  user_id: string;
  spa_id: string;
  image_url: string;
  storage_path: string;
  created_at: string | null;
};

function isMissingReviewSchemaError(message: string) {
  return (
    message.includes("spa_reviews") ||
    message.includes("spa_review_photos") ||
    message.includes("relation") ||
    message.includes("does not exist") ||
    message.includes("schema cache")
  );
}

function sanitizeBaseName(fileName: string) {
  const normalized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "review-photo";
}

function inferExtension(file: File) {
  const fromType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  } as const;

  const typeExtension = fromType[file.type as keyof typeof fromType];
  if (typeExtension) {
    return typeExtension;
  }

  const parts = file.name.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? "jpg" : "jpg";
}

function ensureValidReviewPhoto(file: File) {
  if (file.size <= 0) {
    throw new Error("Please choose an image file before uploading.");
  }

  if (!ALLOWED_REVIEW_PHOTO_TYPES.has(file.type)) {
    throw new Error("Review photos must be JPG, PNG, WebP, or AVIF images.");
  }

  if (file.size > MAX_REVIEW_PHOTO_SIZE_BYTES) {
    throw new Error("Each review photo must be 8 MB or smaller.");
  }
}

async function ensureReviewPhotoBucketExists() {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.createBucket(REVIEW_PHOTO_BUCKET, {
    public: false,
    fileSizeLimit: MAX_REVIEW_PHOTO_SIZE_BYTES,
    allowedMimeTypes: ALLOWED_REVIEW_PHOTO_MIME_TYPES,
  });

  if (
    error &&
    !error.message.toLowerCase().includes("already exists") &&
    !error.message.toLowerCase().includes("duplicate")
  ) {
    throw new Error(`Failed to prepare review photo uploads: ${error.message}`);
  }
}

async function signedUrlForReviewPhoto(storagePath: string, fallbackUrl?: string | null) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(REVIEW_PHOTO_BUCKET)
    .createSignedUrl(storagePath, 60 * 60);

  if (error || !data?.signedUrl) {
    return fallbackUrl ?? "";
  }

  return data.signedUrl;
}

async function toPhoto(row: PhotoRow): Promise<ReviewPhoto> {
  return {
    id: row.id,
    review_id: row.review_id,
    user_id: row.user_id,
    spa_id: row.spa_id,
    image_url: await signedUrlForReviewPhoto(row.storage_path, row.image_url),
    storage_path: row.storage_path,
    created_at: row.created_at,
  };
}

async function listPhotosByReviewIds(reviewIds: string[]) {
  if (reviewIds.length === 0) {
    return new Map<string, ReviewPhoto[]>();
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_review_photos")
    .select("id, review_id, user_id, spa_id, image_url, storage_path, created_at")
    .in("review_id", reviewIds)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingReviewSchemaError(error.message)) {
      return new Map<string, ReviewPhoto[]>();
    }

    throw new Error(`Failed to load review photos: ${error.message}`);
  }

  const photoMap = new Map<string, ReviewPhoto[]>();
  const photos = await Promise.all(((data ?? []) as PhotoRow[]).map((row) => toPhoto(row)));

  for (const photo of photos) {
    const photos = photoMap.get(photo.review_id) ?? [];
    photos.push(photo);
    photoMap.set(photo.review_id, photos);
  }

  return photoMap;
}

async function getProfilesByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, { email: string | null; display_name: string | null }>();
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("profiles").select("id, email, display_name").in("id", userIds);

  const map = new Map<string, { email: string | null; display_name: string | null }>();
  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    const id = typeof row.id === "string" ? row.id : null;
    if (!id) continue;

    map.set(id, {
      email: typeof row.email === "string" ? row.email : null,
      display_name: typeof row.display_name === "string" ? row.display_name : null,
    });
  }

  return map;
}

async function getSpaNamesByIds(spaIds: string[]) {
  if (spaIds.length === 0) {
    return new Map<string, string>();
  }

  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("spas")
    .select("id, name")
    .in("id", spaIds);

  const map = new Map<string, string>();
  for (const row of (data ?? []) as Array<Record<string, unknown>>) {
    if (typeof row.id === "string" && typeof row.name === "string") {
      map.set(row.id, row.name);
    }
  }

  return map;
}

async function hydrateReviews(rows: ReviewRow[], includeEmails = false) {
  const reviewIds = rows.map((row) => row.id);
  const userIds = [...new Set(rows.map((row) => row.user_id).filter((id): id is string => id !== null))];
  const spaIds = [...new Set(rows.map((row) => row.spa_id))];

  const [photoMap, profileMap, spaNameMap] = await Promise.all([
    listPhotosByReviewIds(reviewIds),
    getProfilesByIds(userIds),
    getSpaNamesByIds(spaIds),
  ]);

  return rows.map((row) => {
    const profile = row.user_id ? profileMap.get(row.user_id) : undefined;
    // Admin-imported reviews store the name directly; fall back to profile or generic
    const displayName =
      row.reviewer_name?.trim() ||
      profile?.display_name ||
      "KSpa Member";

    return {
      ...row,
      user_display_name: displayName,
      user_email: includeEmails ? (profile?.email ?? null) : null,
      spa_name: spaNameMap.get(row.spa_id) ?? null,
      photos: photoMap.get(row.id) ?? [],
    } satisfies SpaReview;
  });
}

export async function listApprovedReviewsBySpaId(spaId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_reviews")
    .select("id, spa_id, user_id, rating, title, body, status, created_at, updated_at, reviewer_name")
    .eq("spa_id", spaId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingReviewSchemaError(error.message)) {
      return [] as SpaReview[];
    }

    throw new Error(`Failed to load reviews: ${error.message}`);
  }

  return hydrateReviews((data ?? []) as ReviewRow[]);
}

export async function getApprovedReviewSummary(spaId: string) {
  const reviews = await listApprovedReviewsBySpaId(spaId);
  const count = reviews.length;
  const average =
    count > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / count
      : 0;

  return { average, count };
}

export async function getUserReviewForSpa(spaId: string, userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_reviews")
    .select("id, spa_id, user_id, rating, title, body, status, created_at, updated_at, reviewer_name")
    .eq("spa_id", spaId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingReviewSchemaError(error.message)) {
      return null;
    }

    throw new Error(`Failed to load your review: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [review] = await hydrateReviews([data as ReviewRow]);
  return review ?? null;
}

export async function userOwnsSpa(spaId: string, email: string | null | undefined) {
  if (!email) {
    return false;
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_owners")
    .select("id")
    .eq("spa_id", spaId)
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

async function uploadReviewPhoto(input: {
  spaId: string;
  reviewId: string;
  userId: string;
  file: File;
}) {
  ensureValidReviewPhoto(input.file);
  await ensureReviewPhotoBucketExists();

  const baseName = sanitizeBaseName(input.file.name.replace(/\.[^.]+$/, ""));
  const extension = inferExtension(input.file);
  const storagePath = `${input.spaId}/${input.reviewId}/${input.userId}-${Date.now()}-${randomUUID()}-${baseName}.${extension}`;
  const buffer = Buffer.from(await input.file.arrayBuffer());
  const supabase = createSupabaseAdminClient();

  let { error } = await supabase.storage
    .from(REVIEW_PHOTO_BUCKET)
    .upload(storagePath, buffer, {
      contentType: input.file.type,
      cacheControl: "31536000",
      upsert: false,
    });

  if (error?.message.toLowerCase().includes("bucket not found")) {
    await ensureReviewPhotoBucketExists();
    error = (
      await supabase.storage.from(REVIEW_PHOTO_BUCKET).upload(storagePath, buffer, {
        contentType: input.file.type,
        cacheControl: "31536000",
        upsert: false,
      })
    ).error;
  }

  if (error) {
    throw new Error(`Failed to upload review photo: ${error.message}`);
  }

  return {
    storagePath,
    imageUrl: await signedUrlForReviewPhoto(storagePath),
  };
}

export async function upsertSpaReview(input: {
  spaId: string;
  userId: string;
  rating: number;
  title?: string | null;
  body: string;
  photos: File[];
}) {
  const supabase = createSupabaseAdminClient();
  const validPhotos = input.photos.filter((file) => file.size > 0);

  if (validPhotos.length > MAX_REVIEW_PHOTO_COUNT) {
    throw new Error("Reviews can include up to 3 photos.");
  }

  for (const file of validPhotos) {
    ensureValidReviewPhoto(file);
  }

  const { data: existingReview, error: existingError } = await supabase
    .from("spa_reviews")
    .select("id")
    .eq("spa_id", input.spaId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to check your review: ${existingError.message}`);
  }

  const payload = {
    spa_id: input.spaId,
    user_id: input.userId,
    rating: input.rating,
    title: input.title || null,
    body: input.body,
    status: "pending" as ReviewStatus,
  };

  const reviewResult = existingReview
    ? await supabase
        .from("spa_reviews")
        .update(payload)
        .eq("id", String(existingReview.id))
        .select("id")
        .single()
    : await supabase.from("spa_reviews").insert(payload).select("id").single();

  if (reviewResult.error || !reviewResult.data) {
    throw new Error(
      `Failed to save review: ${reviewResult.error?.message ?? "Unknown error"}`
    );
  }

  const reviewId = String(reviewResult.data.id);

  if (validPhotos.length > 0) {
    const { data: currentPhotos, error: photosError } = await supabase
      .from("spa_review_photos")
      .select("id, storage_path")
      .eq("review_id", reviewId);

    if (photosError) {
      throw new Error(`Failed to check review photos: ${photosError.message}`);
    }

    const existingPhotoRows = (currentPhotos ?? []) as Array<Record<string, unknown>>;
    if (existingPhotoRows.length + validPhotos.length > MAX_REVIEW_PHOTO_COUNT) {
      throw new Error("Reviews can include up to 3 photos.");
    }

    for (const file of validPhotos) {
      const uploaded = await uploadReviewPhoto({
        spaId: input.spaId,
        reviewId,
        userId: input.userId,
        file,
      });

      const { error: insertPhotoError } = await supabase
        .from("spa_review_photos")
        .insert({
          review_id: reviewId,
          user_id: input.userId,
          spa_id: input.spaId,
          image_url: uploaded.imageUrl,
          storage_path: uploaded.storagePath,
        });

      if (insertPhotoError) {
        await supabase.storage
          .from(REVIEW_PHOTO_BUCKET)
          .remove([uploaded.storagePath]);
        throw new Error(`Failed to save review photo: ${insertPhotoError.message}`);
      }
    }
  }

  return reviewId;
}

export async function listAdminReviews(status?: ReviewStatus) {
  const supabase = createSupabaseAdminClient();
  const baseQuery = supabase
    .from("spa_reviews")
    .select("id, spa_id, user_id, rating, title, body, status, created_at, updated_at, reviewer_name")
    .order("created_at", { ascending: false });
  const { data, error } = status
    ? await baseQuery.eq("status", status)
    : await baseQuery;

  if (error) {
    if (isMissingReviewSchemaError(error.message)) {
      return [] as SpaReview[];
    }

    throw new Error(`Failed to load admin reviews: ${error.message}`);
  }

  return hydrateReviews((data ?? []) as ReviewRow[], true);
}

export async function countReviewsByStatus(): Promise<Record<ReviewStatus, number>> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_reviews")
    .select("status");

  if (error || !data) return { pending: 0, approved: 0, rejected: 0, hidden: 0 };

  return (data as { status: ReviewStatus }[]).reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0, hidden: 0 } as Record<ReviewStatus, number>
  );
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("spa_reviews")
    .update({ status })
    .eq("id", reviewId);

  if (error) {
    throw new Error(`Failed to update review: ${error.message}`);
  }
}

/**
 * Create a review directly from the admin panel (e.g. imported from an old site).
 * user_id is left null — reviewer_name is used for display instead.
 * The unique constraint (spa_id, user_id) ignores nulls so multiple imports
 * per spa are allowed.
 */
export async function createAdminReview(input: {
  spaId: string;
  reviewerName: string;
  rating: number;
  title?: string | null;
  body: string;
  status: ReviewStatus;
  /** ISO date string — lets you backdate historical reviews. */
  reviewedAt?: string | null;
}): Promise<string> {
  const supabase = createSupabaseAdminClient();

  const payload: Record<string, unknown> = {
    spa_id: input.spaId,
    user_id: null,
    reviewer_name: input.reviewerName.trim(),
    rating: input.rating,
    title: input.title?.trim() || null,
    body: input.body.trim(),
    status: input.status,
  };

  if (input.reviewedAt) {
    payload.created_at = new Date(input.reviewedAt).toISOString();
  }

  const { data, error } = await supabase
    .from("spa_reviews")
    .insert(payload)
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create review: ${error?.message ?? "Unknown error"}`);
  }

  return String((data as Record<string, unknown>).id);
}

/** Fetch all reviews submitted by a specific user (admin client). */
export async function listReviewsByUserId(userId: string): Promise<SpaReview[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_reviews")
    .select("id, spa_id, user_id, rating, title, body, status, created_at, updated_at, reviewer_name")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return hydrateReviews((data ?? []) as ReviewRow[], true);
}

/** Count reviews by status for a specific user (admin client). */
export async function countReviewsByUserId(
  userId: string
): Promise<Record<ReviewStatus, number>> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("spa_reviews")
    .select("status")
    .eq("user_id", userId);

  return ((data ?? []) as { status: ReviewStatus }[]).reduce(
    (acc, row) => {
      acc[row.status] = (acc[row.status] ?? 0) + 1;
      return acc;
    },
    { pending: 0, approved: 0, rejected: 0, hidden: 0 } as Record<ReviewStatus, number>
  );
}
