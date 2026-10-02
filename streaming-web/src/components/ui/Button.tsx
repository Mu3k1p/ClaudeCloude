import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[5px] font-medium tracking-[-0.005em] transition-[background-color,color,border-color,transform,opacity] duration-300 ease-[var(--ease-cinema)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent-strong",
  secondary: "bg-ink/[0.09] text-ink hover:bg-ink/[0.15] border border-line",
  outline: "border border-line-strong text-ink hover:border-ink/40 hover:bg-ink/[0.04]",
  ghost: "text-ink-soft hover:text-ink hover:bg-ink/[0.06]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] [&_svg]:size-4",
  md: "h-11 px-5 text-sm [&_svg]:size-[18px]",
  lg: "h-12 px-6 text-[15px] md:h-[52px] md:px-7 [&_svg]:size-5",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = CommonProps & { href: string; "aria-label"?: string; prefetch?: boolean };

export const Button = forwardRef<HTMLButtonElement, ButtonProps | LinkProps>(function Button(props, ref) {
  const { variant = "secondary", size = "md", icon, className, children, ...rest } = props;
  const cls = cn(base, variants[variant], sizes[size], className);
  const inner = (
    <>
      {icon}
      {children}
    </>
  );
  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={cls} {...linkRest}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref} type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {inner}
    </button>
  );
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md" | "lg";
  tone?: "plain" | "solid" | "outline";
}

/** Square/round icon-only button. `label` becomes the accessible name. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", tone = "plain", className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-[background-color,color,border-color,transform] duration-300 ease-[var(--ease-cinema)] active:scale-95 disabled:opacity-40",
        size === "sm" && "size-8 [&_svg]:size-4",
        size === "md" && "size-10 [&_svg]:size-[18px]",
        size === "lg" && "size-12 [&_svg]:size-5",
        tone === "plain" && "text-ink-soft hover:bg-ink/[0.08] hover:text-ink",
        tone === "solid" && "bg-ink/[0.1] text-ink hover:bg-ink/[0.18]",
        tone === "outline" && "border border-line-strong text-ink hover:border-ink/50 hover:bg-ink/[0.06]",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
