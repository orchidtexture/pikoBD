import React from 'react';
import { cn } from '../lib/utils';

export const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1", className)}>
    {children}
  </span>
);
