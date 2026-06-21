import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { LayoutTemplate, Pencil, Plus, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { extractErrorMessage } from '@/lib/format';
import { homeLayoutApi } from '@/features/home-layout/api';
import { SECTION_TYPES, type AdminSection } from '@/features/home-layout/types';
import { HomePreview } from './HomePreview';
import { SectionEditorDialog } from './SectionEditorDialog';
import { SortableRow } from './SortableRow';

export function HomeBuilder() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminSection | null>(null);
  const [toDelete, setToDelete] = useState<AdminSection | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ['home-sections'],
    queryFn: homeLayoutApi.list,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['home-sections'] });
    queryClient.invalidateQueries({ queryKey: ['home-preview'] });
  };

  const reorder = useMutation({
    mutationFn: (ordered: AdminSection[]) =>
      homeLayoutApi.reorder(ordered.map((s, i) => ({ id: s.id, position: i }))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['home-preview'] }),
    onError: (err) => {
      toast.error(extractErrorMessage(err));
      queryClient.invalidateQueries({ queryKey: ['home-sections'] });
    },
  });

  const create = useMutation({
    mutationFn: (type: AdminSection['type']) => homeLayoutApi.create({ type, items: [] }),
    onSuccess: (section) => {
      invalidateAll();
      setEditing(section); // open the editor for the new section
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => homeLayoutApi.remove(id),
    onSuccess: () => {
      invalidateAll();
      toast.success(t('home_builder.deleted_toast'));
      setToDelete(null);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = sections.findIndex((s) => s.id === active.id);
    const to = sections.findIndex((s) => s.id === over.id);
    const ordered = arrayMove(sections, from, to);
    queryClient.setQueryData(['home-sections'], ordered); // optimistic
    reorder.mutate(ordered);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-5">
        <PageHeader
          icon={LayoutTemplate}
          title={t('home_builder.title')}
          description={t('home_builder.subtitle')}
          action={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={create.isPending}>
                  <Plus className="h-4 w-4" />
                  {t('home_builder.add_section')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {SECTION_TYPES.map((type) => (
                  <DropdownMenuItem key={type} onClick={() => create.mutate(type)}>
                    {t(`home_builder.type_${type.toLowerCase()}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : sections.length === 0 ? (
          <EmptyState
            icon={LayoutTemplate}
            title={t('home_builder.empty_title')}
            description={t('home_builder.empty_desc')}
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableRow key={section.id} id={section.id}>
                    {(handle) => (
                      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
                        {handle}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {t(`home_builder.type_${section.type.toLowerCase()}`)}
                            </span>
                            {!section.isActive && (
                              <Badge variant="outline">{t('common.hidden')}</Badge>
                            )}
                          </div>
                          <p className="truncate text-sm text-muted-foreground">
                            {section.titleEn || t('home_builder.no_title')} ·{' '}
                            {t('home_builder.item_count', { count: section.items.length })}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setEditing(section)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setToDelete(section)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </SortableRow>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <HomePreview />

      {editing && (
        <SectionEditorDialog
          section={editing}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={t('home_builder.delete_title')}
        message={t('home_builder.delete_message')}
        busy={remove.isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </div>
  );
}
