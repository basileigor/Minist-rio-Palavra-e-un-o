/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MemberStatus, MinisterialRole } from '../types/church.ts';

export function calculateAge(birthDateStr?: string): number {
  if (!birthDateStr) return 0;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '—';
  // Handle YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('pt-BR');
}

export function formatDateTimeBR(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCPF(cpf?: string, mask: boolean = false): string {
  if (!cpf) return 'Não informado';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  if (mask) {
    return `***.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-**`;
  }
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

export function formatPhone(phone?: string): string {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function formatCEP(cep?: string): string {
  if (!cep) return '—';
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  return cep;
}

export function getStatusStyle(status: MemberStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case 'Membro Ativo':
      return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-700', border: 'border-emerald-300' };
    case 'Novo Convertido':
      return { bg: 'bg-sky-50 text-sky-800 border-sky-200', text: 'text-sky-700', border: 'border-sky-300' };
    case 'Congregado':
      return { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: 'text-blue-700', border: 'border-blue-300' };
    case 'Membro em Integração':
      return { bg: 'bg-amber-50 text-amber-800 border-amber-200', text: 'text-amber-700', border: 'border-amber-300' };
    case 'Visitante':
      return { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', text: 'text-indigo-700', border: 'border-indigo-300' };
    case 'Membro Afastado':
      return { bg: 'bg-rose-50 text-rose-800 border-rose-200', text: 'text-rose-700', border: 'border-rose-300' };
    case 'Membro Transferido':
      return { bg: 'bg-purple-50 text-purple-800 border-purple-200', text: 'text-purple-700', border: 'border-purple-300' };
    case 'Membro Desligado':
      return { bg: 'bg-slate-100 text-slate-800 border-slate-300', text: 'text-slate-700', border: 'border-slate-400' };
    case 'Membro Falecido':
      return { bg: 'bg-zinc-100 text-zinc-700 border-zinc-300', text: 'text-zinc-600', border: 'border-zinc-400' };
    default:
      return { bg: 'bg-slate-50 text-slate-700 border-slate-200', text: 'text-slate-600', border: 'border-slate-300' };
  }
}

export function getRoleBadgeStyle(role: MinisterialRole): { bg: string; text: string } {
  switch (role) {
    case 'Pastor Presidente':
    case 'Bispo':
    case 'Apóstolo':
      return { bg: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold', text: 'text-amber-900' };
    case 'Pastor':
    case 'Pastor Auxiliar':
      return { bg: 'bg-indigo-100 text-indigo-900 border border-indigo-200 font-semibold', text: 'text-indigo-800' };
    case 'Evangelista':
    case 'Missionário':
      return { bg: 'bg-purple-100 text-purple-900 border border-purple-200', text: 'text-purple-800' };
    case 'Presbítero':
      return { bg: 'bg-blue-100 text-blue-900 border border-blue-200', text: 'text-blue-800' };
    case 'Diácono':
    case 'Diaconisa':
      return { bg: 'bg-teal-100 text-teal-900 border border-teal-200', text: 'text-teal-800' };
    case 'Cooperador':
    case 'Auxiliar':
      return { bg: 'bg-slate-100 text-slate-800 border border-slate-200', text: 'text-slate-800' };
    default:
      return { bg: 'bg-slate-50 text-slate-600 border border-slate-200', text: 'text-slate-600' };
  }
}

export function getAgeCategory(age: number): string {
  if (age <= 11) return 'Crianças (0-11)';
  if (age <= 17) return 'Adolescentes (12-17)';
  if (age <= 29) return 'Jovens (18-29)';
  if (age <= 59) return 'Adultos (30-59)';
  return 'Terceira Idade (60+)';
}

/**
 * Exports data to CSV/Excel with UTF-8 BOM so Excel opens accented characters seamlessly
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number | undefined)[][]): void {
  const csvContent =
    '\uFEFF' + // UTF-8 BOM
    headers.join(';') +
    '\n' +
    rows
      .map((row) =>
        row
          .map((field) => {
            if (field === undefined || field === null) return '""';
            const str = String(field).replace(/"/g, '""');
            return `"${str}"`;
          })
          .join(';')
      )
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
