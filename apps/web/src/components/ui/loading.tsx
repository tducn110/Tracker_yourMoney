import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/components/ui/utils';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-4 h-9 w-full" />
      <Skeleton className="mt-3 h-4 w-3/4" />
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

