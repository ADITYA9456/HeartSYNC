import Image from 'next/image';
import Link from 'next/link';

const Logo = ({ type, altText, width, height, className }) => {
  let src;
  let defaultWidth = width;
  let defaultHeight = height;

  switch (type) {
    case 'header':
      src = '/logos/logo-horizontal.svg';
      defaultWidth = defaultWidth || 150;
      defaultHeight = defaultHeight || 50;
      break;
    case 'footer':
      src = '/logos/logo-footer.svg';
      defaultWidth = defaultWidth || 210;
      defaultHeight = defaultHeight || 100;
      break;
    case 'favicon':
    case 'pwa-192':
    case 'pwa-512':
    case 'apple-touch':
      src = '/logos/logo-mark.svg';
      defaultWidth = defaultWidth || 192; // Placeholder, PWA will use PNG
      defaultHeight = defaultHeight || 192; // Placeholder, PWA will use PNG
      break;
    default:
      src = '/logos/logo-horizontal.svg'; // Default to horizontal
      defaultWidth = defaultWidth || 150;
      defaultHeight = defaultHeight || 50;
  }

  return (
    <Link href="/">
      <Image
        src={src}
        alt={altText || "CoupleSpace"}
        width={defaultWidth}
        height={defaultHeight}
        className={className}
        priority={type === 'header'}
      />
    </Link>
  );
};

export default Logo;