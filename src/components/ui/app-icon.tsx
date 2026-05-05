'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AppIconProps {
  src?: string | null;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AppIcon({ src, name, className, size = 'md' }: AppIconProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-lg text-sm',
    md: 'w-[72px] h-[72px] rounded-2xl text-2xl',
    lg: 'w-24 h-24 rounded-[1.5rem] text-3xl',
    xl: 'w-32 h-32 rounded-[2rem] text-4xl'
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br from-surface-100 to-surface-200 shadow-sm shrink-0 flex items-center justify-center font-bold text-surface-400', sizeClasses[size], className)}>
      {src && !error ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={() => setError(true)}
          loading="lazy"
        />
      ) : (
        <span>{initial}</span>
      )}
      
      {/* Glossy iOS overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-white/20 pointer-events-none" />
      <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-inherit pointer-events-none" />
    </div>
  );
}
