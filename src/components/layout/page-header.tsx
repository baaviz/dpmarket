import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  align?: 'start' | 'center';
}

export function PageHeader({
  title,
  description,
  children,
  className,
  align = 'start',
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-8 flex flex-col gap-2',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description && (
        <p className="max-w-2xl text-lg text-surface-500">{description}</p>
      )}
      {children}
    </div>
  );
}
