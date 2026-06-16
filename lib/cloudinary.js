// Cloudinary server helpers: signed upload params + admin delete.
import 'server-only';
import { v2 as cloudinary } from 'cloudinary';

let configured = false;
function configure() {
  if (configured) return;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  configured = true;
}

/**
 * Build a signed-upload payload the browser posts directly to Cloudinary.
 * The API secret never leaves the server — only the signature does.
 */
export function signUpload({ folder, resourceType = 'auto', coupleId } = {}) {
  configure();
  const timestamp = Math.round(Date.now() / 1000);
  const targetFolder = `${process.env.CLOUDINARY_UPLOAD_FOLDER || 'couplespace'}/${coupleId || 'shared'}${folder ? `/${folder}` : ''}`;

  const paramsToSign = { timestamp, folder: targetFolder };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    folder: targetFolder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
  };
}

export async function deleteAsset(publicId, resourceType = 'image') {
  configure();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return true;
  } catch (e) {
    console.error('[cloudinary] delete failed', e?.message);
    return false;
  }
}

export { cloudinary };
