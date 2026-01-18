export type CloudinaryUnsignedUploadResult = {
  public_id: string;
  secure_url: string;
  bytes?: number;
  resource_type?: string;
  format?: string;
  width?: number;
  height?: number;
};

export const getCloudinaryCloudNameFromUrl = (cloudinaryUrl: string | undefined): string | null => {
  if (!cloudinaryUrl) return null;
  // Expect: cloudinary://<api_key>:<api_secret>@<cloud_name>
  const at = cloudinaryUrl.lastIndexOf('@');
  if (at === -1) return null;
  const cloud = cloudinaryUrl.slice(at + 1).trim();
  return cloud || null;
};

export const buildOptimizedDeliveryUrl = (params: {
  cloudName: string;
  publicId: string;
  width?: number;
}): string => {
  const w = params.width ?? 1000;
  const transformation = `w_${w}/q_auto/f_auto`;
  return `https://res.cloudinary.com/${params.cloudName}/image/upload/${transformation}/${params.publicId}`;
};

export const uploadToCloudinaryUnsigned = async (params: {
  file: File;
  cloudName: string;
  uploadPreset: string;
  folder?: string;
}): Promise<CloudinaryUnsignedUploadResult> => {
  const form = new FormData();
  form.append('file', params.file);
  form.append('upload_preset', params.uploadPreset);
  if (params.folder) form.append('folder', params.folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Cloudinary upload failed (${res.status}): ${text || res.statusText}`);
  }

  return (await res.json()) as CloudinaryUnsignedUploadResult;
};
