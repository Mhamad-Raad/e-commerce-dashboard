import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  DollarSign,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { reportsApi } from '@/features/reports/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/lib/format';

export function Overview() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const summary = useQuery({ queryKey: ['reports', 'summary'], queryFn: reportsApi.summary });

  const stats: { label: string; value: string; icon: LucideIcon }[] = [
    {
      label: t('reports.revenue'),
      value: summary.data ? formatMoney(summary.data.revenueCents) : '—',
      icon: DollarSign,
    },
    {
      label: t('reports.orders'),
      value: summary.data ? String(summary.data.orderCount) : '—',
      icon: ClipboardList,
    },
    {
      label: t('reports.aov'),
      value: summary.data ? formatMoney(summary.data.aovCents) : '—',
      icon: BarChart3,
    },
    {
      label: t('reports.active_customers'),
      value: summary.data ? String(summary.data.customerCount) : '—',
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t('overview.subtitle')}, ${user?.name ?? user?.email ?? ''}`}
        description={t('overview.title')}
        action={
          <Button asChild variant="outline">
            <Link to="/reports">
              <BarChart3 className="h-4 w-4" />
              {t('reports.title')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="mt-2 text-2xl font-semibold">
                  {summary.isLoading ? <Skeleton className="h-7 w-20" /> : value}
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
