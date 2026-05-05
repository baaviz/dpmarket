export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
        </div>
        <p className="text-sm font-medium text-surface-400 animate-pulse">جاري التحميل...</p>
      </div>
    </div>
  );
}
