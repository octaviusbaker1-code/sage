import React, { createContext, useContext, useMemo, useState } from "react";

type SelectContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const SelectContext = createContext<SelectContextValue | null>(null);

type SelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
};

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type ItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function Select({ value = "", onValueChange, children }: SelectProps) {
  const [internalValue, setInternalValue] = useState(value);

  const currentValue = onValueChange ? value : internalValue;

  const ctx = useMemo(
    () => ({
      value: currentValue,
      setValue: (next: string) => {
        if (onValueChange) onValueChange(next);
        else setInternalValue(next);
      },
    }),
    [currentValue, onValueChange],
  );

  return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>;
}

export function SelectTrigger({ className = "", children, ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function SelectValue({ placeholder, className = "" }: { placeholder?: string; className?: string }) {
  const ctx = useContext(SelectContext);
  return <span className={className}>{ctx?.value || placeholder || ""}</span>;
}

export function SelectContent({ className = "", children, ...props }: DivProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function SelectItem({ className = "", value, children, ...props }: ItemProps) {
  const ctx = useContext(SelectContext);

  return (
    <div
      className={className}
      onClick={() => ctx?.setValue(value)}
      {...props}
    >
      {children}
    </div>
  );
}
