import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { GENERAL_QUOTE_MESSAGE, whatsapp } from "@/lib/pslaser/data";
import { WhatsAppIcon } from "./icons";

export type ButtonVariant = "primary" | "secondary" | "light" | "dark" | "link";
export type ButtonSize = "sm" | "md" | "lg";

/** Class string for the global `.s-btn` utility — use on any <a>/<button>. */
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra?: string,
): string {
  return [
    "s-btn",
    variant !== "primary" && `s-btn--${variant}`,
    size !== "md" && `s-btn--${size}`,
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show a trailing arrow that nudges on hover. Default true for "link". */
  arrow?: boolean;
  /** Leading icon (e.g. a lucide icon). */
  icon?: ReactNode;
  className?: string;
  "aria-label"?: string;
};

const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

/**
 * Link styled as a button. Internal paths use next/link; http(s) links open in a
 * new tab with rel="noopener noreferrer"; tel:/mailto: open normally.
 */
export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow,
  icon,
  className,
  ...rest
}: ButtonProps) {
  const showArrow = arrow ?? variant === "link";
  const content = (
    <>
      {icon}
      <span>{children}</span>
      {showArrow && <ArrowRight className="s-btn__arrow" aria-hidden="true" />}
    </>
  );
  const cls = buttonClass(variant, size, className);

  if (isExternal(href)) {
    const newTab = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={cls}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {content}
    </Link>
  );
}

type WhatsAppButtonProps = {
  /** Pre-filled WhatsApp message. Use a machine/service-specific message where possible. */
  message?: string;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  "aria-label"?: string;
};

/** "Get Quote" CTA → wa.me/917719976990 with a pre-filled message, new tab. */
export function WhatsAppButton({
  message = GENERAL_QUOTE_MESSAGE,
  children = "Get a quote on WhatsApp",
  variant = "primary",
  size = "md",
  className,
  ...rest
}: WhatsAppButtonProps) {
  return (
    <a
      href={whatsapp(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      <WhatsAppIcon />
      <span>{children}</span>
    </a>
  );
}
