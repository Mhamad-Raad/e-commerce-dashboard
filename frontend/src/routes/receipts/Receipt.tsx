import { useTranslation } from 'react-i18next';
import type { Order } from '@/features/orders/types';
import type { Settings } from '@/features/settings/api';
import { humanizeGeo } from '@/lib/iraqGeo';
import { formatDate, formatMoney } from '@/lib/format';

interface Props {
  order: Order;
  settings: Settings | null;
}

/**
 * A single print-friendly receipt/invoice for one order. Pure layout — the
 * surrounding page handles fetching and printing.
 */
export function Receipt({ order, settings }: Props) {
  const { t } = useTranslation();
  const money = (cents: number) => formatMoney(cents, order.currency);
  const businessName = settings?.businessName || t('app.title');

  const shipLine = order.shipGovernorate
    ? [humanizeGeo(order.shipCity), humanizeGeo(order.shipGovernorate)].filter(Boolean).join(', ')
    : null;

  return (
    <article className="receipt mx-auto w-full max-w-[800px] bg-white p-10 text-black">
      {/* Header */}
      <header className="flex items-start justify-between gap-6 border-b border-gray-300 pb-6">
        <div>
          <h1 className="text-2xl font-bold">{businessName}</h1>
          <div className="mt-1 space-y-0.5 text-xs text-gray-600">
            {settings?.businessPhone && <p>{settings.businessPhone}</p>}
            {settings?.businessEmail && <p>{settings.businessEmail}</p>}
            {settings?.businessAddress && <p>{settings.businessAddress}</p>}
          </div>
        </div>
        <div className="text-end">
          <h2 className="text-lg font-semibold uppercase tracking-wide text-gray-700">
            {t('receipt.title')}
          </h2>
          <p className="mt-1 font-mono text-sm">{order.number}</p>
          <p className="text-xs text-gray-600">{formatDate(order.placedAt)}</p>
          <p className="mt-1 text-xs text-gray-600">
            {t('common.status')}: {t(`orders.status.${order.status.toLowerCase()}`)}
          </p>
        </div>
      </header>

      {/* Bill to */}
      <section className="grid grid-cols-2 gap-6 py-6 text-sm">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase text-gray-500">{t('receipt.bill_to')}</p>
          <p className="font-medium">{order.shipName || order.customer.name}</p>
          <p className="text-xs text-gray-600">{order.customer.email}</p>
          {order.shipPhone && <p className="text-xs text-gray-600">{order.shipPhone}</p>}
        </div>
        {shipLine && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
              {t('orders.shipping_address')}
            </p>
            <p className="text-xs text-gray-700">{shipLine}</p>
            {(order.shipDistrict || order.shipStreet) && (
              <p className="text-xs text-gray-700">
                {[order.shipDistrict, order.shipStreet].filter(Boolean).join(' · ')}
              </p>
            )}
            {order.shipLandmark && <p className="text-xs text-gray-600">{order.shipLandmark}</p>}
          </div>
        )}
      </section>

      {/* Items */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-y border-gray-300 text-start text-xs uppercase text-gray-500">
            <th className="py-2 pe-2 text-start font-semibold">{t('carts.product')}</th>
            <th className="py-2 px-2 text-start font-semibold">{t('products.sku')}</th>
            <th className="py-2 px-2 text-end font-semibold">{t('products.price')}</th>
            <th className="py-2 px-2 text-end font-semibold">{t('carts.quantity')}</th>
            <th className="py-2 ps-2 text-end font-semibold">{t('orders.total')}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((it) => (
            <tr key={it.id} className="border-b border-gray-200">
              <td className="py-2 pe-2">
                {it.name}
                {it.variantName && <span className="text-gray-500"> · {it.variantName}</span>}
              </td>
              <td className="py-2 px-2 font-mono text-xs text-gray-600">{it.sku}</td>
              <td className="py-2 px-2 text-end">{money(it.priceCents)}</td>
              <td className="py-2 px-2 text-end">{it.quantity}</td>
              <td className="py-2 ps-2 text-end">{money(it.priceCents * it.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <section className="mt-6 flex justify-end">
        <dl className="w-64 space-y-1 text-sm">
          <Row label={t('orders.subtotal')} value={money(order.subtotalCents)} />
          {order.discountCents > 0 && (
            <Row
              label={`${t('coupons.discount')}${order.couponCode ? ` (${order.couponCode})` : ''}`}
              value={`−${money(order.discountCents)}`}
            />
          )}
          {order.taxCents > 0 && <Row label={t('orders.tax')} value={money(order.taxCents)} />}
          {order.shippingCents > 0 && (
            <Row label={t('orders.shipping')} value={money(order.shippingCents)} />
          )}
          {order.feesCents > 0 && (
            <Row label={order.feesLabel || t('orders.fees')} value={money(order.feesCents)} />
          )}
          <div className="mt-1 flex justify-between border-t border-gray-300 pt-2 text-base font-bold">
            <dt>{t('orders.total')}</dt>
            <dd>{money(order.totalCents)}</dd>
          </div>
        </dl>
      </section>

      <footer className="mt-10 border-t border-gray-200 pt-4 text-center text-xs text-gray-500">
        {t('receipt.thanks')}
      </footer>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-700">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
