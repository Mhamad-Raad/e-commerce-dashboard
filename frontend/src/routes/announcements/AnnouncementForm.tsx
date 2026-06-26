import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { announcementsApi } from '@/features/announcements/api';
import type { AnnouncementAudience } from '@/features/announcements/types';
import type { HomeTargetType, TargetRef } from '@/features/home-layout/types';
import { EntityPicker } from '@/routes/home-layout/EntityPicker';
import { RecipientPicker, type Recipient } from './RecipientPicker';
import { TranslatableInput, emptyTrilingual, type Trilingual } from '@/components/TranslatableInput';
import { ImageUpload } from '@/components/ImageUpload';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/lib/format';

const TARGET_TYPES: HomeTargetType[] = ['NONE', 'PRODUCT', 'CATEGORY', 'STORE', 'BLOG', 'URL'];
const ENTITY_KINDS = ['PRODUCT', 'CATEGORY', 'STORE', 'BLOG'] as const;
type EntityKind = (typeof ENTITY_KINDS)[number];
const isEntityKind = (tt: HomeTargetType): tt is EntityKind =>
  (ENTITY_KINDS as readonly string[]).includes(tt);

interface AnnouncementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Compose + send a customer notification (broadcast or direct), now. */
export function AnnouncementForm({ open, onOpenChange }: AnnouncementFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [audience, setAudience] = useState<AnnouncementAudience>('ALL');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [title, setTitle] = useState<Trilingual>(emptyTrilingual());
  const [body, setBody] = useState<Trilingual>(emptyTrilingual());
  const [imageUrl, setImageUrl] = useState('');
  const [targetType, setTargetType] = useState<HomeTargetType>('NONE');
  const [targetRef, setTargetRef] = useState<TargetRef | null>(null);
  const [url, setUrl] = useState('');
  const [recipientPickerOpen, setRecipientPickerOpen] = useState(false);
  const [entityPickerOpen, setEntityPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAudience('ALL');
    setRecipients([]);
    setTitle(emptyTrilingual());
    setBody(emptyTrilingual());
    setImageUrl('');
    setTargetType('NONE');
    setTargetRef(null);
    setUrl('');
    setError(null);
  };

  const send = useMutation({
    mutationFn: () =>
      announcementsApi.create({
        titleEn: title.en.trim(),
        titleAr: title.ar.trim() || undefined,
        titleCkb: title.ckb.trim() || undefined,
        bodyEn: body.en.trim(),
        bodyAr: body.ar.trim() || undefined,
        bodyCkb: body.ckb.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        targetType,
        targetId: isEntityKind(targetType) ? targetRef?.id : undefined,
        url: targetType === 'URL' ? url.trim() : undefined,
        audience,
        customerIds: audience === 'SINGLE' ? recipients.map((r) => r.id) : undefined,
      }),
    onSuccess: (a) => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success(t('announcements.sent_toast', { count: a.recipientCount }));
      reset();
      onOpenChange(false);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const onSubmit = () => {
    setError(null);
    if (!title.en.trim() || !body.en.trim()) {
      setError(t('announcements.title_body_required'));
      return;
    }
    if (audience === 'SINGLE' && recipients.length === 0) {
      setError(t('announcements.recipient_required'));
      return;
    }
    if (isEntityKind(targetType) && !targetRef) {
      setError(t('announcements.target_required'));
      return;
    }
    if (targetType === 'URL' && !url.trim()) {
      setError(t('announcements.url_required'));
      return;
    }
    send.mutate();
  };

  const onTargetTypeChange = (value: HomeTargetType) => {
    setTargetType(value);
    setTargetRef(null);
    setUrl('');
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) reset();
          onOpenChange(o);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('announcements.compose')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <FormField label={t('announcements.audience')}>
              <Select value={audience} onValueChange={(v) => setAudience(v as AnnouncementAudience)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('announcements.audience_all')}</SelectItem>
                  <SelectItem value="SINGLE">{t('announcements.audience_single')}</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {audience === 'SINGLE' && (
              <FormField label={t('announcements.recipients')}>
                <div className="space-y-2">
                  {recipients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipients.map((r) => (
                        <span
                          key={r.id}
                          className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-sm"
                        >
                          {r.name}
                          <button
                            type="button"
                            onClick={() =>
                              setRecipients((list) => list.filter((x) => x.id !== r.id))
                            }
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={t('common.delete')}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setRecipientPickerOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {t('announcements.add_recipients')}
                  </Button>
                </div>
              </FormField>
            )}

            <TranslatableInput
              label={t('announcements.title_field')}
              required
              value={title}
              onChange={setTitle}
            />
            <TranslatableInput
              label={t('announcements.body_field')}
              required
              multiline
              value={body}
              onChange={setBody}
            />

            <FormField label={t('announcements.image')}>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                folder="notifications"
                aspect="wide"
              />
            </FormField>

            <FormField label={t('announcements.target')} hint={t('announcements.target_hint')}>
              <Select value={targetType} onValueChange={(v) => onTargetTypeChange(v as HomeTargetType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TYPES.map((tt) => (
                    <SelectItem key={tt} value={tt}>
                      {t(`announcements.target_${tt.toLowerCase()}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            {isEntityKind(targetType) && (
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => setEntityPickerOpen(true)}
              >
                {targetRef?.name ?? t('announcements.pick_target')}
              </Button>
            )}
            {targetType === 'URL' && (
              <Input
                dir="ltr"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
              />
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="button" onClick={onSubmit} disabled={send.isPending}>
                {send.isPending ? t('announcements.sending') : t('announcements.send')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RecipientPicker
        open={recipientPickerOpen}
        onOpenChange={setRecipientPickerOpen}
        onPick={(r) =>
          setRecipients((list) =>
            list.some((x) => x.id === r.id) ? list : [...list, r],
          )
        }
      />
      {isEntityKind(targetType) && (
        <EntityPicker
          kind={targetType}
          open={entityPickerOpen}
          onOpenChange={setEntityPickerOpen}
          onPick={setTargetRef}
        />
      )}
    </>
  );
}
