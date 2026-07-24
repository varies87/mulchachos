import MobileMenu from "./MobileMenu";

export const PHONE = "214-708-7503";

const LINK = "text-[var(--ink-soft)] hover:text-[var(--clay)]";

const CALL =
  "rounded-full bg-[var(--clay)] px-3.5 py-2 text-sm font-medium " +
  "text-white hover:bg-[var(--clay-deep)] sm:px-4";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 sm:gap-6 sm:px-6 sm:py-4">
        <a href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Preston Hollow Mulchachos" className="h-10 w-auto sm:h-14" />
        </a>

        {/* Wide screens: full text nav. */}
        <nav className="ml-auto hidden items-center gap-5 text-sm sm:flex">
          <a href="/estimate" className={LINK}>Estimator</a>
          <a href="/materials" className={LINK}>Materials</a>
          <a href={"tel:" + PHONE} className={CALL}>{PHONE}</a>
        </nav>

        {/* Phones: a call button plus the menu. */}
        <div className="ml-auto flex items-center gap-2 sm:hidden">
          <a href={"tel:" + PHONE} className={CALL} aria-label={"Call " + PHONE}>
            Call
          </a>
          <MobileMenu phone={PHONE} />
        </div>
      </div>
    </header>
  );
}
