import Image from "next/image";
import { Package } from "lucide-react";

type Props = {
  src?: string | null;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  /** Tailwind size for the fallback icon, e.g. "h-8 w-8". Defaults to "h-1/3 w-1/3". */
  iconClassName?: string;
};

export default function ProductImage({
  src,
  alt,
  sizes,
  priority,
  className = "object-cover",
  iconClassName = "h-1/3 w-1/3",
}: Props) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${alt} (no image)`}
      className="absolute inset-0 grid place-items-center bg-cream text-ink/25"
    >
      <Package
        className={iconClassName}
        strokeWidth={1.2}
        aria-hidden
      />
    </div>
  );
}
