"use client";

import { Material } from "@/lib/materials";

interface Props {
  material: Material;
  selected?: boolean;
  onSelect?: (m: Material) => void;
  href?: string;
  showPrice?: boolean;
}

/**
 * The one element carrying the brand. Renders the uploaded photo when there is
 * one and falls back to the flat swatch color when there is not, so a material
 * added in the admin panel looks right before anyone photographs it.
 */
export default function MaterialSwatch({
  material,
  selected = false,
  onSelect,
  href,
  showPrice = false,
}: Props) {
  const inner = (
    <>
      <div
        className="h-28 w-full overflow-hidden rounded-sm transition-transform duration-300 group-hover:scale-[1.03] sm:h-36"
        style={{
          backgroundColor: material.swatch,
          boxShadow: selected
            ? "inset 0 3px 0 0 var(--granite)"
            : "inset 0 0 0 1px rgba(232,230,224,0.10)",
        }}
      >
        {material.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={material.image_url}
            alt={material.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="mt-3">
        <p className="font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-[var(--paper)]">
          {material.name}
        </p>
        {showPrice && (
          <p className="tnum mt-0.5 font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
            ${material.cost_per_yard}/yd³
          </p>
        )}
      </div>
    </>
  );

  const base = "group block w-full cursor-pointer text-left focus-visible:outline-offset-4";

  if (href) {
    return (
      <a href={href} className={base} aria-label={`Price a job in ${material.name}`}>
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={() => onSelect?.(material)} aria-pressed={selected} className={base}>
      {inner}
    </button>
  );
}
