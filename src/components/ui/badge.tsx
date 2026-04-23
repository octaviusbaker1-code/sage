import React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: string;
};

export function Badge({ className = "", ...props }: DivProps) {
  return <div className={`inline-flex items-center rounded px-2 py-1 text-xs ${className}`} {...props} />;
}
