import React, { createContext, useContext, useMemo, useState } from "react";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

type TabsProps = React.HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string;
  value?: string;
};

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function Tabs({ className = "", defaultValue = "", value, children, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;

  const ctx = useMemo(
    () => ({
      value: currentValue,
      setValue: setInternalValue,
    }),
    [currentValue],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}

export function TabsTrigger({ className = "", value, children, ...props }: TabsTriggerProps) {
  const ctx = useContext(TabsContext);
  const active = ctx?.value === value;

  return (
    <button
      className={className}
      onClick={() => ctx?.setValue(value)}
      type="button"
      {...props}
    >
      {children}
      {active ? "" : ""}
    </button>
  );
}

export function TabsContent({ className = "", value, children, ...props }: TabsContentProps) {
  const ctx = useContext(TabsContext);

  if (ctx?.value !== value) return null;

  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
