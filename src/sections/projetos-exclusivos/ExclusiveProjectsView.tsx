import Image from "next/image";
import Link from "next/link";
import React from "react";

import type { ExclusiveProjectsContent } from "@/lib/exclusive-projects-content";
import { resolveExclusiveProjectImageUrl } from "@/lib/exclusive-projects-content";

import { FinalShowcaseSection } from "./FinalShowcaseSection";
import { TechAutomationSection } from "./TechAutomationSection";

type Props = {
  content: ExclusiveProjectsContent;
};

export function ExclusiveProjectsView({ content }: Props) {
  const { header, services, partners, process, bottomCta } = content;

  return (
    <div className="w-full">
      <header className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">{header.title}</h1>
        <p className="mt-2 max-w-3xl text-zinc-700 dark:text-zinc-300">{header.subtitle}</p>
      </header>

      <section aria-labelledby="o-que-fazemos" className="mt-6">
        <h2
          id="o-que-fazemos"
          className="text-xl font-semibold tracking-tight"
        >
          {services.sectionTitle}
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.items.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border p-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
            >
              <h3 className="text-base font-medium">{s.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="parceiros" className="mt-12">
        <div className="flex items-end justify-between">
          <div>
            <h2 id="parceiros" className="text-xl font-semibold tracking-tight">
              {partners.sectionTitle}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {partners.sectionSubtitle}
            </p>
          </div>
          <Link
            href="/contato"
            className="hidden rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black sm:inline-flex"
          >
            {partners.ctaLabel}
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {partners.items.map((p) => (
            <div
              key={p.name}
              className="flex items-center justify-center rounded-lg border bg-white p-4 dark:bg-zinc-950"
              title={p.name}
            >
              <Image
                src={resolveExclusiveProjectImageUrl(p.imageUrl)}
                alt={p.name}
                width={160}
                height={64}
                className="h-10 w-auto grayscale opacity-80 transition hover:grayscale-0 hover:opacity-100"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 sm:hidden">
          <Link
            href="/contato"
            className="inline-flex rounded-md bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            {partners.ctaLabel}
          </Link>
        </div>
      </section>

      <section aria-labelledby="processo" className="mt-12">
        <h2 id="processo" className="text-xl font-semibold tracking-tight">
          {process.sectionTitle}
        </h2>
        <ol className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {process.steps.map((step, stepIdx) => (
            <li key={`${stepIdx}-${step.title}`} className="rounded-xl border p-5">
              <div className="text-xs uppercase tracking-wide text-zinc-500">
                {step.stageLabel}
              </div>
              <h3 className="mt-1 text-base font-medium">{step.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {step.desc}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <TechAutomationSection tech={content.tech} />

      <FinalShowcaseSection showcase={content.showcase} />

      <section className="mt-12 rounded-2xl border p-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold">{bottomCta.title}</h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {bottomCta.subtitle}
            </p>
          </div>
          <Link
            href="/contato"
            className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black"
          >
            {bottomCta.buttonLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
