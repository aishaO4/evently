import type { HTMLAttributes } from "react";

export type HostBadgeVariant = "verified" | "repeat" | "new";
export type HostBadgeCategory = "blue" | "yellow" | "lime" | "purple";

export type HostBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  variant: HostBadgeVariant;
  category?: HostBadgeCategory;
};

const variantLabels: Record<HostBadgeVariant, string> = {
  verified: "Verified host",
  repeat: "Repeat host",
  new: "New host",
};

function CheckIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
      <path d="m3.25 8.15 2.8 2.8 6.7-6.7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16">
      <path d="m8 1.8 1.75 3.55 3.92.57-2.84 2.76.67 3.9L8 10.74l-3.5 1.84.67-3.9-2.84-2.76 3.92-.57L8 1.8Z" />
    </svg>
  );
}

export function HostBadge({
  variant,
  category = "blue",
  className,
  ...props
}: HostBadgeProps) {
  const label = variantLabels[variant];
  const classes = ["host-badge", className].filter(Boolean).join(" ");

  return (
    <span
      className={classes}
      data-category={category}
      data-variant={variant}
      {...props}
    >
      {variant === "verified" && <CheckIcon />}
      {variant === "repeat" && <StarIcon />}
      <span>{label}</span>
    </span>
  );
}
