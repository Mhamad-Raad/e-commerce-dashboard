import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadsApi, type UploadFolder } from '@/features/uploads/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/format';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  /** Aspect of the preview box — square for logos/products, wide for banners. */
  aspect?: 'square' | 'wide';
  disabled?: boolean;
}

/**
 * Drag-and-drop / click image picker that uploads to R2 and writes the returned
 * public URL back into the form field. Keeps a URL-paste fallback so an external
 * link still works.
 */
export function ImageUpload({
  value,
  onChange,
  folder,
  aspect = 'square',
  disabled,
}: ImageUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error(t('upload.invalid_type'));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t('upload.too_large'));
      return;
    }
    setUploading(true);
    try {
      const url = await uploadsApi.upload(file, folder);
      onChange(url);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  const openPicker = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed bg-muted/30 text-muted-foreground transition-colors',
          aspect === 'wide' ? 'aspect-[3/1]' : 'aspect-square max-w-[220px]',
          dragOver && 'border-primary bg-primary/5',
          !disabled && !uploading && 'cursor-pointer hover:border-primary/60',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-contain" />
            {!disabled && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute end-2 top-2 h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                aria-label={t('upload.remove')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 p-4 text-center">
            <ImageIcon className="h-7 w-7" />
            <span className="text-xs">{t('upload.drop_hint')}</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = ''; // allow re-selecting the same file
        }}
        disabled={disabled || uploading}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openPicker}
          disabled={disabled || uploading}
        >
          <Upload className="h-4 w-4" />
          {uploading ? t('upload.uploading') : t('upload.choose')}
        </Button>
      </div>

      {/* Fallback: paste an external image URL directly. */}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('upload.url_placeholder')}
        disabled={disabled || uploading}
      />
    </div>
  );
}
