import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "default" | "lg";
};

export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  const variantClass =
    variant === "secondary"
      ? ""
      : variant === "ghost"
        ? ""
        : "";

  const sizeClass =
    size === "sm"
      ? ""
      : size === "lg"
        ? ""
        : "";

  return <button type={type} className={`${variantClass} ${sizeClass} ${className}`.trim()} {...props} />;
}
