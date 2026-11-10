/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  UserPlus,
  Download,
  Eye,
  Edit,
  Printer,
  ArrowRightLeft,
  ChevronDown,
  Building2,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  X,
  Award,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { Member, MemberStatus, MinisterialRole } from '../../types/church.ts';
import {
  calculateAge,
  formatDateBR,
  formatPhone,
  formatCPF,
  getStatusStyle,
  getRoleBadgeStyle,
  exportToCSV,
} from '../../utils/formatters.ts';

export const MemberList: React.FC = () => {
  const {
    members,
    congregations,
    activeCongregationId,
    setActiveView,
    setSelectedMemberId,
    currentUserRole,
    transferMember,
    changeMemberStatus,
  } = useChurch();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [baptismFilter, setBaptismFilter] = useState<string>('all'); // all, baptized, not_baptized
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Quick Action Modal states
  const [transferModalMember, setTransferModalMember] = useState<Member | null>(null);
  const [transferTargetCongregation, setTransferTargetCongregation] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const [statusModalMember, setStatusModalMember] = useState<Member | null>(null);
  const [newStatusSelection, setNewStatusSelection] = useState<MemberStatus>('Membro Ativo');
  const [statusChangeReason, setStatusChangeReason] = useState('');

  // Combined filtering logic
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Text search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = member.fullName.toLowerCase().includes(query);
        const matchesReg = member.registrationNumber.toLowerCase().includes(query);
        const matchesPhone = member.primaryPhone.includes(query);
        const matchesEmail = member.email ? member.email.toLowerCase().includes(query) : false;
        const matchesCpf = member.cpf ? member.cpf.includes(query.replace(/\D/g, '')) : false;
        const matchesRole = member.currentMinisterialRole.toLowerCase().includes(query);
        if (!matchesName && !matchesReg && !matchesPhone && !matchesEmail && !matchesCpf && !matchesRole) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all' && member.currentStatus !== statusFilter) {
        return false;
      }

      // Ministerial role filter
      if (roleFilter !== 'all' && member.currentMinisterialRole !== roleFilter) {
        return false;
      }

      // Baptism filter
      if (baptismFilter === 'baptized' && !member.isWaterBaptized) return false;
      if (baptismFilter === 'not_baptized' && member.isWaterBaptized) return false;

      return true;
    });
  }, [members, searchTerm, statusFilter, roleFilter, baptismFilter]);

  const handleExportCSV = () => {
    const headers = [
      'Matrícula',
      'Nome Completo',
      'Situação',
      'Cargo Ministerial',
      'Congregação',
      'Data Nascimento',
      'Idade',
      'Telefone',
      'Email',
      'Batizado nas Águas',
      'Data Batismo',
      'Data Admissão',
    ];

    const rows = filteredMembers.map((m) => {
      const cong = congregations.find((c) => c.id === m.currentCongregationId);
      return [
        m.registrationNumber,
        m.fullName,
        m.currentStatus,
        m.currentMinisterialRole,
        cong?.name || 'N/A',
        formatDateBR(m.birthDate),
        calculateAge(m.birthDate),
        m.primaryPhone,
        m.email || '',
        m.isWaterBaptized ? 'Sim' : 'Não',
        formatDateBR(m.waterBaptismDate),
        formatDateBR(m.admissionDate),
      ];
    });

    exportToCSV(`relacao_membros_${new Date().toISOString().split('T')[0]}`, headers, rows);
  };

  const handleOpenRecord = (memberId: string) => {
    setSelectedMemberId(memberId);
    setActiveView('member_record');
  };

  const handleOpenPrintable = (memberId: string) => {
    setSelectedMemberId(memberId);
    setActiveView('print_record');
  };

  const handleExecuteTransfer = () => {
    if (!transferModalMember || !transferTargetCongregation) return;
    transferMember(transferModalMember.id, transferTargetCongregation, transferReason);
    setTransferModalMember(null);
    setTransferTargetCongregation('');
    setTransferReason('');
  };

  const handleExecuteStatusChange = () => {
    if (!statusModalMember) return;
    changeMemberStatus(statusModalMember.id, newStatusSelection, statusChangeReason);
    setStatusModalMember(null);
    setStatusChangeReason('');
  };

  return (
    <div className="space-y-4">
      {/* Title & Top Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Cadastro Geral de Pessoas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Localize e gerencie prontuários de membros, obreiros, congregados, visitantes e líderes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            title="Exportar dados filtrados para Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => {
              setSelectedMemberId(null);
              setActiveView('wizard');
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Novo Cadastro</span>
          </button>
        </div>
      </div>

      {/* Advanced Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Main search text */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF, telefone ou matrícula..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todas as Situações</option>
              <option value="Membro Ativo">Membro Ativo</option>
              <option value="Novo Convertido">Novo Convertido</option>
              <option value="Congregado">Congregado</option>
              <option value="Membro em Integração">Membro em Integração</option>
              <option value="Visitante">Visitante</option>
              <option value="Membro Afastado">Membro Afastado</option>
              <option value="Membro Transferido">Membro Transferido</option>
              <option value="Membro Desligado">Membro Desligado</option>
              <option value="Membro Falecido">Membro Falecido</option>
            </select>
          </div>

          {/* Ministerial role filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Todos os Cargos</option>
              <option value="Pastor Presidente">Pastor Presidente</option>
              <option value="Pastor">Pastor</option>
              <option value="Pastor Auxiliar">Pastor Auxiliar</option>
              <option value="Presbítero">Presbítero</option>
              <option value="Evangelista">Evangelista</option>
              <option value="Missionário">Missionário</option>
              <option value="Diácono">Diácono</option>
              <option value="Diaconisa">Diaconisa</option>
              <option value="Cooperador">Cooperador</option>
              <option value="Membro">Membro</option>
            </select>
          </div>
        </div>

        {/* Secondary filters row & active counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">Filtro Rápido:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setBaptismFilter('all')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  baptismFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setBaptismFilter('baptized')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  baptismFilter === 'baptized' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Batizados
              </button>
              <button
                onClick={() => setBaptismFilter('not_baptized')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                  baptismFilter === 'not_baptized' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Não Batizados
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 font-medium">
            <span>
              Exibindo <strong className="text-slate-900 font-mono">{filteredMembers.length}</strong> de{' '}
              <span className="font-mono">{members.length}</span> registros
            </span>

            {/* Toggle Table/Cards */}
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-0.5 text-xs rounded ${
                  viewMode === 'table' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2 py-0.5 text-xs rounded ${
                  viewMode === 'cards' ? 'bg-white font-semibold text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Cartões
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Pessoa / Identificação</th>
                  <th className="py-3 px-3">Cargo Ministerial</th>
                  <th className="py-3 px-3">Congregação</th>
                  <th className="py-3 px-3">Contato</th>
                  <th className="py-3 px-3">Situação</th>
                  <th className="py-3 px-3 text-center">Batismo</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Nenhuma pessoa encontrada para os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const cong = congregations.find((c) => c.id === member.currentCongregationId);
                    const statusStyle = getStatusStyle(member.currentStatus);
                    const roleBadge = getRoleBadgeStyle(member.currentMinisterialRole);
                    const age = calculateAge(member.birthDate);

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Member & Photo */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 overflow-hidden">
                              {member.photoUrl ? (
                                <img
                                  src={member.photoUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                member.fullName.charAt(0)
                              )}
                            </div>
                            <div>
                              <button
                                onClick={() => handleOpenRecord(member.id)}
                                className="font-semibold text-slate-900 hover:text-amber-700 text-left line-clamp-1 group-hover:underline"
                              >
                                {member.fullName}
                              </button>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                                <span>{member.registrationNumber}</span>
                                <span>·</span>
                                <span>{age} anos</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${roleBadge.bg}`}>
                            {member.currentMinisterialRole}
                          </span>
                        </td>

                        {/* Congregation */}
                        <td className="py-3 px-3 text-slate-700">
                          <div className="truncate max-w-[150px]" title={cong?.name}>
                            {cong?.name || 'Não informada'}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-mono text-[11px]">
                            {formatPhone(member.primaryPhone)}
                          </div>
                          {member.email && (
                            <div className="text-slate-400 text-[11px] truncate max-w-[140px]">
                              {member.email}
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle.bg}`}
                          >
                            {member.currentStatus}
                          </span>
                        </td>

                        {/* Baptism */}
                        <td className="py-3 px-3 text-center">
                          {member.isWaterBaptized ? (
                            <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Sim</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Pendente</span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenRecord(member.id)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded-md transition-colors"
                              title="Abrir Prontuário Eclesiástico Individual"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenPrintable(member.id)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                              title="Imprimir Ficha Oficial"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setTransferModalMember(member);
                                setTransferTargetCongregation('');
                              }}
                              className="p-1.5 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-md transition-colors"
                              title="Transferir Congregação"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setStatusModalMember(member);
                                setNewStatusSelection(member.currentStatus);
                              }}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                              title="Alterar Situação do Membro"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const cong = congregations.find((c) => c.id === member.currentCongregationId);
            const statusStyle = getStatusStyle(member.currentStatus);
            const roleBadge = getRoleBadgeStyle(member.currentMinisterialRole);
            const age = calculateAge(member.birthDate);

            return (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-amber-400 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 overflow-hidden shrink-0">
                        {member.photoUrl ? (
                          <img
                            src={member.photoUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          member.fullName.charAt(0)
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 leading-tight">
                          {member.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {member.registrationNumber} · {age} anos
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] ${roleBadge.bg}`}>
                      {member.currentMinisterialRole}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${statusStyle.bg}`}
                    >
                      {member.currentStatus}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{cong?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatPhone(member.primaryPhone)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenRecord(member.id)}
                    className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                  >
                    Ver Prontuário &rarr;
                  </button>
                  <button
                    onClick={() => handleOpenPrintable(member.id)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Imprimir Ficha"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Congregation Modal */}
      {transferModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Transferir Membro de Congregação
                </h3>
              </div>
              <button
                onClick={() => setTransferModalMember(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-600">
                Membro: <strong className="text-slate-900">{transferModalMember.fullName}</strong>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Congregação atual:{' '}
                {congregations.find((c) => c.id === transferModalMember.currentCongregationId)?.name}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Congregação de Destino:
              </label>
              <select
                value={transferTargetCongregation}
                onChange={(e) => setTransferTargetCongregation(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecione a congregação destino...</option>
                {congregations
                  .filter((c) => c.id !== transferModalMember.currentCongregationId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo da Transferência:
              </label>
              <textarea
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={3}
                placeholder="Ex: Mudança de endereço residencial / Designação ministerial / Pedido voluntário..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTransferModalMember(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteTransfer}
                disabled={!transferTargetCongregation}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg shadow-xs"
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Status Modal */}
      {statusModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Alterar Situação Eclesiástica
                </h3>
              </div>
              <button
                onClick={() => setStatusModalMember(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-600">
                Pessoa: <strong className="text-slate-900">{statusModalMember.fullName}</strong>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Situação atual: <span className="font-medium">{statusModalMember.currentStatus}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nova Situação:
              </label>
              <select
                value={newStatusSelection}
                onChange={(e) => setNewStatusSelection(e.target.value as MemberStatus)}
                className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="Membro Ativo">Membro Ativo</option>
                <option value="Novo Convertido">Novo Convertido</option>
                <option value="Congregado">Congregado</option>
                <option value="Membro em Integração">Membro em Integração</option>
                <option value="Visitante">Visitante</option>
                <option value="Membro Afastado">Membro Afastado</option>
                <option value="Membro Transferido">Membro Transferido</option>
                <option value="Membro Desligado">Membro Desligado</option>
                <option value="Membro Falecido">Membro Falecido</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Justificativa / Registro da Mudança:
              </label>
              <textarea
                value={statusChangeReason}
                onChange={(e) => setStatusChangeReason(e.target.value)}
                rows={3}
                placeholder="Informe o motivo da alteração (fica registrado no histórico permanente do prontuário)..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setStatusModalMember(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteStatusChange}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Gravar Alteração
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
