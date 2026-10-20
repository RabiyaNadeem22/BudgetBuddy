import * as React from "react";

import { cn } from "./utils";

export interface InputProps extends React.ComponentProps<"input"> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || (label ? `input-${generatedId}` : undefined);

    const inputElement = (
      <input
        ref={ref}
        id={inputId}
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-lg border px-3.5 py-2 text-sm bg-input-background transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          error
            ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
            : "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        {...props}
      />
    );

    if (!label && !error && !helperText) {
      return inputElement;
    }

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground tracking-tight"
          >
            {label}
          </label>
        )}
        {inputElement}
        {error && (
          <p className="text-xs text-destructive font-medium animate-fadeIn">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };

