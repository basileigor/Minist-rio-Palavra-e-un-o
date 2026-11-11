/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Upload,
  Download,
  RotateCcw,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Shield,
  FileCheck,
  KeyRound,
  Globe,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Send,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';

export const SettingsBackupView: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportFullDatabaseJSON,
    importFullDatabaseJSON,
    importMembersFromCSV,
    resetToDefaultData,
    members,
    congregations,
    currentUserRole,
    setActiveView,
    adminUser,
    setShowAdminCredentialsModal,
  } = useChurch();

  const [formData, setFormData] = useState({ ...settings });
  const [csvInput, setCsvInput] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const officialPresentationUrl = 'https://membrospalavraeuncao.vercel.app';
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : officialPresentationUrl;

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  // Security barrier: only Admin Geral can view or modify
  if (currentUserRole !== 'ADMIN_GERAL') {
    return (
      <div className="max-w-xl mx-auto my-12 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Acesso Exclusivo: Administrador Geral</h2>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Este módulo é restrito. Apenas o perfil <strong>Admin Geral</strong> possui autorização para visualizar, alterar configurações institucionais e realizar cópias de segurança (backup e restauração).
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          Voltar ao Dashboard Geral
        </button>
      </div>
    );
  }

  const handleSaveInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    alert('Informações institucionais salvas com sucesso!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importFullDatabaseJSON(content);
      if (success) {
        alert('Banco de dados restaurado com sucesso!');
      } else {
        alert('Erro ao processar o arquivo de backup. Verifique se o formato JSON é válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportCSVData = () => {
    if (!csvInput.trim()) return;

    try {
      // Simple parser: lines with name, phone, role
      const lines = csvInput.trim().split('\n');
      const parsedMembers: any[] = [];

      lines.forEach((line) => {
        const parts = line.split(/[;,]/);
        if (parts.length >= 1 && parts[0].trim()) {
          parsedMembers.push({
            fullName: parts[0].trim(),
            primaryPhone: parts[1]?.trim() || '(21) 90000-0000',
            currentMinisterialRole: parts[2]?.trim() || 'Membro',
            currentStatus: 'Membro Ativo',
            birthDate: '1990-01-01',
            admissionDate: new Date().toISOString().split('T')[0],
          });
        }
      });

      const count = importMembersFromCSV(parsedMembers);
      setImportStatus(`${count} novo(s) membro(s) importado(s) com sucesso para o banco de dados!`);
      setCsvInput('');
    } catch (err) {
      alert('Erro ao interpretar os dados digitados.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Configurações Institucionais & Backup
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personalização da instituição, parametrizações e controle de segurança de cópias de segurança.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/90 rounded-lg text-amber-900 text-xs font-semibold shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Exclusivo: Admin Geral</span>
          </div>
          <button
            onClick={exportFullDatabaseJSON}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Backup Completo (JSON)</span>
          </button>
        </div>
      </div>

      {/* Database Snapshot Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Membros no Banco</span>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{members.length} registros</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Congregações Ativas</span>
          <div className="text-2xl font-bold font-mono text-amber-800 mt-1">{congregations.length} filiais</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Armazenamento Local</span>
          <div className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Persistência Automática Ativa</span>
          </div>
        </div>
      </div>

      {/* Admin Geral Credentials Security Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-white p-5 rounded-xl border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Credenciais de Acesso do Admin Geral (Login & Senha)
            </h2>
            <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
              <span>Usuário: <strong className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">{adminUser.username}</strong></span>
              <span>·</span>
              <span>E-mail: <strong className="text-slate-800">{adminUser.email}</strong></span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">● Senha Ativa e Protegida</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAdminCredentialsModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>Cadastrar / Alterar Senha</span>
        </button>
      </div>

      {/* Official Link Presentation Section: membrospalavraeuncao */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-50/60 to-white p-5 rounded-xl border border-emerald-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Link de Apresentação Definitiva ao Usuário Final
                </h2>
                <span className="font-mono text-[11px] font-bold text-emerald-950 bg-emerald-200 px-2 py-0.5 rounded">
                  membrospalavraeuncao
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Endereço oficial e institucional para divulgação, envio aos membros e liderança.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                'Acesse o Sistema de Gestão de Membros do Ministério Palavra e Unção através do link oficial: ' + officialPresentationUrl
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
            <a
              href={officialPresentationUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Apresentação</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60">
          <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Link Oficial na Nuvem (Vercel):</span>
              <span className="text-emerald-700 font-mono">Principal</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono text-xs font-bold text-slate-800 truncate select-all">
                {officialPresentationUrl}
              </span>
              <button
                onClick={() => handleCopy(officialPresentationUrl)}
                className="px-2.5 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
              <span>Ambiente Ativo de Desenvolvimento / Demonstração:</span>
              <span className="text-slate-600 font-mono">Online</span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono text-xs text-slate-700 truncate select-all">
                {currentUrl}
              </span>
              <button
                onClick={() => handleCopy(currentUrl)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <Copy className="w-3 h-3 text-slate-500" />
                <span>Copiar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Institutional Settings Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>Dados Oficiais da Instituição Religiosa</span>
        </h2>

        <form onSubmit={handleSaveInstitution} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Razão Social / Nome da Igreja *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">CNPJ</label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Pastor Presidente Geral</label>
            <input
              type="text"
              value={formData.seniorPastorPresident}
              onChange={(e) => setFormData({ ...formData, seniorPastorPresident: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Lema / Versículo Institucional</label>
            <input
              type="text"
              value={formData.motto}
              onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Endereço da Sede Geral</label>
            <input
              type="text"
              value={formData.headquartersAddress}
              onChange={(e) => setFormData({ ...formData, headquartersAddress: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Telefone Principal</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">E-mail da Secretaria</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
            >
              Salvar Dados Institucionais
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Restore Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Restore Backup */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Upload className="w-4 h-4 text-amber-600" />
            <span>Restaurar Cópia de Segurança (JSON)</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Selecione um arquivo de backup previamente gerado (.json) para restaurar todos os membros, congregações, prontuários e ordenações.
          </p>

          <label className="block mt-2">
            <span className="sr-only">Escolher arquivo de backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer"
            />
          </label>
        </div>

        {/* Reset Default Data */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Redefinir Dados de Demonstração</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Restaura o sistema para a base de dados padrão oficial do Ministério Palavra e Unção, contendo o prontuário pastoral e o corpo de obreiros.
          </p>
          <button
            onClick={() => {
              if (confirm('Tem certeza que deseja restaurar os dados originais de demonstração?')) {
                resetToDefaultData();
                alert('Dados redefinidos com sucesso!');
              }
            }}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            Restaurar Dados Padrão
          </button>
        </div>
      </div>

      {/* Fast Excel / CSV Importer */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Importação Rápida de Cadastros (Planilhas Excel / CSV)</span>
        </h2>

        <p className="text-xs text-slate-500 leading-relaxed">
          Cole abaixo linhas no formato: <code>Nome Completo; Telefone; Cargo Ministerial</code> (uma pessoa por linha) para importação em lote para a base da igreja:
        </p>

        <textarea
          rows={4}
          value={csvInput}
          onChange={(e) => setCsvInput(e.target.value)}
          placeholder={`Exemplo:\nJoão Ferreira da Silva; (21) 98765-4321; Membro\nPriscila Andrade Costa; (21) 99887-1122; Diaconisa`}
          className="w-full p-3 text-xs border border-slate-200 rounded-lg font-mono text-slate-800"
        />

        <div className="flex items-center justify-between">
          <button
            onClick={handleImportCSVData}
            disabled={!csvInput.trim()}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs disabled:opacity-50"
          >
            Processar e Importar Linhas
          </button>

          {importStatus && (
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{importStatus}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
