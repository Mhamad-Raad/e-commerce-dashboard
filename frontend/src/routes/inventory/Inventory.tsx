import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Boxes, PackagePlus, TriangleAlert } from 'lucide-react';
import { inventoryApi } from '@/features/inventory/api';
import type { LowStockRow, StockMovement, StockMovementReason } from '@/features/inventory/types';
import { ProductImage } from '@/features/products/ProductImage';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { TablePagination } from '@/components/TablePagination';
import { DataTable, type Column } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { StockDialog, type StockTarget } from './StockDialog';

const reasonTone: Record<StockMovementReason, 'green' | 'amber' | 'slate' | 'blue' | 'red'> = {
  ORDER: 'slate',
  ORDER_CANCELLED: 'blue',
  RESTOCK: 'green',
  ADJUSTMENT: 'amber',
};

export function Inventory() {
  const { t } = useTranslation();
  const [target, setTarget] = useState<StockTarget | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const lowStock = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => inventoryApi.lowStock(),
  });

  const movements = useQuery({
    queryKey: ['inventory', 'movements', { page, limit }],
    queryFn: () => inventoryApi.movements({ page, pageSize: limit }),
    placeholderData: keepPreviousData,
  });

  const openFor = (row: LowStockRow) => {
    setTarget({
      productId: row.productId,
      variantId: row.variantId,
      label: row.variantName ? `${row.productName} (${row.variantName})` : row.productName,
      stock: row.stock,
    });
    setDialogOpen(true);
  };

  const lowStockColumns: Column<LowStockRow>[] = [
    {
      key: 'image',
      header: '',
      className: 'w-14',
      cell: (r) => <ProductImage src={r.imageUrl} alt={r.productName} className="h-10 w-10 rounded-md" />,
    },
    {
      key: 'name',
      header: t('inventory.item'),
      cell: (r) => (
        <Link to={`/products/${r.productId}`} className="font-medium hover:underline">
          {r.productName}
          {r.variantName && <span className="text-muted-foreground"> · {r.variantName}</span>}
        </Link>
      ),
    },
    { key: 'sku', header: t('products.sku'), cell: (r) => <span className="font-mono text-xs text-muted-foreground">{r.sku}</span> },
    {
      key: 'stock',
      header: t('inventory.stock'),
      cell: (r) => (
        <StatusBadge
          label={r.stock <= 0 ? t('inventory.out_of_stock') : String(r.stock)}
          tone={r.stock <= 0 ? 'red' : 'amber'}
        />
      ),
    },
    { key: 'threshold', header: t('inventory.threshold'), cell: (r) => <span className="text-muted-foreground">{r.lowStockThreshold}</span> },
    {
      key: 'actions',
      header: t('common.actions'),
      align: 'end',
      cell: (r) => (
        <Button size="sm" variant="outline" onClick={() => openFor(r)}>
          <PackagePlus className="h-4 w-4" />
          {t('inventory.restock')}
        </Button>
      ),
    },
  ];

  const movementColumns: Column<StockMovement>[] = [
    { key: 'date', header: t('common.created'), cell: (m) => <span className="text-muted-foreground whitespace-nowrap">{formatDate(m.createdAt)}</span> },
    {
      key: 'item',
      header: t('inventory.item'),
      cell: (m) =>
        m.product ? (
          <Link to={`/products/${m.product.id}`} className="hover:underline">
            {m.product.name}
            {m.variant && <span className="text-muted-foreground"> · {m.variant.name}</span>}
          </Link>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: 'reason',
      header: t('inventory.reason'),
      cell: (m) => <StatusBadge label={t(`inventory.reasons.${m.reason.toLowerCase()}`)} tone={reasonTone[m.reason]} />,
    },
    {
      key: 'delta',
      header: t('inventory.change'),
      align: 'end',
      cell: (m) => (
        <span className={m.delta >= 0 ? 'font-medium text-emerald-600 dark:text-emerald-400' : 'font-medium text-red-600 dark:text-red-400'}>
          {m.delta >= 0 ? `+${m.delta}` : m.delta}
        </span>
      ),
    },
    { key: 'resulting', header: t('inventory.resulting_stock'), align: 'end', cell: (m) => m.resultingStock },
    {
      key: 'ref',
      header: t('inventory.reference'),
      cell: (m) =>
        m.order ? (
          <Link to={`/orders/${m.order.id}`} className="font-mono text-xs hover:underline">
            {m.order.number}
          </Link>
        ) : m.note ? (
          <span className="text-xs text-muted-foreground">{m.note}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader icon={Boxes} title={t('inventory.title')} description={t('inventory.subtitle')} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-amber-500" />
            {t('inventory.low_stock')}
          </CardTitle>
          <CardDescription>{t('inventory.low_stock_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={lowStockColumns}
            rows={lowStock.data}
            isLoading={lowStock.isLoading}
            isError={lowStock.isError}
            error={lowStock.error}
            rowKey={(r) => r.variantId ?? r.productId}
            emptyState={
              <EmptyState
                icon={Boxes}
                title={t('inventory.all_stocked_title')}
                description={t('inventory.all_stocked_desc')}
              />
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('inventory.movements')}</CardTitle>
          <CardDescription>{t('inventory.movements_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable
            columns={movementColumns}
            rows={movements.data?.items}
            isLoading={movements.isLoading}
            isError={movements.isError}
            error={movements.error}
            rowKey={(m) => m.id}
            emptyState={
              <EmptyState
                icon={Boxes}
                title={t('inventory.no_movements_title')}
                description={t('inventory.no_movements_desc')}
              />
            }
          />
          {movements.data && movements.data.total > 0 && (
            <TablePagination
              page={page}
              pageSize={limit}
              total={movements.data.total}
              onPageChange={setPage}
              onPageSizeChange={setLimit}
            />
          )}
        </CardContent>
      </Card>

      <StockDialog open={dialogOpen} target={target} onOpenChange={setDialogOpen} />
    </div>
  );
}
