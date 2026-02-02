'use client';

import React from "react";
import { useSearchParams } from "next/navigation";

type Mode = "signin" | "signup";

type OwnerAccount = {
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

const STORAGE_KEY = "owner.accounts.v1";

function readAccounts(): OwnerAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as OwnerAccount[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: OwnerAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export default function OwnerAuth() {
  const params = useSearchParams();
  const initial: Mode = (params.get("auth") as Mode) === "signup" ? "signup" : "signin";
  const [mode, setMode] = React.useState<Mode>(initial);
  const [loading, setLoading] = React.useState(false);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [store, setStore] = React.useState(readAccounts());

  React.useEffect(() => {
    setStore(readAccounts());
  }, []);

  function reset() {
    setName("");
    setEmail("");
    setPassword("");
  }

  function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password || !name) return;
    setLoading(true);
    setTimeout(() => {
      const exists = store.some((a) => a.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        alert("Este e-mail já possui cadastro.");
        setLoading(false);
        return;
      }
      const acc: OwnerAccount = {
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
      };
      const next = [acc, ...store];
      writeAccounts(next);
      setStore(next);
      setLoading(false);
      alert("Conta criada com sucesso! Você já pode entrar.");
      reset();
      setMode("signin");
    }, 500);
  }

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      const found = store.find(
        (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
      );
      setLoading(false);
      if (!found) {
        alert("E-mail ou senha inválidos.");
        return;
      }
      alert(`Bem-vindo, ${found.name}! (mock)`);
      reset();
    }, 400);
  }

  return (
    <div className="w-full p-6 md:p-10 md:max-w-240 md:min-h-130 rounded-2xl border border-zinc-200 bg-white/90 shadow-xl backdrop-blur-md ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900/80">
      <h2 className="mb-1 text-center text-lg font-semibold text-zinc-900 dark:text-white">
        {mode === "signin" ? "Bem-vindo!" : "Criar conta"}
      </h2>
      <p className="mb-6 text-center text-xs text-zinc-600 dark:text-zinc-400">
        {mode === "signin"
          ? "Acesse sua conta de proprietário."
          : "Cadastre-se para anunciar seu imóvel com a SAX."}
      </p>

      {mode === "signup" ? (
        <form onSubmit={handleSignUp} className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              Nome completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
            Já tem conta?{" "}
            <button type="button" onClick={() => setMode("signin")} className="underline">
              Entrar
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleSignIn} className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              required
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => alert("Recuperação de senha (mock).")}
              className="text-zinc-600 underline dark:text-zinc-400"
            >
              Esqueci a senha
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
            Novo por aqui?{" "}
            <button type="button" onClick={() => setMode("signup")} className="underline">
              Cadastre-se
            </button>
          </p>
        </form>
      )}
      <p className="mt-4 text-center text-[10px] text-zinc-500">V1.0.0</p>
    </div>
  );
}

