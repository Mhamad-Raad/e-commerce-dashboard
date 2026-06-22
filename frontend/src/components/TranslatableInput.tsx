import { useEffect, useState, type ChangeEvent } from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

/** A content value in the three supported languages. English is canonical. */
export interface Trilingual {
  en: string;
  ar: string;
  ckb: string;
}

export const emptyTrilingual = (): Trilingual => ({ en: '', ar: '', ckb: '' });

interface TranslatableInputProps {
  label: string;
  value: Trilingual;
  onChange: (value: Trilingual) => void;
  multiline?: boolean;
  required?: boolean;
  error?: string;
  placeholder?: string;
}

/**
 * English (main) field always visible + a toggle that reveals the Arabic and
 * Kurdish (Sorani) fields stacked below — mirrors the Akkooo dashboard's
 * multilingual input UX. English is the canonical value; AR/CKB fall back to it
 * (server-side), so only English is required.
 */
export function TranslatableInput({
  label,
  value,
  onChange,
  multiline,
  required,
  error,
  placeholder,
}: TranslatableInputProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(() => Boolean(value.ar || value.ckb));

  // Edit forms populate values via reset() AFTER mount, so auto-reveal the
  // translation fields once a translation exists. (Manually collapsing still
  // sticks — the values don't change, so this won't re-fire.)
  useEffect(() => {
    if (value.ar || value.ckb) setOpen(true);
  }, [value.ar, value.ckb]);

  const field = (key: keyof Trilingual, dir: 'ltr' | 'rtl', ph: string) => {
    const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...value, [key]: e.target.value });
    return multiline ? (
      <Textarea rows={3} dir={dir} value={value[key]} placeholder={ph} onChange={handle} />
    ) : (
      <Input dir={dir} value={value[key]} placeholder={ph} onChange={handle} />
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className={cn(error && 'text-destructive')}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground"
          onClick={() => setOpen((o) => !o)}
        >
          <Languages className="h-3.5 w-3.5" />
          {open ? t('common.hide_translations') : t('common.add_translations')}
        </Button>
      </div>

      {/* English — the main/canonical value */}
      {field('en', 'ltr', placeholder ?? 'English')}

      {open && (
        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">العربية</Label>
            {field('ar', 'rtl', 'العربية')}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">کوردی</Label>
            {field('ckb', 'rtl', 'کوردی')}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
