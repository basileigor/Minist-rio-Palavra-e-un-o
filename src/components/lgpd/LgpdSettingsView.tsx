/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  FileText,
  UserCheck,
  Download,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { formatDateTimeBR, formatDateBR } from '../../utils/formatters.ts';

export const LgpdSettingsView: React.FC = () => {
  const { settings, updateSettings, members, currentUserRole } = useChurch();

  const [dpoName, setDpoName] = useState(settings.lgpdDpoName);
  const [dpoEmail, setDpoEmail] = useState(settings.lgpdDpoEmail);
  const [retentionYears, setRetentionYears] = useState(settings.retentionYears);
  const [allowSelfService, setAllowSelfService] = useState(settings.allowSelfServiceUpdate);

  const [subjectSearchId, setSubjectSearchId] = useState('');
  const [exportedSubjectData, setExportedSubjectData] = useState<string | null>(null);

  // Aggregate audit logs
  const allAuditLogs = members.flatMap((m) =>
    (m.auditLogs || []).map((log) => ({
      ...log,
      memberName: m.fullName,
      memberId: m.id,
    }))
  ).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      lgpdDpoName: dpoName,
      lgpdDpoEmail: dpoEmail,
      retentionYears: Number(retentionYears),
      allowSelfServiceUpdate: allowSelfService,
    });
    alert('Configurações de governança LGPD atualizadas com sucesso!');
  };

  const handleExportSubjectData = () => {
    if (!subjectSearchId) return;
    const member = members.find((m) => m.id === subjectSearchId);
    if (!member) return;

    const dataObj = {
      titular: member.fullName,
      matricula: member.registrationNumber,
      cpf: member.cpf,
      baseLegal: member.lgpdLegalBasis,
      dataConsentimento: member.lgpdConsentDate,
      dadosPessoais: {
        nascimento: member.birthDate,
        contato: member.primaryPhone,
        email: member.email,
        endereco: `${member.street}, ${member.number} - ${member.neighborhood}, ${member.city}/${member.state}`,
      },
      dadosReligiososESacramentais: {
        situacao: member.currentStatus,
        cargo: member.currentMinisterialRole,
        batismoAguas: member.isWaterBaptized,
        dataBatismo: member.waterBaptismDate,
        batismoEspiritoSanto: member.hasHolySpiritBaptism,
      },
      historicoAuditoria: member.auditLogs,
    };

    setExportedSubjectData(JSON.stringify(dataObj, null, 2));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Governança de Dados Pessoais & Privacidade LGPD
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Salvaguardas para dados pessoais sensíveis de convicção religiosa (Art. 11, II, c) e gestão de consentimentos.
          </p>
        </div>
      </div>

      {/* Legal Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Dados Religiosos Sensíveis</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Informações que revelam convicção religiosa são dados pessoais sensíveis (Art. 5º, II).
            O tratamento é legitimado pelo <strong>Art. 11, II, "c"</strong> para órgãos e entidades sem fins lucrativos e fins religiosos.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Direitos dos Titulares</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Garantia de confirmação de existência de tratamento, acesso facilitado, retificação de dados incorretos, anonimização e portabilidade conforme o Art. 18.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Retenção & Sigilo Pastoral</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Registros íntimos de aconselhamento pastoral recebem nível de proteção estrito com acesso restrito a pastores e retenção documental programada.
          </p>
        </div>
      </div>

      {/* DPO & Institutional Settings Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Encarregado de Dados (DPO) & Diretrizes de Retenção
        </h2>

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nome do Encarregado pelo Tratamento de Dados (DPO)
            </label>
            <input
              type="text"
              value={dpoName}
              onChange={(e) => setDpoName(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Canal Oficial de Atendimento / E-mail do DPO
            </label>
            <input
              type="email"
              value={dpoEmail}
              onChange={(e) => setDpoEmail(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Período de Retenção de Histórico de Membros Desligados (Anos)
            </label>
            <input
              type="number"
              value={retentionYears}
              onChange={(e) => setRetentionYears(Number(e.target.value))}
              className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
            />
          </div>

          <div className="pt-4">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
              <input
                type="checkbox"
                checked={allowSelfService}
                onChange={(e) => setAllowSelfService(e.target.checked)}
                className="rounded text-emerald-600"
              />
              <span>Permitir que o membro solicite atualização cadastral online</span>
            </label>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Salvar Diretrizes de Privacidade
            </button>
          </div>
        </form>
      </div>

      {/* Subject Rights Request Tool (Export Data) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Download className="w-4 h-4 text-amber-600" />
          <span>Exercício dos Direitos do Titular — Exportação Transparente de Dados</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 text-xs">
          <select
            value={subjectSearchId}
            onChange={(e) => setSubjectSearchId(e.target.value)}
            className="w-full sm:w-80 p-2 border border-slate-200 rounded-lg text-slate-900 font-medium"
          >
            <option value="">Selecione o membro solicitante...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.registrationNumber})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportSubjectData}
            disabled={!subjectSearchId}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs disabled:opacity-50"
          >
            Gerar Extrato dos Dados Tratados (JSON/Legível)
          </button>
        </div>

        {exportedSubjectData && (
          <div className="mt-4 p-4 bg-slate-900 text-amber-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-72">
            <pre>{exportedSubjectData}</pre>
          </div>
        )}
      </div>

      {/* System Audit Log Explorer */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">
            Registro Geral de Auditoria do Sistema ({allAuditLogs.length} eventos)
          </h2>
          <span className="text-xs text-slate-400">Trilha imutável de acessos e operações</span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase font-semibold">
                <th className="py-2.5 px-3">Data / Hora</th>
                <th className="py-2.5 px-3">Operador / Perfil</th>
                <th className="py-2.5 px-3">Ação</th>
                <th className="py-2.5 px-3">Membro Afetado</th>
                <th className="py-2.5 px-3">Base Legal Declarada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                  <td className="py-2.5 px-3 text-slate-500">{formatDateTimeBR(log.timestamp)}</td>
                  <td className="py-2.5 px-3 text-slate-800 font-semibold">{log.userName}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-sans font-medium text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-sans">{log.memberName}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans text-[10px] truncate max-w-[200px]" title={log.legalBasis}>
                    {log.legalBasis}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
