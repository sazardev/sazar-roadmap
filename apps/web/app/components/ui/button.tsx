import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router";
import { cn } from "~/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-sm border text-sm font-medium transition-[background-color,border-color,color,opacity] duration-fast disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  primary: "border-ink bg-ink text-canvas hover:opacity-88",
  secondary: "border-line bg-canvas text-ink hover:bg-hover",
  ghost: "border-transparent bg-transparent text-ink hover:bg-hover",
  danger: "border-danger/50 bg-transparent text-danger hover:bg-danger/10",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4",
  lg: "h-11 px-5 text-[15px]",
};

export function buttonClass(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className);
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  icon,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...props}>
      {icon}
      {children}
    </button>
  );
}

export interface LinkButtonProps extends LinkProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  icon,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {icon}
      {children}
    </Link>
  );
}

export function ExternalLinkButton({
  href,
  variant = "secondary",
  size = "md",
  className,
  icon,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={buttonClass(variant, size, className)}
    >
      {icon}
      {children}
    </a>
  );
}
