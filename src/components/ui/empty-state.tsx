import * as React from 'react';
import { cn } from '@/lib/utils';
import { Package, Search, ShoppingCart, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'compact';
  className?: string;
}

const defaultIcons: Record<string, React.ReactNode> = {
  products: <Package className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  orders: <ShoppingCart className="h-12 w-12" />,
  error: <AlertCircle className="h-12 w-12" />,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' ? 'py-16' : 'py-8',
        className,
      )}
    >
      <div className="mb-4 text-surface-300">
        {icon || defaultIcons.products}
      </div>
      <h3
        className={cn(
          'font-bold text-surface-700',
          variant === 'default' ? 'text-xl' : 'text-lg',
        )}
      >
        {title}
      </h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-surface-400">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
