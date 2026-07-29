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
            All over DFW
          </h2>
          <p className="mt-4 max-w-md text-[var(--ink-soft)]">
            We run out of Northwest Dallas and deliver across the Dallas–Fort
            Worth metroplex — just about anywhere within 30 minutes of us. If
            your city is on this list, we come to you.
          </p>
          <p className="mt-4">
            <a href={"tel:" + PHONE} className="font-medium text-[var(--clay)]">
              Not sure? Call {PHONE}
            </a>{" "}
            <span className="text-[var(--muted)]">and we'll tell you straight.</span>
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
          {SERVICE_CITIES.map((city) => (
            <li key={city} className="flex items-center gap-2 text-[var(--ink-soft)]">
              <span className="text-[var(--clay)]" aria-hidden="true">•</span>
              {city}
            </li>
          ))}
          <li className={MONO + " col-span-2 mt-1 text-sm text-[var(--muted)] sm:col-span-3"}>
            + the surrounding communities
          </li>
        </ul>
      </div>
    </section>
  );
}
