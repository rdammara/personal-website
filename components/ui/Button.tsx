import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    // Focus uses the site-wide :focus-visible outline from globals.css
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

    const variants = {
      primary: 'bg-fill text-onfill hover:brightness-95',
      secondary: 'bg-surface text-ink hover:bg-line',
      outline: 'border border-control text-ink hover:bg-surface',
      ghost: 'text-ink hover:bg-surface',
      danger: 'bg-red-700 text-white hover:bg-red-800',
    };

    const sizes = {
      sm: 'text-xs px-3 min-h-9 gap-1.5',
      md: 'text-sm px-4 min-h-11 gap-2',
      lg: 'text-base px-6 min-h-12 gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
