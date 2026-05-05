import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-100 text-surface-700',
        primary: 'bg-primary-100 text-primary-700',
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
        error: 'bg-red-50 text-red-700',
        info: 'bg-blue-50 text-blue-700',
        outline: 'border border-surface-300 text-surface-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function StatusBadge({ className, variant, ...props }: StatusBadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/** Map order/payment status to badge variant */
export function getStatusVariant(
  status: string,
): 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' {
  switch (status) {
    case 'paid':
    case 'fulfilled':
    case 'sent':
    case 'delivered':
      return 'success';
    case 'pending_payment':
    case 'pending':
    case 'initiated':
    case 'queued':
    case 'partially_fulfilled':
      return 'warning';
    case 'failed':
    case 'payment_failed':
    case 'cancelled':
    case 'expired':
      return 'error';
    case 'refunded':
    case 'manual_required':
      return 'info';
    case 'draft':
      return 'default';
    default:
      return 'default';
  }
}
