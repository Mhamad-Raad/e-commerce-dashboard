import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Trash2 } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { TranslatableInput, emptyTrilingual, type Trilingual } from '@/components/TranslatableInput';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { extractErrorMessage } from '@/lib/format';
import { homeLayoutApi } from '@/features/home-layout/api';
import {
  DEFAULT_TARGET,
  type AdminSection,
  type AdminSectionItem,
  type HomeSectionType,
  type HomeTargetType,
  type ItemPayload,
  type TargetRef,
  type UpdateSectionPayload,
} from '@/features/home-layout/types';
import { EntityPicker } from './EntityPicker';
import { SortableRow } from './SortableRow';

interface DraftItem {
  key: string;
  targetType: HomeTargetType;
  entityId?: string;
  url?: string;
  display?: TargetRef;
  imageUrl?: string;
  label: Trilingual;
  subtitle: Trilingual;
  badge: Trilingual;
  ctaLabel: Trilingual;
}

const tri = (en?: string | null, ar?: string | null, ckb?: string | null): Trilingual => ({
  en: en ?? '',
  ar: ar ?? '',
  ckb: ckb ?? '',
});
const orUndef = (v: string) => (v.trim() ? v.trim() : undefined);

function toDraft(item: AdminSectionItem): DraftItem {
  return {
    key: item.id,
    targetType: item.targetType,
    entityId: item.productId ?? item.categoryId ?? item.storeId ?? item.blogPostId ?? undefined,
    url: item.url,
    display: item.product ?? item.category ?? item.store ?? item.blogPost,
    imageUrl: item.imageUrl ?? undefined,
    label: tri(item.label, item.labelAr, item.labelCkb),
    subtitle: tri(item.subtitle, item.subtitleAr, item.subtitleCkb),
    badge: tri(item.badge, item.badgeAr, item.badgeCkb),
    ctaLabel: tri(item.ctaLabel, item.ctaLabelAr, item.ctaLabelCkb),
  };
}

function toPayload(it: DraftItem, position: number): ItemPayload {
  return {
    position,
    targetType: it.targetType,
    productId: it.targetType === 'PRODUCT' ? it.entityId : undefined,
    categoryId: it.targetType === 'CATEGORY' ? it.entityId : undefined,
    storeId: it.targetType === 'STORE' ? it.entityId : undefined,
    blogPostId: it.targetType === 'BLOG' ? it.entityId : undefined,
    url: it.targetType === 'URL' ? orUndef(it.url ?? '') : undefined,
    imageUrl: orUndef(it.imageUrl ?? ''),
    label: orUndef(it.label.en),
    labelAr: orUndef(it.label.ar),
    labelCkb: orUndef(it.label.ckb),
    subtitle: orUndef(it.subtitle.en),
    subtitleAr: orUndef(it.subtitle.ar),
    subtitleCkb: orUndef(it.subtitle.ckb),
    badge: orUndef(it.badge.en),
    badgeAr: orUndef(it.badge.ar),
    badgeCkb: orUndef(it.badge.ckb),
    ctaLabel: orUndef(it.ctaLabel.en),
    ctaLabelAr: orUndef(it.ctaLabel.ar),
    ctaLabelCkb: orUndef(it.ctaLabel.ckb),
  };
}

interface SectionEditorDialogProps {
  section: AdminSection;
  onOpenChange: (open: boolean) => void;
}

export function SectionEditorDialog({ section, onOpenChange }: SectionEditorDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState<Trilingual>(
    tri(section.titleEn, section.titleAr, section.titleCkb),
  );
  const [isActive, setIsActive] = useState(section.isActive);
  const [layout, setLayout] = useState((section.config.layout as string) ?? 'slider');
  const [items, setItems] = useState<DraftItem[]>(section.items.map(toDraft));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const save = useMutation({
    mutationFn: () => {
      // Entity items must reference something; URL items must have a url.
      for (const it of items) {
        if (['PRODUCT', 'CATEGORY', 'STORE', 'BLOG'].includes(it.targetType) && !it.entityId) {
          throw new Error(t('home_builder.item_target_required'));
        }
      }
      const payload: UpdateSectionPayload = {
        titleEn: orUndef(title.en),
        titleAr: orUndef(title.ar),
        titleCkb: orUndef(title.ckb),
        isActive,
        config: section.type === 'PRODUCTS' ? { layout } : {},
        items: items.map(toPayload),
      };
      return homeLayoutApi.update(section.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-sections'] });
      toast.success(t('home_builder.saved_toast'));
      onOpenChange(false);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const updateItem = (key: string, patch: Partial<DraftItem>) =>
    setItems((list) => list.map((it) => (it.key === key ? { ...it, ...patch } : it)));

  const addItem = () =>
    setItems((list) => [
      ...list,
      {
        key: crypto.randomUUID(),
        targetType: DEFAULT_TARGET[section.type],
        label: emptyTrilingual(),
        subtitle: emptyTrilingual(),
        badge: emptyTrilingual(),
        ctaLabel: emptyTrilingual(),
      },
    ]);

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setItems((list) => {
        const from = list.findIndex((i) => i.key === active.id);
        const to = list.findIndex((i) => i.key === over.id);
        return arrayMove(list, from, to);
      });
    }
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t('home_builder.edit_section', {
              type: t(`home_builder.type_${section.type.toLowerCase()}`),
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <TranslatableInput
            label={t('home_builder.section_title')}
            value={title}
            onChange={setTitle}
          />

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(v === true)} />
            {t('common.active')}
          </label>

          {section.type === 'PRODUCTS' && (
            <div className="space-y-1.5">
              <Label>{t('home_builder.layout')}</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slider">{t('home_builder.layout_slider')}</SelectItem>
                  <SelectItem value="grid">{t('home_builder.layout_grid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('home_builder.items')}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4" />
                {t('home_builder.add_item')}
              </Button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={items.map((i) => i.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((item) => (
                    <SortableRow key={item.key} id={item.key}>
                      {(handle) => (
                        <ItemEditor
                          item={item}
                          sectionType={section.type}
                          handle={handle}
                          onChange={(patch) => updateItem(item.key, patch)}
                          onRemove={() =>
                            setItems((list) => list.filter((i) => i.key !== item.key))
                          }
                        />
                      )}
                    </SortableRow>
                  ))}
                  {items.length === 0 && (
                    <p className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                      {t('home_builder.no_items')}
                    </p>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── One item row ──────────────────────────────────────────────────────────────
const BANNER_TARGETS: HomeTargetType[] = ['NONE', 'URL', 'PRODUCT', 'CATEGORY', 'STORE', 'BLOG'];

function ItemEditor({
  item,
  sectionType,
  handle,
  onChange,
  onRemove,
}: {
  item: DraftItem;
  sectionType: HomeSectionType;
  handle: React.ReactNode;
  onChange: (patch: Partial<DraftItem>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const isBanner = sectionType === 'BANNER';
  const isProducts = sectionType === 'PRODUCTS';

  // For non-banner sections the target kind is fixed; for banner it's chosen.
  const pickerKind =
    item.targetType === 'PRODUCT' ||
    item.targetType === 'CATEGORY' ||
    item.targetType === 'STORE' ||
    item.targetType === 'BLOG'
      ? item.targetType
      : null;

  return (
    <div className="flex gap-2 rounded-md border p-3">
      <div className="pt-1">{handle}</div>
      <div className="flex-1 space-y-3">
        {isBanner && (
          <ImageUpload
            value={item.imageUrl ?? ''}
            onChange={(url) => onChange({ imageUrl: url })}
            folder="homepage"
            aspect="wide"
          />
        )}

        {/* Target picker (fixed kind for non-banner; chosen for banner) */}
        {isBanner && (
          <div className="space-y-1.5">
            <Label>{t('home_builder.tap_target')}</Label>
            <Select
              value={item.targetType}
              onValueChange={(v) =>
                onChange({ targetType: v as HomeTargetType, entityId: undefined, display: undefined })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BANNER_TARGETS.map((tt) => (
                  <SelectItem key={tt} value={tt}>
                    {t(`home_builder.target_${tt.toLowerCase()}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {item.targetType === 'URL' && (
          <Input
            value={item.url ?? ''}
            onChange={(e) => onChange({ url: e.target.value })}
            placeholder="https://…  /  /category/slug"
          />
        )}

        {pickerKind && (
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            onClick={() => setPickerOpen(true)}
          >
            {item.display?.name ?? t(`home_builder.pick_${pickerKind.toLowerCase()}`)}
          </Button>
        )}

        {isBanner && (
          <>
            <TranslatableInput
              label={t('home_builder.headline')}
              value={item.label}
              onChange={(v) => onChange({ label: v })}
            />
            <TranslatableInput
              label={t('home_builder.subtitle_field')}
              value={item.subtitle}
              onChange={(v) => onChange({ subtitle: v })}
            />
            <TranslatableInput
              label={t('home_builder.badge')}
              value={item.badge}
              onChange={(v) => onChange({ badge: v })}
            />
            <TranslatableInput
              label={t('home_builder.cta')}
              value={item.ctaLabel}
              onChange={(v) => onChange({ ctaLabel: v })}
            />
          </>
        )}

        {isProducts && (
          <TranslatableInput
            label={t('home_builder.badge')}
            value={item.badge}
            onChange={(v) => onChange({ badge: v })}
          />
        )}
      </div>

      <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>

      {pickerKind && (
        <EntityPicker
          kind={pickerKind}
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onPick={(ref) => onChange({ entityId: ref.id, display: ref })}
        />
      )}
    </div>
  );
}
