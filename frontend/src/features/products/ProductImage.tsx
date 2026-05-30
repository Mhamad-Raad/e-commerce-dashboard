import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  src: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}

/** Product image with a graceful placeholder when missing or broken. */
export function ProductImage({ src, alt, className, iconClassName }: ProductImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className,
        )}
      >
        <ImageIcon className={cn('h-4 w-4', iconClassName)} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
