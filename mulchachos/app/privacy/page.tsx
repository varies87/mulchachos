import type { Metadata } from "next";
import SiteHeader, { PHONE } from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy and terms",
  description: "What Preston Hollow Mulchachos does with the information you send through this site.",
  alternates: { canonical: "/privacy" },
};

const H2 = "mt-10 text-xl font-bold text-[var(--ink)]";
const LINK = "text-[var(--clay)] underline";

export default function PrivacyPage() {
  return (
    <main>
      <SiteHeader />

      <section className="mx-auto max-w-2xl px-6 pb-20 pt-12 text-[var(--ink-soft)]">
        <h1 className="text-4xl font-extrabold text-[var(--ink)]">Privacy and terms</h1>
        <p className="mt-4">Last updated November 2026.</p>

        <h2 className={H2}>What we collect</h2>
        <p className="mt-3">
          When you send a job request or a question, we keep what you type in the
          form: your name, phone number, email, job address, ZIP code, notes, the
          details of your estimate, and any photos you attach. We use it to call or
          text you back, price the job, and schedule it. Nothing else.
        </p>

        <h2 className={H2}>Who handles it</h2>
        <p className="mt-3">
          A few services run the site for us: Supabase stores requests and photos,
          Resend sends the confirmation and notification emails, and Vercel hosts
          the site and counts page visits without identifying you. We don&apos;t sell
          or share your information with anyone else, and we don&apos;t use it for
          advertising.
        </p>

        <h2 className={H2}>Estimates</h2>
        <p className="mt-3">
          Prices from the estimator are estimates. We confirm the material and
          volume before anything is booked, and we bill for what is actually
          delivered and spread.
        </p>

        <h2 className={H2}>Questions or removal</h2>
        <p className="mt-3">
          To see or delete what we have about you, call or text{" "}
          <a href={"tel:" + PHONE} className={LINK}>{PHONE}</a>.
        </p>
      </section>

      <SiteFooter />
    </main>
  );
}
