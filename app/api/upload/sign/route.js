import { withCouple, json } from '@/lib/api';
import { signUploadSchema } from '@/lib/validators';
import { signUpload } from '@/lib/cloudinary';

// POST — return signed params so the browser can upload directly to Cloudinary.
export const POST = withCouple(async ({ req, couple }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = signUploadSchema.safeParse(body);
  const { folder, resourceType } = parsed.success ? parsed.data : {};
  const signed = signUpload({ folder, resourceType, coupleId: couple.id });
  return json(signed);
});
