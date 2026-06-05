import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { downloadFile } from '@/lib/download';
import { extractErrorMessage } from '@/lib/format';

interface Props {
  path: string;
  filename: string;
  params?: Record<string, unknown>;
}

/** Download the full (filtered) result set of a list as CSV. */
export function ExportCsvButton({ path, filename, params }: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      await downloadFile(path, params ?? {}, filename);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" onClick={onClick} disabled={busy}>
      <Download className="h-4 w-4" />
      {busy ? t('common.working') : t('common.export_csv')}
    </Button>
  );
}
