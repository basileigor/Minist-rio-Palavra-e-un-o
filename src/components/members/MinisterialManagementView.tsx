/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Users,
  ShieldCheck,
  Calendar,
  Plus,
  FileCheck,
  Building2,
  Download,
  AlertTriangle,
  X,
  Search,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { MinisterialRole, OrdinationInfo } from '../../types/church.ts';
import { formatDateBR, getRoleBadgeStyle, exportToCSV } from '../../utils/formatters.ts';

export const MinisterialManagementView: React.FC = () => {
  const { members, updateMember, congregations, setSelectedMemberId, setActiveView } = useChurch();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal to record new ordination
  const [showOrdinationModal, setShowOrdinationModal] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState('');
  const [newRole, setNewRole] = useState<MinisterialRole>('Diácono');
  const [ordinationDate, setOrdinationDate] = useState(new Date().toISOString().split('T')[0]);
  const [ordainingAuthority, setOrdainingAuthority] = useState('Pr. Samuel Oliveira dos Santos');
  const [ordainingChurch, setOrdainingChurch] = useState('Ministério Palavra e Unção');
  const [certificateNumber, setCertificateNumber] = useState('');
  const [ordinationNotes, setOrdinationNotes] = useState('');

  // All members with a ministerial role other than plain 'Membro'
  const ministerialRoll = members.filter((m) => m.currentMinisterialRole !== 'Membro');

  const filteredRoll = ministerialRoll.filter((m) => {
    if (roleFilter !== 'all' && m.currentMinisterialRole !== roleFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.registrationNumber.toLowerCase().includes(q) ||
        m.currentMinisterialRole.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Collect all ordinations across the church for institution timeline
  const allOrdinationsList = members.flatMap((m) =>
    (m.ordinations || []).map((ord) => ({
      ...ord,
      memberId: m.id,
      memberName: m.fullName,
      photoUrl: m.photoUrl,
    }))
  ).sort((a, b) => (a.ordinationDate < b.ordinationDate ? 1 : -1));

  const handleSaveOrdination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId) return;

    const targetMember = members.find((m) => m.id === targetMemberId);
    if (!targetMember) return;

    const newOrdination: OrdinationInfo = {
      id: `ord-${Date.now()}`,
      roleTitle: newRole,
      ordinationDate,
      ordainingChurch,
      ordainingAuthority,
      certificateNumber: certificateNumber || `ORD-${newRole.slice(0, 3).toUpperCase()}-${ordinationDate.slice(0, 4)}-${Math.floor(Math.random() * 900 + 100)}`,
      notes: ordinationNotes,
    };

    updateMember(
      targetMemberId,
      {
        currentMinisterialRole: newRole,
        ordinations: [newOrdination, ...targetMember.ordinations],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            date: ordinationDate,
            title: `Consagração / Ordenação: ${newRole}`,
            description: `Consagrado à função de ${newRole} por ${ordainingAuthority} na ${ordainingChurch}. Certificado nº ${newOrdination.certificateNumber}.`,
            category: 'ministerial',
            isAutomatic: true,
          },
          ...targetMember.timeline,
        ],
      },
      `Ordenação ao cargo de ${newRole}`
    );

    setShowOrdinationModal(false);
    setTargetMemberId('');
    setCertificateNumber('');
    setOrdinationNotes('');
  };

  const handleExportCSV = () => {
    const headers = [
      'Matrícula',
      'Nome do Obreiro',
      'Função / Cargo',
      'Congregação',
      'Total de Ordenações',
      'Última Ordenação',
      'Autoridade que Consagrou',
      'Credencial Ativa',
    ];

    const rows = filteredRoll.map((m) => {
      const cong = congregations.find((c) => c.id === m.currentCongregationId);
      const lastOrd = m.ordinations[0];
      return [
        m.registrationNumber,
        m.fullName,
        m.currentMinisterialRole,
        cong?.name || 'Sede',
        m.ordinations.length,
        lastOrd ? formatDateBR(lastOrd.ordinationDate) : '—',
        lastOrd ? lastOrd.ordainingAuthority : '—',
        m.leadershipExperience.hasMinisterialCredentials ? 'Sim' : 'Não',
      ];
    });

    exportToCSV(`quadro_ministerial_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Funcionalidade Especial 3</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Gestão Histórica Ministerial & Consagrações
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhamento contínuo de cargos, consagrações, ordenações episcopais, credenciais e departamentos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Obreiros</span>
          </button>

          <button
            onClick={() => setShowOrdinationModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Nova Consagração</span>
          </button>
        </div>
      </div>

      {/* Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Corpo de Obreiros</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{ministerialRoll.length}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Pastores Titulares</span>
          <div className="text-xl font-bold font-mono text-amber-800 mt-1">
            {members.filter((m) => m.currentMinisterialRole === 'Pastor' || m.currentMinisterialRole === 'Pastor Presidente').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Presbitério</span>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">
            {members.filter((m) => m.currentMinisterialRole === 'Presbítero').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Diaconia</span>
          <div className="text-xl font-bold font-mono text-teal-700 mt-1">
            {members.filter((m) => m.currentMinisterialRole === 'Diácono' || m.currentMinisterialRole === 'Diaconisa').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Evangelistas & Missões</span>
          <div className="text-xl font-bold font-mono text-purple-700 mt-1">
            {members.filter((m) => m.currentMinisterialRole === 'Evangelista' || m.currentMinisterialRole === 'Missionário').length}
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500">Credenciais Emitidas</span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
            {members.filter((m) => m.leadershipExperience.hasMinisterialCredentials).length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar obreiro por nome..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todas as Funções</option>
            <option value="Pastor Presidente">Pastor Presidente</option>
            <option value="Pastor">Pastor</option>
            <option value="Pastor Auxiliar">Pastor Auxiliar</option>
            <option value="Presbítero">Presbítero</option>
            <option value="Evangelista">Evangelista</option>
            <option value="Missionário">Missionário</option>
            <option value="Diácono">Diácono</option>
            <option value="Diaconisa">Diaconisa</option>
            <option value="Cooperador">Cooperador</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Exibindo {filteredRoll.length} de {ministerialRoll.length} obreiros
        </span>
      </div>

      {/* Main Ministerial Roll Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoll.map((m) => {
          const cong = congregations.find((c) => c.id === m.currentCongregationId);
          const roleBadge = getRoleBadgeStyle(m.currentMinisterialRole);
          const latestOrdination = m.ordinations[0];

          return (
            <div
              key={m.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-amber-400 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 font-bold text-slate-700 flex items-center justify-center">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        m.fullName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 leading-tight">{m.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{m.registrationNumber}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs ${roleBadge.bg}`}>
                    {m.currentMinisterialRole}
                  </span>
                  {m.leadershipExperience.hasMinisterialCredentials && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      <span>Credencial Válida</span>
                    </span>
                  )}
                </div>

                <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cong?.name}</span>
                  </div>
                  {latestOrdination && (
                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      Última Consagração: <strong>{latestOrdination.roleTitle}</strong> em{' '}
                      <span className="font-mono">{formatDateBR(latestOrdination.ordinationDate)}</span>
                    </div>
                  )}
                  {latestOrdination?.ordainingAuthority && (
                    <div className="text-[11px] text-slate-500">
                      Celebrante: {latestOrdination.ordainingAuthority}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  {m.ordinations.length} ordenação(ões)
                </span>
                <button
                  onClick={() => {
                    setSelectedMemberId(m.id);
                    setActiveView('member_record');
                  }}
                  className="text-xs font-semibold text-amber-700 hover:underline"
                >
                  Abrir Prontuário &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal to record new ordination */}
      {showOrdinationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSaveOrdination} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Registrar Nova Consagração / Ordenação</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowOrdinationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Selecione a Pessoa *</label>
              <select
                required
                value={targetMemberId}
                onChange={(e) => setTargetMemberId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-900"
              >
                <option value="">Escolha um membro da lista...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} (Atual: {m.currentMinisterialRole})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Novo Cargo Eclesiástico *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as MinisterialRole)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold"
                >
                  <option value="Cooperador">Cooperador</option>
                  <option value="Auxiliar">Auxiliar</option>
                  <option value="Diácono">Diácono</option>
                  <option value="Diaconisa">Diaconisa</option>
                  <option value="Presbítero">Presbítero</option>
                  <option value="Evangelista">Evangelista</option>
                  <option value="Missionário">Missionário</option>
                  <option value="Pastor Auxiliar">Pastor Auxiliar</option>
                  <option value="Pastor">Pastor</option>
                  <option value="Pastor Presidente">Pastor Presidente</option>
                  <option value="Bispo">Bispo</option>
                  <option value="Apóstolo">Apóstolo</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Data da Consagração *</label>
                <input
                  type="date"
                  required
                  value={ordinationDate}
                  onChange={(e) => setOrdinationDate(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Autoridade que Consagrou (Pastor / Bispo) *</label>
              <input
                type="text"
                required
                value={ordainingAuthority}
                onChange={(e) => setOrdainingAuthority(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Igreja / Concílio Responsável</label>
              <input
                type="text"
                value={ordainingChurch}
                onChange={(e) => setOrdainingChurch(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nº do Certificado de Ordenação (Opcional)</label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="Ex: ORD-2024-001"
                className="w-full p-2 border border-slate-200 rounded-lg text-xs text-slate-900 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOrdinationModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!targetMemberId}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg shadow-xs"
              >
                Salvar Ordenação no Prontuário
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
