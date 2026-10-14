import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

/**
 * Polymorphic component: `as` chooses the rendered element and the props are typed for
 * THAT element (<Panel as="a" href="..."> accepts href; <Panel as="section"> does not).
 */
type PanelOwnProps<E extends ElementType> = {
  as?: E;
  tone?: "default" | "tint" | "dark";
  className?: string;
  children?: ReactNode;
};
export type PanelProps<E extends ElementType> = PanelOwnProps<E> & Omit<ComponentPropsWithoutRef<E>, keyof PanelOwnProps<E>>;

export function Panel<E extends ElementType = "div">({ as, tone = "default", className, ...rest }: PanelProps<E>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={`ps-adv-panel ps-adv-panel--${tone}${className ? ` ${className}` : ""}`} {...rest} />;
}
