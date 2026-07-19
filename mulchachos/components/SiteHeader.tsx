export const PHONE = "214-708-7503";

const LINK = "text-[var(--ink-soft)] hover:text-[var(--clay)]";

const CALL =
  "rounded-full bg-[var(--clay)] px-4 py-2 " +
  "font-medium text-white hover:bg-[var(--clay-deep)]";

export default function SiteHeader() {
  return (
    <header className="border-b border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-4">
        <a href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Preston Hollow Mulchachos" className="h-14 w-auto" />
        </a>

        <nav className="ml-auto flex items-center gap-5 text-sm">
          <a href="/estimate" className={"hidden sm:block " + LINK}>
            Estimator
          </a>
          <a href="/materials" className={"hidden sm:block " + LINK}>
            Materials
          </a>
          <a href={"tel:" + PHONE} className={CALL}>
            {PHONE}
          </a>
        </nav>
      </div>
    </header>
  );
}
