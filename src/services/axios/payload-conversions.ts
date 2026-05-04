/**
 * Convert a flat object to FormData for multipart uploads.
 * (axios serializes plain objects to JSON automatically, so a JSON
 * conversion helper is not needed.)
 */
export const ConvertObjectToFormData = (data: object): FormData => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    formData.append(key, value as string | Blob);
  }
  return formData;
};
