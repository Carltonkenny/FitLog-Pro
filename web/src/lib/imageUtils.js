const MAX_SIDE = 1024;
const QUALITY = 0.8;

/** Allowed upload types. HEIC is not decodable by most browsers, so it is rejected up front. */
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Reads an image File, scales it so the longest side is at most 1024px and re-encodes it as JPEG.
 * Re-encoding also strips EXIF metadata such as GPS location. Resolves with { mimeType, data, preview }
 * where `data` is base64 without the data-URL prefix.
 */
export async function prepareImage(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new Error('Use a JPEG, PNG or WebP photo.');
  if (file.size > 15_000_000) throw new Error('That photo is too large. Choose one under 15 MB.');

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error('That photo could not be opened. Try a different one.');
  });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();

  const preview = canvas.toDataURL('image/jpeg', QUALITY);
  return { mimeType: 'image/jpeg', data: preview.split(',')[1], preview };
}
