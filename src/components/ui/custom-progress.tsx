
import React from 'react';
import { cn } from '@/lib/utils';

interface CustomProgressProps {
  value?: number;
  max?: number;
  className?: string;
  indicatorClassName?: string;
}

export const CustomProgress = React.forwardRef<HTMLDivElement, CustomProgressProps>(
  ({ value = 0, max = 100, className, indicatorClassName }, ref) => {
    const percentage = (value / max) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
          className
        )}
      >
        <div
          className={cn('h-full w-full flex-1 bg-primary transition-all', indicatorClassName)}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

CustomProgress.displayName = 'CustomProgress';
