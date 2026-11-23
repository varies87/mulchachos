import { SERVICE_CITIES } from "@/lib/content";
import { PHONE } from "./SiteHeader";

const MONO = "font-[family-name:var(--font-mono)]";

/**
 * Where we deliver. We run out of Northwest Dallas and cover the metroplex
 * within about 30 minutes, so this lists the DFW cities a visitor is likely to
 * live in. Cold ad traffic needs to see their own city here and think "yes,
 * they come to me."
 */
export default function ServiceArea() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Where we work
          </h2>
          <p className="mt-4 max-w-md text-[var(--ink-soft)]">
            We run out of Northwest Dallas and work across Dallas and the
            cities around it.
          </p>
          <p className="mt-4">
            <a href={"tel:" + PHONE} className="font-medium text-[var(--clay)]">
              Not sure? Call {PHONE}
            </a>{" "}
            <span className="text-[var(--muted)]">for more info.</span>
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
          {SERVICE_CITIES.map((city) => (
            <li key={city} className="flex items-center gap-2 text-[var(--ink-soft)]">
              <span className="text-[var(--clay)]" aria-hidden="true">•</span>
              {city}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
