"use client";

import { motion } from "framer-motion";
import PropertyCard from "@/components/cards/PropertyCard";
import type { Property } from "@/types/realEstate";

type Props = {
  properties: Property[];
};

export default function FeaturedProperties({ properties }: Props) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Destaques</h2>
      </div>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.08 },
          },
        }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {properties.map((p) => (
          <motion.div
            key={p.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <PropertyCard property={p} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
