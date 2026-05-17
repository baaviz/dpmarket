'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AppIconProps {
  src?: string | null;
  sources?: Array<string | null | undefined>;
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function AppIcon({ src, sources, name, className, size = 'md' }: AppIconProps) {
  const sourceList = sources?.filter(Boolean) as string[] | undefined;
  const initialSource = src || sourceList?.[0] || null;
  const [sourceIndex, setSourceIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10 rounded-[0.85rem] text-sm',
    md: 'w-[72px] h-[72px] rounded-[1.35rem] text-2xl',
    lg: 'w-24 h-24 rounded-[1.65rem] text-3xl',
    xl: 'w-32 h-32 rounded-[2.15rem] text-4xl',
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const currentSrc = sourceList?.[sourceIndex] || initialSource;

  function handleError() {
    if (sourceList && sourceIndex < sourceList.length - 1) {
      setSourceIndex(sourceIndex + 1);
      return;
    }
    setFailed(true);
  }

  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br from-surface-100 to-surface-200 shadow-sm shrink-0 flex items-center justify-center font-bold text-surface-500', sizeClasses[size], className)}>
      {currentSrc && !failed ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={currentSrc}
          alt={name}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={handleError}
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
