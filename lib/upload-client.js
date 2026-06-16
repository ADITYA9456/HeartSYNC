'use client';
// Client-side direct-to-Cloudinary upload using a server-signed payload.
import imageCompression from 'browser-image-compression';
import { api } from './api-client';

/**
 * Upload a File/Blob to Cloudinary. Images are compressed first.
 * @returns normalized asset { publicId, secureUrl, thumbnailUrl, resourceType, format, width, height, bytes, duration }
 */
export async function uploadToCloudinary(file, { folder, resourceType = 'auto', compress = true } = {}) {
  let toUpload = file;
  const isImage = file.type?.startsWith('image/');
  if (isImage && compress) {
    try {
      toUpload = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 2048,
        useWebWorker: true,
      });
    } catch {
      toUpload = file;
    }
  }

  const sign = await api.post('/api/upload/sign', { folder, resourceType });

  const form = new FormData();
  form.append('file', toUpload);
  form.append('api_key', sign.apiKey);
  form.append('timestamp', String(sign.timestamp));
  form.append('signature', sign.signature);
  form.append('folder', sign.folder);

  const res = await fetch(sign.uploadUrl, { method: 'POST', body: form });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${detail.slice(0, 120)}`);
  }
  const data = await res.json();

  const thumb = data.secure_url?.replace('/upload/', '/upload/w_400,c_limit,q_auto,f_auto/');
  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    thumbnailUrl: data.resource_type === 'image' ? thumb : null,
    resourceType: data.resource_type,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    duration: data.duration,
  };
}
