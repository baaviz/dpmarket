import * as React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'default' | 'muted' | 'primary' | 'dark';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

const sectionVariants = {
  default: 'bg-white',
  muted: 'bg-surface-50',
  primary: 'bg-primary-50',
  dark: 'bg-surface-950 text-white',
};

const sectionSpacing = {
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-24',
  xl: 'py-24 sm:py-32',
};

export function Section({
  variant = 'default',
  spacing = 'lg',
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(sectionVariants[variant], sectionSpacing[spacing], className)}
      {...props}
    />
  );
}
