import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const SPA_IMAGE_BUCKET = "spa-images";
export const MAX_GALLERY_IMAGE_COUNT = 5;
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const ALLOWED_IMAGE_MIME_TYPES = [...ALLOWED_IMAGE_TYPES];

export type SpaImageKind = "logo" | "gallery";

export type SpaImage = {
  id: string;
  spa_id: string;
  kind: SpaImageKind;
  storage_path: string;
  file_name: string;
  content_type: string | null;
  size_bytes: number | null;
  sort_order: number;
  public_url: string;
  created_at: string | null;
};

type SpaImageRow = {
  id: string;
  spa_id: string;
  kind: SpaImageKind;
  storage_path: string;
  file_name: string;
  content_type: string | null;
  size_bytes: number | null;
  sort_order: number | null;
  created_at: string | null;
};

function isMissingSchemaError(message: string) {
  return (
    message.includes("spa_images") ||
    message.includes("storage_path") ||
    message.includes("relation") ||
    message.includes("does not exist")
  );
}

function sanitizeBaseName(fileName: string) {
  const normalized = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "image";
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

function ensureValidImage(file: File) {
  if (file.size <= 0) {
    throw new Error("Please choose an image file before uploading.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or AVIF image.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Each image must be 8 MB or smaller.");
  }
}

async function ensureSpaImageBucketExists() {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.createBucket(SPA_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
    allowedMimeTypes: ALLOWED_IMAGE_MIME_TYPES,
  });

  if (
    error &&
    !error.message.toLowerCase().includes("already exists") &&
    !error.message.toLowerCase().includes("duplicate")
  ) {
    throw new Error(`Failed to prepare image uploads: ${error.message}`);
  }
}

function toSpaImage(row: SpaImageRow): SpaImage {
  const supabase = createSupabaseAdminClient();
  const { data } = supabase.storage.from(SPA_IMAGE_BUCKET).getPublicUrl(row.storage_path);

  return {
    id: row.id,
    spa_id: row.spa_id,
    kind: row.kind,
    storage_path: row.storage_path,
    file_name: row.file_name,
    content_type: row.content_type,
    size_bytes: row.size_bytes,
    sort_order: row.sort_order ?? 0,
    public_url: data.publicUrl,
    created_at: row.created_at,
  };
}

function sortSpaImages(images: SpaImage[]) {
  return [...images].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind === "logo" ? -1 : 1;
    }

    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }

    return left.file_name.localeCompare(right.file_name);
  });
}

/**
 * Returns a map of spa_id → public URL of the first gallery image for each
 * of the given spa IDs. Spas with no gallery images are omitted from the map.
 * Used to show cover images on featured spa cards.
 */
export async function getFirstGalleryImageUrls(
  spaIds: string[]
): Promise<Map<string, string>> {
  if (spaIds.length === 0) return new Map();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_images")
    .select("spa_id, storage_path, sort_order")
    .in("spa_id", spaIds)
    .eq("kind", "gallery")
    .order("sort_order", { ascending: true });

  if (error) return new Map();

  // Keep only the first (lowest sort_order) image per spa
  const result = new Map<string, string>();
  for (const row of data ?? []) {
    const id = String(row.spa_id);
    if (!result.has(id)) {
      const { data: urlData } = supabase.storage
        .from(SPA_IMAGE_BUCKET)
        .getPublicUrl(String(row.storage_path));
      result.set(id, urlData.publicUrl);
    }
  }
  return result;
}

/**
 * Returns the set of spa IDs that have at least one image record.
 * Used for quality score computation across all listings.
 * Fails gracefully if the spa_images table does not yet exist.
 */
export async function getSpaIdsWithImages(): Promise<Set<string>> {
  const supabase = createSupabaseAdminClient();
  try {
    const { data, error } = await supabase
      .from("spa_images")
      .select("spa_id");

    if (error) return new Set();
    return new Set((data ?? []).map((row) => String(row.spa_id)));
  } catch {
    return new Set();
  }
}

export async function listSpaImagesBySpaId(spaId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_images")
    .select(
      "id, spa_id, kind, storage_path, file_name, content_type, size_bytes, sort_order, created_at"
    )
    .eq("spa_id", spaId);

  if (error) {
    if (isMissingSchemaError(error.message)) {
      return [] as SpaImage[];
    }

    throw new Error(`Failed to load spa images: ${error.message}`);
  }

  return sortSpaImages((data ?? []).map((row) => toSpaImage(row as SpaImageRow)));
}

async function removeStorageObject(storagePath: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.storage.from(SPA_IMAGE_BUCKET).remove([storagePath]);

  if (error) {
    throw new Error(`Failed to remove image file: ${error.message}`);
  }
}

async function createImageRecord(input: {
  spaId: string;
  kind: SpaImageKind;
  storagePath: string;
  file: File;
  sortOrder: number;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("spa_images")
    .insert({
      spa_id: input.spaId,
      kind: input.kind,
      storage_path: input.storagePath,
      file_name: input.file.name,
      content_type: input.file.type,
      size_bytes: input.file.size,
      sort_order: input.sortOrder,
    })
    .select(
      "id, spa_id, kind, storage_path, file_name, content_type, size_bytes, sort_order, created_at"
    )
    .single();

  if (error) {
    await removeStorageObject(input.storagePath);
    throw new Error(`Failed to save image metadata: ${error.message}`);
  }

  return toSpaImage(data as SpaImageRow);
}

async function uploadFileToStorage(spaId: string, kind: SpaImageKind, file: File) {
  ensureValidImage(file);
  await ensureSpaImageBucketExists();

  const baseName = sanitizeBaseName(file.name.replace(/\.[^.]+$/, ""));
  const extension = inferExtension(file);
  const storagePath = `${spaId}/${kind}-${Date.now()}-${randomUUID()}-${baseName}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const supabase = createSupabaseAdminClient();

  let { error } = await supabase.storage.from(SPA_IMAGE_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error?.message.toLowerCase().includes("bucket not found")) {
    await ensureSpaImageBucketExists();
    error = (
      await supabase.storage.from(SPA_IMAGE_BUCKET).upload(storagePath, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      })
    ).error;
  }

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return storagePath;
}

export async function uploadSpaLogo(spaId: string, file: File) {
  ensureValidImage(file);

  const existingImages = await listSpaImagesBySpaId(spaId);
  const existingLogo = existingImages.find((image) => image.kind === "logo");

  if (existingLogo) {
    await removeStorageObject(existingLogo.storage_path);

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("spa_images").delete().eq("id", existingLogo.id);

    if (error) {
      throw new Error(`Failed to replace logo: ${error.message}`);
    }
  }

  const storagePath = await uploadFileToStorage(spaId, "logo", file);
  return createImageRecord({
    spaId,
    kind: "logo",
    storagePath,
    file,
    sortOrder: 0,
  });
}

export async function uploadSpaGalleryImages(spaId: string, files: File[]) {
  const validFiles = files.filter((file) => file.size > 0);

  if (validFiles.length === 0) {
    throw new Error("Please choose at least one gallery image.");
  }

  const existingImages = await listSpaImagesBySpaId(spaId);
  const existingGallery = existingImages.filter((image) => image.kind === "gallery");
  const remainingSlots = MAX_GALLERY_IMAGE_COUNT - existingGallery.length;

  if (remainingSlots <= 0) {
    throw new Error("This listing already has 5 business photos.");
  }

  if (validFiles.length > remainingSlots) {
    throw new Error(`You can upload ${remainingSlots} more business photo(s).`);
  }

  const createdImages: SpaImage[] = [];

  for (const [index, file] of validFiles.entries()) {
    const sortOrder = existingGallery.length + index;
    const storagePath = await uploadFileToStorage(spaId, "gallery", file);
    const image = await createImageRecord({
      spaId,
      kind: "gallery",
      storagePath,
      file,
      sortOrder,
    });

    createdImages.push(image);
  }

  return createdImages;
}

export async function setFeaturedSpaImage(spaId: string, imageId: string) {
  const images = await listSpaImagesBySpaId(spaId);
  const galleryImages = images.filter((image) => image.kind === "gallery");
  const selectedImage = galleryImages.find((image) => image.id === imageId);

  if (!selectedImage) {
    throw new Error("Could not find that gallery image.");
  }

  const reordered = [
    selectedImage,
    ...galleryImages.filter((image) => image.id !== imageId),
  ];

  await persistGalleryOrder(spaId, reordered, "Failed to update featured image");
}

async function resequenceGalleryImages(spaId: string) {
  const images = await listSpaImagesBySpaId(spaId);
  const galleryImages = images.filter((image) => image.kind === "gallery");

  await persistGalleryOrder(spaId, galleryImages, "Failed to update image order");
}

export async function deleteSpaImage(spaId: string, imageId: string) {
  const supabase = createSupabaseAdminClient();
  const images = await listSpaImagesBySpaId(spaId);
  const image = images.find((item) => item.id === imageId);

  if (!image) {
    throw new Error("Could not find that image.");
  }

  await removeStorageObject(image.storage_path);

  const { error } = await supabase
    .from("spa_images")
    .delete()
    .eq("id", image.id)
    .eq("spa_id", spaId);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  if (image.kind === "gallery") {
    await resequenceGalleryImages(spaId);
  }
}

export async function deleteSpaImagesForSpa(spaId: string) {
  const supabase = createSupabaseAdminClient();
  const images = await listSpaImagesBySpaId(spaId);
  const storagePaths = images.map((image) => image.storage_path);

  if (storagePaths.length > 0) {
    const { error } = await supabase.storage
      .from(SPA_IMAGE_BUCKET)
      .remove(storagePaths);

    if (error) {
      throw new Error(`Failed to remove spa images: ${error.message}`);
    }
  }

  const { error } = await supabase.from("spa_images").delete().eq("spa_id", spaId);

  if (error && !isMissingSchemaError(error.message)) {
    throw new Error(`Failed to delete spa image records: ${error.message}`);
  }
}

export async function reorderSpaImage(
  spaId: string,
  draggedImageId: string,
  targetImageId: string
) {
  const images = await listSpaImagesBySpaId(spaId);
  const galleryImages = images.filter((image) => image.kind === "gallery");
  const currentIndex = galleryImages.findIndex((image) => image.id === draggedImageId);
  const targetIndex = galleryImages.findIndex((image) => image.id === targetImageId);

  if (currentIndex === -1 || targetIndex === -1) {
    throw new Error("Could not find that gallery image.");
  }

  if (currentIndex === targetIndex) {
    return;
  }

  const reordered = [...galleryImages];
  const [movedImage] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, movedImage);

  await persistGalleryOrder(spaId, reordered, "Failed to move image");
}

async function persistGalleryOrder(
  spaId: string,
  orderedImages: SpaImage[],
  errorPrefix: string
) {
  const supabase = createSupabaseAdminClient();

  for (const [index, image] of orderedImages.entries()) {
    const { error } = await supabase
      .from("spa_images")
      .update({ sort_order: index + orderedImages.length + 100 })
      .eq("id", image.id)
      .eq("spa_id", spaId);

    if (error) {
      throw new Error(`${errorPrefix}: ${error.message}`);
    }
  }

  for (const [index, image] of orderedImages.entries()) {
    const { error } = await supabase
      .from("spa_images")
      .update({ sort_order: index })
      .eq("id", image.id)
      .eq("spa_id", spaId);

    if (error) {
      throw new Error(`${errorPrefix}: ${error.message}`);
    }
  }
}
