import React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Separator({ className = "", ...props }: DivProps) {
  return <div className={className} {...props} />;
}
