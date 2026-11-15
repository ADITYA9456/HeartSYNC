import Image from 'next/image';
import Link from 'next/link';

// The brand mark ships as /icons/icon-192.png (the earlier /logos/*.svg files
// were never added to /public, so they returned 404).
const Logo = ({ altText = 'HeartSYNC', size = 36, href = '/', className, priority = false }) => (
  <Link href={href} aria-label={altText} className="inline-flex shrink-0 rounded-xl">
    <Image
      src="/icons/icon-192.png"
      alt=""
      width={size}
      height={size}
      sizes={`${size}px`}
      className={className}
      priority={priority}
    />
  </Link>
);

export default Logo;
