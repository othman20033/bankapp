import clsx from 'clsx';
import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, leftIcon: LeftIcon, className, type = 'text', ...rest },
  ref,
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {LeftIcon && (
          <LeftIcon className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        )}
        <input
          ref={ref}
          type={type}
          className={clsx(
            'input',
            LeftIcon && 'pl-10',
            error && 'border-danger-500 focus:ring-danger-500',
            className,
          )}
          {...rest}
        />
      </div>
      {error && <p className="text-xs text-danger-600 mt-1.5">{error}</p>}
      {!error && hint && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
});

export default Input;
