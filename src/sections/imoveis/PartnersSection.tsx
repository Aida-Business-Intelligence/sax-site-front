import Image from "next/image";

const logos = [
  "/assets/partners/partner-1.png",
  "/assets/partners/partner-2.png",
  "/assets/partners/partner-3.png",
  "/assets/partners/partner-4.png",
  "/assets/partners/partner-5.png",
  "/assets/partners/partner-6.png",
  "/assets/partners/partner-7.png",
  "/assets/partners/partner-8.png",
];

export default function PartnersSection() {
  const line = [...logos, ...logos];
  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight">
            Nossos <span className="text-[#19F5CC]">Parceiros</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Trabalhamos com as principais construtoras e incorporadoras do mercado
          </p>
        </div>

        <div className="logo-rail relative mt-8 overflow-hidden">
          <div className="logo-track flex items-center gap-16 will-change-transform">
            {line.map((src, i) => (
              <div key={`${src}-${i}`} className="shrink-0">
                <Image
                  src={src}
                  alt="Parceiro"
                  width={220}
                  height={80}
                  className="h-12 w-auto grayscale opacity-70 transition hover:grayscale-0 hover:opacity-100"
                />
              </div>
            ))}
          </div>
          {/* Fade edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent dark:from-zinc-950" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent dark:from-zinc-950" />
        </div>
      </div>
    </section>
  );
}


