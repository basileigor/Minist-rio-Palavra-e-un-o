/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  Sparkles,
  Award,
  Building2,
  BookOpen,
  Droplet,
  Heart,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { calculateAge, getAgeCategory } from '../../utils/formatters.ts';

export const DashboardView: React.FC = () => {
  const { members, congregations, setActiveView, setSelectedMemberId } = useChurch();

  // Unified institution members
  const visibleMembers = members;

  // Key metrics calculation
  const totalRegistered = visibleMembers.length;
  const activeMembers = visibleMembers.filter((m) => m.currentStatus === 'Membro Ativo').length;
  const congregados = visibleMembers.filter((m) => m.currentStatus === 'Congregado').length;
  const visitors = visibleMembers.filter((m) => m.currentStatus === 'Visitante').length;
  const integrating = visibleMembers.filter((m) => m.currentStatus === 'Membro em Integração').length;
  const awayMembers = visibleMembers.filter((m) => m.currentStatus === 'Membro Afastado').length;

  // Ministerial counts
  const pastors = visibleMembers.filter(
    (m) =>
      m.currentMinisterialRole === 'Pastor' ||
      m.currentMinisterialRole === 'Pastor Presidente' ||
      m.currentMinisterialRole === 'Pastor Auxiliar' ||
      m.currentMinisterialRole === 'Bispo' ||
      m.currentMinisterialRole === 'Apóstolo'
  ).length;

  const presbyters = visibleMembers.filter((m) => m.currentMinisterialRole === 'Presbítero').length;
  const deacons = visibleMembers.filter(
    (m) => m.currentMinisterialRole === 'Diácono' || m.currentMinisterialRole === 'Diaconisa'
  ).length;
  const evangelists = visibleMembers.filter((m) => m.currentMinisterialRole === 'Evangelista').length;
  const missionaries = visibleMembers.filter((m) => m.currentMinisterialRole === 'Missionário').length;
  const totalWorkers = visibleMembers.filter(
    (m) => m.currentMinisterialRole !== 'Membro'
  ).length;

  // Sacraments and Ministries
  const baptizedMembers = visibleMembers.filter((m) => m.isWaterBaptized).length;
  const inTheology = visibleMembers.filter((m) => m.theologicalCourses && m.theologicalCourses.length > 0).length;
  const inMinistries = visibleMembers.filter((m) => m.ministries && m.ministries.some((min) => min.isCurrent)).length;

  // Age demographics breakdown
  const ageStats = {
    children: 0, // 0-11
    teens: 0, // 12-17
    youth: 0, // 18-29
    adults: 0, // 30-59
    seniors: 0, // 60+
  };

  visibleMembers.forEach((m) => {
    const age = calculateAge(m.birthDate);
    if (age <= 11) ageStats.children++;
    else if (age <= 17) ageStats.teens++;
    else if (age <= 29) ageStats.youth++;
    else if (age <= 59) ageStats.adults++;
    else ageStats.seniors++;
  });

  // Department & Ministry engagement
  const departmentStats = [
    { name: 'Ministério de Louvor & Adoração', count: visibleMembers.filter((m) => m.ministries?.some((x) => x.departmentName.toLowerCase().includes('louvor') && x.isCurrent)).length, color: 'bg-amber-600' },
    { name: 'Escola Bíblica Dominical (EBD)', count: visibleMembers.filter((m) => m.ministries?.some((x) => x.departmentName.toLowerCase().includes('ebd') && x.isCurrent) || (m.theologicalCourses && m.theologicalCourses.length > 0)).length, color: 'bg-blue-600' },
    { name: 'Intercessão & Oração', count: visibleMembers.filter((m) => m.ministries?.some((x) => x.departmentName.toLowerCase().includes('intercessão') && x.isCurrent)).length, color: 'bg-indigo-600' },
    { name: 'Diaconia & Acolhimento', count: visibleMembers.filter((m) => m.currentMinisterialRole === 'Diácono' || m.currentMinisterialRole === 'Diaconisa' || m.currentMinisterialRole === 'Cooperador').length, color: 'bg-emerald-600' },
    { name: 'Evangelismo & Ação Social', count: visibleMembers.filter((m) => m.currentMinisterialRole === 'Evangelista' || m.currentMinisterialRole === 'Missionário' || m.ministries?.some((x) => x.departmentName.toLowerCase().includes('missões') && x.isCurrent)).length, color: 'bg-rose-600' },
  ];

  // Recent member records for quick access
  const recentMembersList = [...visibleMembers]
    .sort((a, b) => new Date(b.admissionDate || '2024-01-01').getTime() - new Date(a.admissionDate || '2024-01-01').getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome & Overview Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Painel Eclesiástico Geral
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Indicadores consolidados, movimentação eclesiástica e saúde ministerial da instituição.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('reports')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Emitir Relatórios
            </button>
            <button
              onClick={() => setActiveView('wizard')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              + Novo Cadastro
            </button>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Total de Pessoas</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 mt-2">
            {totalRegistered}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Registros totais</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Membros Ativos</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700 mt-2">
            {activeMembers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalRegistered > 0 ? `${Math.round((activeMembers / totalRegistered) * 100)}% da base` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Congregados</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-sky-700 mt-2">
            {congregados}
          </div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">
            {totalRegistered > 0 ? `${Math.round((congregados / totalRegistered) * 100)}% da base` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Corpo de Obreiros</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-800 mt-2">
            {totalWorkers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Liderança eclesiástica</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Batizados nas Águas</span>
            <Droplet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-700 mt-2">
            {baptizedMembers}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {totalRegistered > 0 ? `${Math.round((baptizedMembers / totalRegistered) * 100)}% batizados` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Atuando em Ministérios</span>
            <Heart className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700 mt-2">
            {inMinistries}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Em departamentos</div>
        </div>
      </div>

      {/* Secondary Ministerial & Ecclesiastical Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[11px] font-medium text-slate-600">Pastores</div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{pastors}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[11px] font-medium text-slate-600">Presbíteros</div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{presbyters}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[11px] font-medium text-slate-600">Diáconos / Diaconisas</div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{deacons}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[11px] font-medium text-slate-600">Evangelistas</div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{evangelists}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[11px] font-medium text-slate-600">Missionários</div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{missionaries}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[11px] font-medium text-slate-600">Congregados</div>
          <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{congregados}</div>
        </div>
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="text-[11px] font-medium text-slate-600">Afastados</div>
          <div className="text-lg font-bold font-mono text-rose-700 mt-0.5">{awayMembers}</div>
        </div>
      </div>

      {/* Middle Row: Ministries Participation & Age Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ministries & Departments Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Participação nos Ministérios & Departamentos
              </h2>
            </div>
            <button
              onClick={() => setActiveView('ministerial')}
              className="text-xs text-amber-700 hover:underline font-medium"
            >
              Ver Ministérios &rarr;
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {departmentStats.map((dep) => {
              const percentage = totalRegistered > 0 ? Math.round((dep.count / totalRegistered) * 100) : 0;
              return (
                <div key={dep.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-800">{dep.name}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {dep.count} membros ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${dep.color}`}
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Age Demographics Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Pirâmide Etária e Demografia
              </h2>
            </div>
            <span className="text-xs text-slate-400">Total: {totalRegistered}</span>
          </div>

          <div className="mt-4 space-y-3">
            {[
              { label: 'Crianças (0-11 anos)', count: ageStats.children, color: 'bg-emerald-500' },
              { label: 'Adolescentes (12-17 anos)', count: ageStats.teens, color: 'bg-teal-500' },
              { label: 'Jovens (18-29 anos)', count: ageStats.youth, color: 'bg-sky-500' },
              { label: 'Adultos (30-59 anos)', count: ageStats.adults, color: 'bg-amber-500' },
              { label: 'Terceira Idade (60+ anos)', count: ageStats.seniors, color: 'bg-indigo-500' },
            ].map((group) => {
              const pct = totalRegistered > 0 ? Math.round((group.count / totalRegistered) * 100) : 0;
              return (
                <div key={group.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700">{group.label}</span>
                    <span className="font-mono text-slate-500 tabular-nums">
                      {group.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${group.color}`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Pastoral Care Follow-up & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prontuários e Cadastros Recentes */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Prontuários e Cadastros Recentes
              </h2>
            </div>
            <button
              onClick={() => setActiveView('members')}
              className="text-xs text-amber-700 hover:underline font-medium"
            >
              Ver Todos os Membros &rarr;
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {recentMembersList.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                Nenhum membro registrado no momento.
              </div>
            ) : (
              recentMembersList.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                      {m.photoUrl ? (
                        <img src={m.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        m.fullName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900">{m.fullName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-600 font-medium">{m.registrationNumber}</span>
                        <span>·</span>
                        <span>{m.currentMinisterialRole}</span>
                        <span>·</span>
                        <span className="text-amber-700 font-medium">{m.currentStatus}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMemberId(m.id);
                      setActiveView('member_record');
                    }}
                    className="text-xs text-slate-600 hover:text-amber-700 font-medium px-2.5 py-1 rounded-md hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Ver Prontuário &rarr;
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Administrative Quick Actions & Shortcuts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Acesso Rápido aos Módulos
            </h2>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setActiveView('wizard')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg flex items-center justify-between border border-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  Cadastrar Pessoa por Etapas
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveView('family_tree')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg flex items-center justify-between border border-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" />
                  Visualizar Árvore Familiar
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveView('ministerial')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg flex items-center justify-between border border-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Histórico Ministerial & Ordenações
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveView('birthdays')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg flex items-center justify-between border border-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Aniversariantes do Mês
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => setActiveView('lgpd')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg flex items-center justify-between border border-slate-100 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  Privacidade LGPD & Auditoria
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Base eclesiástica atualizada</span>
            <span className="font-mono">{new Date().toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
