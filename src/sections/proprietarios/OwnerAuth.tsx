'use client';

import React from 'react';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-number-input';
import type { Labels } from 'react-phone-number-input';
import ptBR from 'react-phone-number-input/locale/pt-BR.json';
import 'react-phone-number-input/style.css';

import { fetchWarehouses, type WarehouseDto } from '@/lib/sax-api';

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function maskCpf(digits: string) {
  const d = digits.slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskCnpj(digits: string) {
  const d = digits.slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatDocDigits(digits: string, docType: string) {
  return docType === 'CNPJ' ? maskCnpj(digits) : maskCpf(digits);
}

function getApiBase() {
  return (process.env.NEXT_PUBLIC_SAX_API_URL ?? '').trim().replace(/\/$/, '');
}

export default function OwnerAuth() {
  const [loading, setLoading] = React.useState(false);

  const [requestName, setRequestName] = React.useState('');
  const [requestEmail, setRequestEmail] = React.useState('');
  const [requestPhone, setRequestPhone] = React.useState('');
  const [requestDocType, setRequestDocType] = React.useState('CPF');
  const [requestDoc, setRequestDoc] = React.useState('');
  const [requestNote, setRequestNote] = React.useState('');

  const [warehouses, setWarehouses] = React.useState<WarehouseDto[]>([]);
  const [warehouseId, setWarehouseId] = React.useState('');
  const [warehouseLoading, setWarehouseLoading] = React.useState(true);

  const apiBase = getApiBase();

  React.useEffect(() => {
    let mounted = true;

    async function loadWarehouse() {
      setWarehouseLoading(true);
      const list = await fetchWarehouses();
      if (!mounted) return;
      setWarehouses(list);
      const activeWarehouse =
        list.find((item) => item.display === '1') || list[0] || null;
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

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!apiBase) {
      toast.error('Configuração incompleta', {
        description: 'Defina NEXT_PUBLIC_SAX_API_URL no ambiente.',
      });
      return;
    }
    if (warehouseLoading) {
      toast.warning('Aguarde um instante', {
        description: 'Estamos carregando a imobiliária padrão. Tente de novo em segundos.',
      });
      return;
    }
    if (!warehouseId) {
      toast.error('Imobiliária não encontrada', {
        description: 'Não foi possível localizar uma imobiliária ativa para receber a solicitação.',
      });
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
          cpf_cnpj: digitsOnly(requestDoc),
          observacoes: requestNote,
          warehouse_id: warehouseId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error('Não foi possível enviar', {
          description: data?.message || 'Verifique os dados e tente novamente.',
        });
        return;
      }
      toast.success('Solicitação enviada', {
        description: 'Sua solicitação foi recebida. Aguarde a análise e aprovação da equipe SAX.',
        duration: 6000,
      });
      resetRequest();
    } catch {
      toast.error('Falha de conexão', {
        description: 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 md:mx-auto md:p-10 lg:min-w-[28rem] lg:max-w-[28rem] lg:w-[28rem]">
      <h2 className="mb-1 text-center text-lg font-semibold text-zinc-900 dark:text-white">
        Solicitar acesso
      </h2>
      <p className="mb-6 text-center text-xs text-zinc-600 dark:text-zinc-400">
        Envie seus dados para análise e aprovação da equipe SAX.
      </p>
      <form onSubmit={handleRequest} className="space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
            Imobiliária
          </label>
          <select
            required
            value={warehouseId}
            onChange={(e) => setWarehouseId(e.target.value)}
            disabled={warehouseLoading || warehouses.length === 0}
            className="h-11 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900"
          >
            {warehouses.length === 0 && !warehouseLoading ? (
              <option value="">Nenhuma imobiliária disponível</option>
            ) : (
              [
                <option key="placeholder" value="" disabled={warehouseLoading}>
                  {warehouseLoading ? 'Carregando imobiliárias...' : 'Selecione a imobiliária'}
                </option>,
                ...warehouses.map((w) => (
                  <option key={w.warehouse_id} value={w.warehouse_id}>
                    {`${w.warehouse_code} - ${w.warehouse_name}`.toUpperCase()}
                  </option>
                )),
              ]
            )}
          </select>
          <p className="mt-1 text-[10px] text-zinc-500">
            A solicitação será enviada para a equipe da imobiliária escolhida.
          </p>
        </div>
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
          <div className="min-w-0 sm:col-span-2">
            <label
              htmlFor="owner-request-phone-input"
              className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300"
            >
              Telefone
            </label>
            <PhoneInput
              international
              defaultCountry="BR"
              value={requestPhone}
              onChange={(value) => setRequestPhone(value ?? '')}
              labels={ptBR as Labels}
              limitMaxLength
              placeholder="Número com DDD ou código do país"
              numberInputProps={{
                id: 'owner-request-phone-input',
                'aria-label': 'Número de telefone',
                className:
                  '!min-h-0 min-w-0 flex-1 border-0 bg-transparent px-1 py-1.5 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:ring-0 dark:text-zinc-100 dark:placeholder:text-zinc-500',
              }}
              countrySelectProps={{
                'aria-label': 'País do telefone',
                className: 'cursor-pointer',
              }}
              className="flex h-11 w-full min-w-0 items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-800 dark:bg-zinc-900"
              style={{ ['--PhoneInput-color--focus' as string]: '#71717a' }}
            />
            <p className="mt-1 text-[10px] text-zinc-500">
              Selecione o país e digite o número; o formato é aplicado automaticamente.
            </p>
          </div>
          <div className="min-w-0">
            <label className="mb-1 block text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
              Tipo de Documento
            </label>
            <select
              value={requestDocType}
              onChange={(e) => {
                const next = e.target.value;
                setRequestDocType(next);
                const d = digitsOnly(requestDoc);
                setRequestDoc(
                  formatDocDigits(next === 'CNPJ' ? d : d.slice(0, 11), next)
                );
              }}
              className="h-11 w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:ring dark:border-zinc-800 dark:bg-zinc-900"
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
            inputMode="numeric"
            autoComplete="off"
            value={requestDoc}
            onChange={(e) => {
              const raw = digitsOnly(e.target.value);
              const max = requestDocType === 'CNPJ' ? 14 : 11;
              setRequestDoc(formatDocDigits(raw.slice(0, max), requestDocType));
            }}
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
          className="mt-2 h-11 w-full cursor-pointer rounded-md bg-zinc-900 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? 'Enviando...' : 'Solicitar acesso'}
        </button>
      </form>
      <p className="mt-4 text-center text-[10px] text-zinc-500">V1.0.0</p>
    </div>
  );
}
