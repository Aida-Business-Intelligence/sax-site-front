import React from "react";

type Props = {
  context?: Record<string, unknown>;
};

export default function LeadForm({ context }: Props) {
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Placeholder submit; integrate with backend later
    console.log("Lead form submit", Object.fromEntries(new FormData(e.currentTarget)), context);
    alert("Mensagem enviada! Em breve entraremos em contato.");
    e.currentTarget.reset();
  }
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        name="name"
        required
        placeholder="Seu nome"
        className="w-full rounded-md border px-3 py-2"
      />
      <input
        name="phone"
        placeholder="Seu telefone"
        className="w-full rounded-md border px-3 py-2"
      />
      <textarea
        name="message"
        placeholder="Como podemos ajudar?"
        className="w-full rounded-md border px-3 py-2"
        rows={4}
      />
      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-800"
      >
        Enviar
      </button>
    </form>
  );
}


