import { useTranslation } from 'react-i18next';

export function useDirection() {
  const { i18n } = useTranslation();
  const dir = i18n.dir();
  return { dir, isRtl: dir === 'rtl' };
}
