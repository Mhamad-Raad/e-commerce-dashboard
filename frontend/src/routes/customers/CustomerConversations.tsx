import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { assistantApi } from '@/features/assistant/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDate, extractErrorMessage } from '@/lib/format';

/** Read-only admin view of a customer's AI assistant chat history. */
export function CustomerConversations({ customerId }: { customerId: string }) {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ['assistant-conversations', customerId],
    queryFn: () => assistantApi.listConversations(customerId),
  });

  const detailQuery = useQuery({
    queryKey: ['assistant-conversation', openId],
    queryFn: () => assistantApi.getConversation(openId!),
    enabled: !!openId,
  });

  const conversations = listQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('assistant.conversations')}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {listQuery.isError ? (
          <p className="text-sm text-destructive">{extractErrorMessage(listQuery.error)}</p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('assistant.no_conversations')}</p>
        ) : (
          <ul className="divide-y">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(c.id)}
                  className="flex w-full items-center justify-between gap-3 py-2.5 text-start text-sm hover:text-primary"
                >
                  <span className="truncate">{c.title || t('assistant.untitled')}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {t('assistant.message_count', { count: c._count?.messages ?? 0 })} ·{' '}
                    {formatDate(c.updatedAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailQuery.data?.title || t('assistant.conversation')}</DialogTitle>
          </DialogHeader>
          {detailQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : (
            <div className="space-y-2">
              {(detailQuery.data?.messages ?? []).map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'ms-auto bg-primary text-primary-foreground'
                      : 'me-auto bg-muted',
                  )}
                >
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
