import { CustomerNotificationType, HomeTargetType, OrderStatus } from '@prisma/client';
import { pick } from '../common/i18n';
import { PushPayload } from '../fcm/fcm.service';

// The push TRAY text (title/body) must be rendered server-side because the OS
// shows it before the app runs. We render in the device's registered locale.
// The in-app notification centre, by contrast, renders client-side from
// type+data so it always matches the app's current language.
type Lang = 'en' | 'ar' | 'ckb';

const LANGS: Lang[] = ['en', 'ar', 'ckb'];
const asLang = (value: string): Lang =>
  (LANGS as string[]).includes(value) ? (value as Lang) : 'en';

// Customer-facing order status labels in the three supported languages.
const ORDER_STATUS_LABELS: Record<OrderStatus, Record<Lang, string>> = {
  PENDING: { en: 'Pending', ar: 'قيد الانتظار', ckb: 'چاوەڕوان' },
  PAID: { en: 'Paid', ar: 'مدفوع', ckb: 'پارەدراو' },
  PROCESSING: { en: 'Processing', ar: 'قيد المعالجة', ckb: 'لە پرۆسەدایە' },
  SHIPPED: { en: 'Shipped', ar: 'تم الشحن', ckb: 'نێردرا' },
  OUT_FOR_DELIVERY: {
    en: 'Out for delivery',
    ar: 'قيد التوصيل',
    ckb: 'لە ڕێگای گەیاندندایە',
  },
  DELIVERED: { en: 'Delivered', ar: 'تم التوصيل', ckb: 'گەیەنرا' },
  CANCELLED: { en: 'Cancelled', ar: 'ملغي', ckb: 'هەڵوەشێنرایەوە' },
  REFUNDED: { en: 'Refunded', ar: 'تم الاسترداد', ckb: 'پارە گەڕێنرایەوە' },
};

const orderStatusLabel = (status: string, lang: Lang): string => {
  const labels = ORDER_STATUS_LABELS[status as OrderStatus];
  return labels ? labels[lang] : status;
};

const STRINGS = {
  orderPlacedTitle: {
    en: 'Order placed',
    ar: 'تم تقديم الطلب',
    ckb: 'داواکاری تۆمارکرا',
  },
  orderPlacedBody: (number: string, lang: Lang) =>
    ({
      en: `Your order ${number} has been placed. Thank you!`,
      ar: `تم تقديم طلبك ${number}. شكراً لك!`,
      ckb: `داواکاریەکەت ${number} تۆمارکرا. سوپاس!`,
    })[lang],
  orderStatusTitle: {
    en: 'Order update',
    ar: 'تحديث الطلب',
    ckb: 'نوێکردنەوەی داواکاری',
  },
  orderStatusBody: (number: string, statusLabel: string, lang: Lang) =>
    ({
      en: `Order ${number} is now ${statusLabel}.`,
      ar: `طلبك ${number} الآن ${statusLabel}.`,
      ckb: `داواکاری ${number} ئێستا ${statusLabel}ـە.`,
    })[lang],
};

/**
 * Build the push tray title/body + deep-link data for a customer notification,
 * localized to the device's language. Returns null for an unsupported type so
 * the caller simply skips the push (the in-app row is still stored).
 */
export function renderPush(
  type: CustomerNotificationType,
  data: Record<string, unknown>,
  locale: string,
): PushPayload | null {
  const lang = asLang(locale);
  const number = typeof data.number === 'string' ? data.number : '';
  const orderId = typeof data.orderId === 'string' ? data.orderId : '';
  // Deep-link payload the app reads on tap to route to the order.
  const linkData: Record<string, string> = {
    type,
    ...(orderId ? { orderId } : {}),
  };

  switch (type) {
    case 'ORDER_PLACED':
      return {
        title: STRINGS.orderPlacedTitle[lang],
        body: STRINGS.orderPlacedBody(number, lang),
        data: linkData,
      };
    case 'ORDER_STATUS_CHANGED': {
      const status = typeof data.status === 'string' ? data.status : '';
      return {
        title: STRINGS.orderStatusTitle[lang],
        body: STRINGS.orderStatusBody(number, orderStatusLabel(status, lang), lang),
        data: linkData,
      };
    }
    default:
      return null;
  }
}

export interface AnnouncementPushInput {
  id: string;
  titleEn: string;
  titleAr: string | null;
  titleCkb: string | null;
  bodyEn: string;
  bodyAr: string | null;
  bodyCkb: string | null;
  targetType: HomeTargetType;
  targetId: string | null;
  url: string | null;
}

/**
 * Tray text for an admin-authored announcement, in the device's language. The
 * text is the authored title/body (not a template); the data carries the target
 * so the app can deep-link on tap.
 */
export function renderAnnouncementPush(
  a: AnnouncementPushInput,
  locale: string,
): PushPayload {
  const lang = asLang(locale);
  const title = pick(lang, a.titleEn, a.titleAr, a.titleCkb) ?? a.titleEn;
  const body = pick(lang, a.bodyEn, a.bodyAr, a.bodyCkb) ?? a.bodyEn;
  return {
    title,
    body,
    data: {
      type: 'ANNOUNCEMENT',
      announcementId: a.id,
      targetType: a.targetType,
      ...(a.targetId ? { targetId: a.targetId } : {}),
      ...(a.url ? { url: a.url } : {}),
    },
  };
}
