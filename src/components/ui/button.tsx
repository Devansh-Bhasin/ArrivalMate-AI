"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-[var(--brand)] text-white shadow-[0_14px_34px_rgba(15,118,110,0.28)] hover:bg-[var(--brand-strong)]",
        variant === "secondary" &&
          "border border-[var(--line)] bg-white/85 text-[var(--ink)] hover:bg-[var(--surface-accent)]",
        variant === "ghost" && "text-[var(--brand-strong)] hover:bg-[var(--brand-soft)]",
        className,
      )}
      {...props}
    />
  );
});
