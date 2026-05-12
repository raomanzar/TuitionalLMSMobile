/**
 * RN file shape — what `expo-image-picker` results look like once normalized.
 * RN's FormData accepts this object directly and serializes it as a file part.
 */
type RNFile = { uri: string; name: string; type: string };

type FormDataValue = string | number | boolean | Blob | RNFile;

/**
 * Convert a flat object to FormData for multipart uploads.
 * - Strings pass through.
 * - Numbers / booleans are stringified so the backend sees a string field.
 * - RN file objects (`{ uri, name, type }`) and Blobs pass through as file parts.
 * - `null` / `undefined` entries are skipped (lets call sites use optional fields
 *   without manual filtering).
 */
export const ConvertObjectToFormData = (
  data: Record<string, FormDataValue | null | undefined>,
): FormData => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string") {
      formData.append(key, value);
    } else if (typeof value === "number" || typeof value === "boolean") {
      formData.append(key, value.toString());
    } else {
      // Blob or RN file shape — append as a file part. Cast is for the W3C
      // FormData type; RN's runtime accepts the `{ uri, name, type }` shape.
      formData.append(key, value as unknown as Blob);
    }
  }
  return formData;
};
