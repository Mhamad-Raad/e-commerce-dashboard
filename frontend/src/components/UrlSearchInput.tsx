import { useEffect, useState } from 'react';
import { SearchInput } from '@/components/SearchInput';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

interface UrlSearchInputProps {
  /** Current committed value (from the URL). */
  value: string;
  /** Called with the debounced value once typing settles. */
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  delay?: number;
}

/**
 * Search box that updates immediately as the user types but only commits the
 * (debounced) value upward — so the URL/query isn't rewritten on every keystroke.
 * Re-syncs when the committed value changes externally (back/forward, clear).
 */
export function UrlSearchInput({
  value,
  onChange,
  placeholder,
  className,
  delay = 400,
}: UrlSearchInputProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebouncedValue(local, delay);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  return (
    <SearchInput value={local} onChange={setLocal} placeholder={placeholder} className={className} />
  );
}
