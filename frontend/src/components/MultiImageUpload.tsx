import { useRef, useState, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadsApi, type UploadFolder } from '@/features/uploads/api';
import { cn } from '@/lib/utils';
import { extractErrorMessage } from '@/lib/format';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: UploadFolder;
  max?: number;
  disabled?: boolean;
}

/**
 * Ordered gallery uploader: add several images at once, remove individually, and
 * drag thumbnails to reorder. Uploads to R2 and stores the returned URLs.
 */
export function MultiImageUpload({
  value,
  onChange,
  folder,
  max = 12,
  disabled,
}: MultiImageUploadProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const remaining = max - value.length;
  const canAdd = !disabled && !uploading && remaining > 0;

  const handleFiles = async (files: FileList) => {
    const picked = Array.from(files);
    if (picked.length > remaining) {
      toast.error(t('upload.max_reached', { max }));
    }
    const allowed = picked.slice(0, remaining);
    const valid = allowed.filter((f) => {
      if (!ACCEPTED.includes(f.type)) {
        toast.error(t('upload.invalid_type'));
        return false;
      }
      if (f.size > MAX_BYTES) {
        toast.error(t('upload.too_large'));
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;

    setUploading(true);
    const uploaded: string[] = [];
    try {
      // Sequential keeps memory/CPU sane and preserves selection order.
      for (const file of valid) {
        uploaded.push(await uploadsApi.upload(file, folder));
      }
      onChange([...value, ...uploaded]);
    } catch (err) {
      // Keep whatever already succeeded so a mid-batch failure isn't all-or-nothing.
      if (uploaded.length) onChange([...value, ...uploaded]);
      toast.error(extractErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const onDrop = (e: DragEvent<HTMLDivElement>, target: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === target) return;
    const next = [...value];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(target, 0, moved);
    onChange(next);
    setDragIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            draggable={!disabled}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, i)}
            onDragEnd={() => setDragIndex(null)}
            className={cn(
              'group relative h-24 w-24 overflow-hidden rounded-lg border bg-muted/30',
              !disabled && 'cursor-grab active:cursor-grabbing',
              dragIndex === i && 'opacity-50',
            )}
          >
            <img src={url} alt="" className="h-full w-full object-contain" />
            {!disabled && (
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={t('upload.remove')}
                className="absolute end-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-[11px]">{t('upload.add_images')}</span>
              </>
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('upload.gallery_hint', { count: value.length, max })}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = '';
        }}
        disabled={!canAdd}
      />
    </div>
  );
}
