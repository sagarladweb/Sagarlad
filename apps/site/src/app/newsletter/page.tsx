import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { NewsletterForm } from "@/components/NewsletterForm";
import { FaYoutube, FaInstagram, FaTelegram } from "react-icons/fa6";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "The Sagar Lad Letter",
  description:
    "The Sagar Lad Letter — a free weekly email on money, life and everything in between.",
  path: "/newsletter",
});

export default function NewsletterPage() {
  return (
    <div className="overflow-x-clip">
      <PageHeader
        eyebrow="Newsletter"
        title="The Sagar Lad Letter"
        subtitle="One email a week. No spam, no noise — just the frameworks I use for money, work and life."
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 sm:p-10">
          <div className="absolute right-0 top-0 hidden sm:block h-full w-1/3 pointer-events-none" aria-hidden="true">
            <Image
              src="/images/heroes/hero.webp"
              alt=""
              fill
              sizes="33vw"
              className="object-cover object-top opacity-40"
              priority={false}
            />
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold">One practical idea, every Sunday</h2>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Every Sunday I share one practical idea you can use immediately — a
            money framework, a career insight, or a reminder to slow down.
          </p>
          <NewsletterForm />
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
            <li className="flex gap-2 items-center">
              <FaYoutube className="w-4 h-4 text-brand-light" /> Weekly video digest
            </li>
            <li className="flex gap-2 items-center">
              <FaInstagram className="w-4 h-4 text-brand-light" /> Daily prompts
            </li>
            <li className="flex gap-2 items-center">
              <FaTelegram className="w-4 h-4 text-brand-light" /> Community access
            </li>
          </ul>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="text-sm font-semibold hover:underline underline-offset-4"
          >
            Prefer to just read the blog? Start here →
          </Link>
        </div>
      </div>
    </div>
  );
}