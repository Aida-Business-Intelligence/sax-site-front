import LeadForm from "@/components/forms/LeadForm";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contato",
  canonical: "/contato",
  description: "Fale com um especialista e receba atendimento consultivo.",
});

export const dynamic = "force-dynamic"; // SSR

export default function ContatoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold">Fale com a gente</h1>
      <LeadForm context={{ ref: "contato_page" }} />
    </div>
  );
}
