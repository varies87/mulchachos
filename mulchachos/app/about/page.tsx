import type { Metadata } from "next";
import Image from "next/image";
import SiteHeader, { PHONE } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getPricingSettings } from "@/lib/materials";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Who we are",
  description:
    "Preston Hollow Mulchachos is a local mulch and rock crew " +
    "serving the Dallas–Fort Worth metroplex.",
};

const CTA =
  "inline-block rounded-full bg-[var(--clay)] px-6 py-3 " +
  "font-medium text-white hover:bg-[var(--clay-deep)]";

export default async function AboutPage() {
  const settings = await getPricingSettings();

  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-6 pb-16 pt-12">
        <h1 className="text-4xl font-extrabold sm:text-6xl">
          Who we are.
        </h1>

        <Image
          src="/crew.jpg"
          alt="The Preston Hollow Mulchachos crew in uniform with rakes, shovels, and a wheelbarrow"
          width={1080}
          height={1350}
          priority
          sizes="(max-width: 672px) 100vw, 672px"
          className="mt-8 w-full rounded-xl"
        />

        <div className="mt-8 space-y-5 text-lg text-[var(--ink-soft)]">
          <p>
            Mulchachos started my freshman year of high school
            with a wagon, inspired by the Boy Scouts&apos; mulch
            sales. Four years and hundreds of jobs later, we have
            a regular crew, our own truck, and rock bought in bulk
            straight from the supplier.
          </p>
          <p>
            We&apos;re growing, and we plan to keep growing. As we
            do, the standard stays the same: show up when we say
            we will, spread it evenly, and sweep the driveway
            before we leave.
          </p>
          <p>
            You can price your beds online in about a minute, and
            a real person on our team will call or text you back.
          </p>
          <p>
            If something isn&apos;t right when we leave, call me
            and we&apos;ll come back and fix it.
          </p>
          <div className="flex items-center gap-4">
            <Image
              src="/harrison.jpg"
              alt="Harrison, owner of Preston Hollow Mulchachos"
              width={88}
              height={88}
              className="h-[88px] w-[88px] rounded-full object-cover"
            />
            <p className="font-semibold text-[var(--ink)]">
              Harrison, owner
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--line)] pt-10">
          <h2 className="text-xl font-semibold">
            Where we work
          </h2>
          <p className="mt-3 text-[var(--ink-soft)]">
            We run out of Northwest Dallas and cover the whole
            Dallas–Fort Worth metroplex — just about anywhere
            within 30 minutes, from University Park and Highland
            Park to Irving, Carrollton, Plano, and Grand Prairie.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="/estimate" className={CTA}>
              Price my beds
            </a>
            <a href={"tel:" + PHONE} className="font-medium text-[var(--clay)]">
              or call {PHONE}
            </a>
          </div>
        </div>
      </section>

      <SiteFooter zips={settings.service_zips} />
    </main>
  );
}
