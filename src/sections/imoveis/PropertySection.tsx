import Link from "next/link";
import PropertyCard from "@/components/cards/PropertyCard";
import type { Property } from "@/types/realEstate";

type Props = {
  title: string;
  href: string;
  properties: Property[];
};

export default function PropertySection({ title, href, properties }: Props) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Link
          href={href}
          className="text-sm text-zinc-700 hover:text-black underline-offset-4 hover:underline dark:text-zinc-300 dark:hover:text-white"
        >
          Ver todos
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {properties.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </section>
  );
}
