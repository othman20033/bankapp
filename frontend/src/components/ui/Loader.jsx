import { Loader2 } from 'lucide-react';

export default function Loader({ label, full = false }) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-slate-500">
      <Loader2 className="size-8 animate-spin text-primary-600" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );

  return full ? (
    <div className="flex items-center justify-center min-h-[60vh]">{content}</div>
  ) : (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
}
