'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-surface-50">
          <div className="text-center px-4">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-extrabold text-surface-900 mb-3">حدث خطأ غير متوقع</h1>
            <p className="text-surface-500 mb-8 max-w-md mx-auto">
              نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
            </p>
            <Button onClick={reset} size="lg" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
