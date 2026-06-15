import { useTranslation } from 'react-i18next';
import type { AttributeDef } from '@/features/categories/types';
import { FormField } from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AttributeFieldsProps {
  schema: AttributeDef[];
  values: Record<string, unknown>;
  /** Called with the attribute key and its new value (string | string[]). */
  onChange: (key: string, value: unknown) => void;
}

/**
 * Renders typed inputs for a category's attribute schema. Number values are kept
 * as raw strings here (so decimals type smoothly) and coerced by the caller on
 * submit. Reusable across product/variant/storefront forms.
 */
export function AttributeFields({ schema, values, onChange }: AttributeFieldsProps) {
  const { t } = useTranslation();

  return (
    <>
      {schema.map((def) => {
        const val = values[def.key];
        switch (def.type) {
          case 'textarea':
            return (
              <FormField key={def.key} label={def.label}>
                <Textarea
                  rows={3}
                  value={(val as string) ?? ''}
                  onChange={(e) => onChange(def.key, e.target.value)}
                />
              </FormField>
            );
          case 'number':
            return (
              <FormField key={def.key} label={def.label}>
                <Input
                  inputMode="decimal"
                  value={val == null ? '' : String(val)}
                  onChange={(e) => onChange(def.key, e.target.value)}
                />
              </FormField>
            );
          case 'select':
            return (
              <FormField key={def.key} label={def.label}>
                <Select value={(val as string) ?? ''} onValueChange={(v) => onChange(def.key, v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('products.select_option')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(def.options ?? []).map((o) => (
                      <SelectItem key={o} value={o}>
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            );
          case 'multiselect': {
            const arr = (val as string[]) ?? [];
            return (
              <FormField key={def.key} label={def.label}>
                <div className="flex flex-wrap gap-3">
                  {(def.options ?? []).map((o) => (
                    <label key={o} className="flex items-center gap-1.5 text-sm">
                      <Checkbox
                        checked={arr.includes(o)}
                        onCheckedChange={(c) =>
                          onChange(def.key, c === true ? [...arr, o] : arr.filter((x) => x !== o))
                        }
                      />
                      {o}
                    </label>
                  ))}
                </div>
              </FormField>
            );
          }
          default:
            return (
              <FormField key={def.key} label={def.label}>
                <Input
                  value={(val as string) ?? ''}
                  onChange={(e) => onChange(def.key, e.target.value)}
                />
              </FormField>
            );
        }
      })}
    </>
  );
}
