'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/components/ui/utils';
import {
  formatCurrencyInput,
  parseCurrencyInput,
  type CurrencyInputLocale,
} from '@/_lib/utils/currency-input';

type CurrencyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'value' | 'onChange' | 'inputMode'
> & {
  value: string;
  onValueChange: (rawValue: string) => void;
  locale?: CurrencyInputLocale;
  suffix?: string;
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, locale = 'vi-VN', suffix, className, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          inputMode="numeric"
          value={formatCurrencyInput(value, locale)}
          onChange={(event) => onValueChange(parseCurrencyInput(event.target.value))}
          className={cn(suffix ? 'pr-12' : undefined, className)}
          {...props}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-semibold text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    );
  },
);

CurrencyInput.displayName = 'CurrencyInput';

