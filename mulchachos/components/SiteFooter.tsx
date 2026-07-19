import { PHONE } from "./SiteHeader";

const MONO = "font-[family-name:var(--font-mono)]";

export default function SiteFooter({ zips }: { zips: string[] }) {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-wrap justify-between gap-10">
          <div>
            <a href={"tel:" + PHONE} className="text-2xl font-extrabold text-[var(--clay)]">
              {PHONE}
            </a>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Preston Hollow Mulchachos LLC
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              Dallas, Texas
            </p>
          </div>

          <div>
            <p className={ MONO + " text-xs uppercase tracking-widest text-[var(--muted)]" }>
              Service area
            </p>
            <p className={"tnum mt-3 max-w-sm text-sm " + MONO}>
              {zips.join("  ·  ")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
