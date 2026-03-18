'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';

import { fetchWarehouses } from '@/lib/sax-api';

type Mode = 'signin' | 'request';

function getApiBase() {
  return (process.env.NEXT_PUBLIC_SAX_API_URL ?? '').trim().replace(/\/$/, '');
}

function getDetectedSubdomain() {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (!hostname || hostname === 'localhost') return '';
  const [subdomain] = hostname.split('.');
  if (!subdomain || subdomain === 'www') return '';
  return subdomain;
}

export default function OwnerAuth() {
  const params = useSearchParams();
  const initial: Mode = (params.get('auth') as Mode) === 'request' ? 'request' : 'signin';
  const [mode, setMode] = React.useState<Mode>(initial);
  const [loading, setLoading] = React.useState(false);

  const [requestName, setRequestName] = React.useState('');
  const [requestEmail, setRequestEmail] = React.useState('');
  const [requestPhone, setRequestPhone] = React.useState('');
  const [requestDocType, setRequestDocType] = React.useState('CPF');
  const [requestDoc, setRequestDoc] = React.useState('');
  const [requestNote, setRequestNote] = React.useState('');

  const [loginEmail, setLoginEmail] = React.useState('');
  const [loginPassword, setLoginPassword] = React.useState('');
  const [loginSubdomain, setLoginSubdomain] = React.useState(getDetectedSubdomain());
  const [warehouseId, setWarehouseId] = React.useState('');
  const [warehouseLoading, setWarehouseLoading] = React.useState(true);

  const apiBase = getApiBase();

  React.useEffect(() => {
    setLoginSubdomain(getDetectedSubdomain());
  }, []);

  React.useEffect(() => {
    let mounted = true;

    async function loadWarehouse() {
      setWarehouseLoading(true);
      const warehouses = await fetchWarehouses();
      if (!mounted) return;
      const activeWarehouse =
        warehouses.find((item) => item.display === '1') || warehouses[0] || null;
      setWarehouseId(activeWarehouse?.warehouse_id ?? '');
      setWarehouseLoading(false);
    }

    loadWarehouse();

    return () => {
      mounted = false;
    };
  }, []);

  function resetRequest() {
    setRequestName('');
    setRequestEmail('');
    setRequestPhone('');
    setRequestDocType('CPF');
    setRequestDoc('');
    setRequestNote('');
  }

  function resetLogin() {
    setLoginEmail('');
    setLoginPassword('');
  }

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!apiBase) {
      alert('Configure NEXT_PUBLIC_SAX_API_URL.');
      return;
    }
    if (warehouseLoading) {
      alert('Carregando a imobiliária padrão. Tente novamente em instantes.');
      return;
    }
    if (!warehouseId) {
      alert('Não foi possível localizar uma imobiliária ativa para receber a solicitação.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/proprietarios/public/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: requestName,
          email: requestEmail,
          telefone: requestPhone,
          tipo_documento: requestDocType,
          cpf_cnpj: requestDoc,
          observacoes: requestNote,
          warehouse_id: warehouseId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.message || 'Não foi possível enviar sua solicitação.');
        return;
      }
      alert('Solicitação enviada com sucesso! Aguarde aprovação.');
      resetRequest();
      setMode('signin');
    } catch {
      alert('Não foi possível conectar ao backend.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!apiBase) {
      alert('Configure NEXT_PUBLIC_SAX_API_URL.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/proprietarios/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          subdomain: loginSubdomain || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data?.message || 'E-mail ou senha inválidos.');
        return;
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('owner.portal.token', data.token);
        window.localStorage.setItem('owner.portal.user', JSON.stringify(data.owner));
        window.localStorage.setItem(
          'owner.portal.mustChangePassword',
          data?.owner?.must_change_password ? '1' : '0'
        );
      }
      if (data?.owner?.must_change_password) {
        alert(`Bem-vindo, ${data?.owner?.nome || 'proprietário'}! Sua senha provisória precisa ser alterada no primeiro acesso.`);
      } else {
        alert(`Bem-vindo, ${data?.owner?.nome || 'proprietário'}!`);
      }
      resetLogin();
    } catch {
      alert('Não foi possível conectar ao backend.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full p-6 md:p-10 md:max-w-240 md:min-h-130 rounded-2xl border border-zinc-200 bg-white/90 shadow-xl backdrop-blur-md ring-1 ring-black/5 dark:border-zinc-800 dark:bg-zinc-900/80">
      <h2 className="mb-1 text-center text-lg font-semibold text-zinc-900 dark:text-white">
        {mode === 'signin' ? 'Bem-vindo!' : 'Solicitar acesso'}
      </h2>
      <p className="mb-6 text-center text-xs text-zinc-600 dark:text-zinc-400">
        {mode === 'signin'
          ? 'Acesse sua conta de proprietário.'
          : 'Envie seus dados para análise e aprovação da equipe SAX.'}
      </p>
      {mode === 'request' && warehouseId ? (
        <p className="mb-4 text-center text-[10px] text-zinc-500">
          Solicitação vinculada à imobiliária ativa.
        </p>
      ) : null}

      {mode === 'request' ? (
        <form onSubmit={handleRequest} className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              Nome completo
            </label>
            <input
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
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
              value={requestEmail}
              onChange={(e) => setRequestEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                Telefone
              </label>
              <input
                type="text"
                value={requestPhone}
                onChange={(e) => setRequestPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                Tipo de Documento
              </label>
              <select
                value={requestDocType}
                onChange={(e) => setRequestDocType(e.target.value)}
                className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              CPF/CNPJ
            </label>
            <input
              type="text"
              value={requestDoc}
              onChange={(e) => setRequestDoc(e.target.value)}
              placeholder={requestDocType === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              Observações
            </label>
            <textarea
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
              placeholder="Conte um pouco sobre o imóvel ou sua necessidade"
              className="min-h-24 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? 'Enviando...' : 'Solicitar acesso'}
          </button>
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
            Já tem acesso?{' '}
            <button type="button" onClick={() => setMode('signin')} className="underline">
              Entrar
            </button>
          </p>
        </form>
      ) : (
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              E-mail
            </label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
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
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              Subdomínio
            </label>
            <input
              type="text"
              value={loginSubdomain}
              onChange={(e) => setLoginSubdomain(e.target.value)}
              placeholder="Ex.: joao"
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
            />
          </div>
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => alert('Recuperação de senha será habilitada no portal do proprietário.')}
              className="text-zinc-600 underline dark:text-zinc-400"
            >
              Esqueci a senha
            </button>
            {getDetectedSubdomain() ? (
              <span className="text-zinc-500">Subdomínio detectado: {getDetectedSubdomain()}</span>
            ) : null}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-center text-xs text-zinc-600 dark:text-zinc-400">
            Novo por aqui?{' '}
            <button type="button" onClick={() => setMode('request')} className="underline">
              Solicitar acesso
            </button>
          </p>
        </form>
      )}
      <p className="mt-4 text-center text-[10px] text-zinc-500">V1.0.0</p>
    </div>
  );
}

