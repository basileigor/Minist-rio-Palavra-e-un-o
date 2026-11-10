/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HeartHandshake,
  Lock,
  Plus,
  Shield,
  Search,
  Calendar,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { PastoralCareRecord } from '../../types/church.ts';
import { formatDateBR } from '../../utils/formatters.ts';

export const PastoralCareView: React.FC = () => {
  const { members, currentUserRole, addPastoralCareRecord, setSelectedMemberId, setActiveView } = useChurch();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);

  // New care form state
  const [targetMemberId, setTargetMemberId] = useState('');
  const [serviceType, setServiceType] = useState<PastoralCareRecord['serviceType']>('Aconselhamento');
  const [subject, setSubject] = useState('');
  const [guidance, setGuidance] = useState('');
  const [confidentialNotes, setConfidentialNotes] = useState('');
  const [confidentiality, setPastoralConfidentiality] = useState<PastoralCareRecord['confidentialityLevel']>('Pastoral Restrito');
  const [nextDate, setNextDate] = useState('');

  // Strict LGPD and Pastoral Confidentiality role check
  const isAuthorized =
    currentUserRole === 'ADMIN_GERAL' ||
    currentUserRole === 'PASTOR_PRESIDENTE' ||
    currentUserRole === 'PASTOR_CONGREGACAO';

  // Aggregate all pastoral records
  const allPastoralRecords = members.flatMap((m) =>
    (m.pastoralCareRecords || []).map((care) => ({
      ...care,
      memberId: m.id,
      memberName: m.fullName,
      memberStatus: m.currentStatus,
      memberPhoto: m.photoUrl,
    }))
  ).sort((a, b) => (a.date < b.date ? 1 : -1));

  const filteredRecords = allPastoralRecords.filter((rec) => {
    if (typeFilter !== 'all' && rec.serviceType !== typeFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        rec.memberName.toLowerCase().includes(q) ||
        rec.subject.toLowerCase().includes(q) ||
        rec.pastorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMemberId || !subject.trim()) return;

    addPastoralCareRecord(targetMemberId, {
      date: new Date().toISOString().split('T')[0],
      pastorName:
        currentUserRole === 'PASTOR_PRESIDENTE'
          ? 'Pr. Samuel Oliveira (Presidente)'
          : `Pastor (${currentUserRole})`,
      serviceType,
      subject,
      guidanceProvided: guidance,
      followUpNeeded: Boolean(nextDate),
      nextAppointmentDate: nextDate || undefined,
      status: 'Em andamento',
      confidentialNotes,
      confidentialityLevel: confidentiality,
    });

    setShowNewModal(false);
    setTargetMemberId('');
    setSubject('');
    setGuidance('');
    setConfidentialNotes('');
    setNextDate('');
  };

  if (!isAuthorized) {
    return (
      <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-xs text-center space-y-4 max-w-xl mx-auto my-8">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-700">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Módulo Reservado ao Gabinete Pastoral
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Informações de aconselhamento, conflitos familiares e relatos íntimos de membros possuem proteção reforçada conforme a LGPD e o segredo pastoral eclesiástico.
          Seu perfil atual ({currentUserRole}) não possui permissão de acesso a este módulo.
        </p>
        <p className="text-xs text-amber-800 font-medium">
          Dica: Você pode testar este módulo alternando seu perfil para <strong>Pastor Presidente</strong> ou <strong>Admin Geral</strong> no seletor de permissões do topo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Top Action */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Área Sigilosa de Aconselhamento</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Acompanhamento Pastoral & Gabinete
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registro restrito de visitas pastorais, aconselhamentos espirituais, apoio a novos convertidos e agendamentos.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Registrar Atendimento</span>
        </button>
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
              placeholder="Buscar por pessoa, assunto ou pastor..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-1.5 px-3 text-xs border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">Todos os Tipos</option>
            <option value="Aconselhamento">Aconselhamento</option>
            <option value="Visita pastoral">Visita Pastoral</option>
            <option value="Orientação familiar">Orientação Familiar</option>
            <option value="Novos convertidos">Novos Convertidos</option>
            <option value="Acompanhamento espiritual">Acompanhamento Espiritual</option>
            <option value="Visita hospitalar">Visita Hospitalar</option>
            <option value="Apoio social">Apoio Social</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          {filteredRecords.length} atendimento(s) registrado(s)
        </span>
      </div>

      {/* Care Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
            Nenhum atendimento pastoral encontrado.
          </div>
        ) : (
          filteredRecords.map((care) => (
            <div
              key={care.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-amber-400 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-slate-700">
                    {care.memberPhoto ? (
                      <img src={care.memberPhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      care.memberName.charAt(0)
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setSelectedMemberId(care.memberId);
                        setActiveView('member_record');
                      }}
                      className="font-bold text-slate-900 text-sm hover:text-amber-700 text-left"
                    >
                      {care.memberName}
                    </button>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>Status: {care.memberStatus}</span>
                      <span>·</span>
                      <span className="text-amber-800 font-medium">{care.serviceType}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">{formatDateBR(care.date)}</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                    {care.confidentialityLevel}
                  </span>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-700">
                <div>
                  <strong className="text-slate-900">Assunto:</strong> {care.subject}
                </div>
                <div>
                  <strong className="text-slate-900">Orientações Fornecidas:</strong> {care.guidanceProvided}
                </div>
                {care.confidentialNotes && (
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-950 text-xs">
                    <strong className="text-amber-900">Anotações Reservadas (Gabinete):</strong> {care.confidentialNotes}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Atendido por: <strong className="text-slate-700">{care.pastorName}</strong></span>
                {care.nextAppointmentDate && (
                  <span className="text-amber-800 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Retorno Agendado: {formatDateBR(care.nextAppointmentDate)}</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Pastoral Care Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>Registrar Atendimento Pastoral</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Membro Atendido *</label>
              <select
                required
                value={targetMemberId}
                onChange={(e) => setTargetMemberId(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              >
                <option value="">Selecione o membro...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.currentStatus})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Atendimento:</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value as any)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-900"
                >
                  <option value="Aconselhamento">Aconselhamento</option>
                  <option value="Visita pastoral">Visita pastoral</option>
                  <option value="Orientação familiar">Orientação familiar</option>
                  <option value="Novos convertidos">Novos convertidos</option>
                  <option value="Acompanhamento espiritual">Acompanhamento espiritual</option>
                  <option value="Visita hospitalar">Visita hospitalar</option>
                  <option value="Apoio social">Apoio social</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Próximo Contato (Opcional):</label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assunto Tratado *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Orientação pré-matrimonial / Acompanhamento de fé..."
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Orientações e Passagens Fornecidas:</label>
              <textarea
                rows={3}
                value={guidance}
                onChange={(e) => setGuidance(e.target.value)}
                placeholder="Diretrizes e acompanhamento estabelecido..."
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Anotações Sigilosas (Gabinete):</label>
              <textarea
                rows={2}
                value={confidentialNotes}
                onChange={(e) => setConfidentialNotes(e.target.value)}
                placeholder="Informações confidenciais sob sigilo ministerial..."
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!targetMemberId || !subject.trim()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg shadow-xs"
              >
                Gravar Atendimento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
