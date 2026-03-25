import Image from "next/image";
import Link from "next/link";
import React from "react";

import type { ExclusiveProjectsContent } from "@/lib/exclusive-projects-content";
import { resolveExclusiveProjectImageUrl } from "@/lib/exclusive-projects-content";

type Props = {
  tech: ExclusiveProjectsContent["tech"];
};

export function TechAutomationSection({ tech }: Props) {
  return (
    <section className="mt-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src={resolveExclusiveProjectImageUrl(tech.logoUrl)}
              alt={tech.logoAlt}
              width={160}
              height={60}
              className="h-12 w-auto"
            />
          </div>

          <p className="mt-4 text-sm text-zinc-700 dark:text-zinc-300">
            {tech.paragraph1}
          </p>
          <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
            {tech.paragraph2}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ul className="space-y-2 text-sm">
              {tech.listLeft.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[2px] text-[#19F5CC]">✔</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
            <ul className="space-y-2 text-sm">
              {tech.listRight.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-[2px] text-[#19F5CC]">✔</span>
                  <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <Link
              href="/contato"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2 text-sm font-medium text-white shadow hover:bg-emerald-600"
            >
              {tech.ctaLabel}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border p-8">
          {tech.features.map((f, i) => (
            <React.Fragment key={`${f.title}-${i}`}>
              {i > 0 ? <div className="my-6 h-px w-full bg-zinc-200 dark:bg-zinc-800" /> : null}
              <Feature icon={f.icon} title={f.title} desc={f.desc} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="grid grid-cols-[32px_1fr] items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-base dark:bg-emerald-900/40">
        <span aria-hidden>{icon}</span>
      </div>
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
      </div>
    </div>
  );
}
