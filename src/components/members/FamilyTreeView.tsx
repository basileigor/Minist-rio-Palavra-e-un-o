/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Heart,
  Network,
  Building2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { calculateAge, formatDateBR, getRoleBadgeStyle, getStatusStyle } from '../../utils/formatters.ts';

export const FamilyTreeView: React.FC = () => {
  const { members, congregations, selectedMemberId, setSelectedMemberId, setActiveView } = useChurch();

  const [activeHeadId, setActiveHeadId] = useState<string>(() => {
    if (selectedMemberId) return selectedMemberId;
    // Prefer married member with children if available
    const head = members.find((m) => m.children && m.children.length > 0) || members[0];
    return head ? head.id : '';
  });

  const member = members.find((m) => m.id === activeHeadId) || members[0];
  const congregation = congregations.find((c) => c.id === member?.currentCongregationId);

  // Find linked spouse
  const spouseMember = member?.spouseMemberId
    ? members.find((m) => m.id === member.spouseMemberId)
    : null;

  // Family Stats
  const familiesWithSpouse = members.filter((m) => m.spouseName && m.maritalStatus === 'Casado(a)').length;
  const totalChildrenCount = members.reduce((acc, m) => acc + (m.children?.length || 0), 0);

  if (!member) {
    return <div className="p-8 text-center text-xs text-slate-500">Nenhum membro cadastrado.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-xs font-semibold uppercase tracking-wider">
            <Network className="w-4 h-4" />
            <span>Funcionalidade Especial 2</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Árvore Familiar Integrada
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mapeamento genealógico eclesiástico de pais, cônjuges, filhos e dependentes vinculados.
          </p>
        </div>

        {/* Member Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Foco Familiar:
          </label>
          <select
            value={member.id}
            onChange={(e) => setActiveHeadId(e.target.value)}
            className="py-1.5 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500 max-w-xs"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({m.currentMinisterialRole})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Núcleos Familiares Registrados</span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">{familiesWithSpouse} famílias</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Filhos & Dependentes no Sistema</span>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1">{totalChildrenCount} filhos</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Vínculo Sem Duplicidade</span>
          <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Chave Relacional Única por Titular</span>
          </div>
        </div>
      </div>

      {/* Visual Family Tree Canvas */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-8">
        {/* LEVEL 1: PARENTS (Ascendentes) */}
        <div>
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Nível 1 — Pais & Filiação
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Father Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Pai</span>
              <div className="font-bold text-slate-900 text-sm">{member.fatherName || 'Não Informado'}</div>
              <div className="text-slate-500">
                {member.fatherIsAlive !== undefined ? (member.fatherIsAlive ? 'Vivo' : 'Falecido') : ''}
                {member.fatherReligion ? ` · ${member.fatherReligion}` : ''}
              </div>
              {member.fatherIsChurchMember && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                  Membro Palavra e Unção
                </span>
              )}
            </div>

            {/* Mother Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Mãe</span>
              <div className="font-bold text-slate-900 text-sm">{member.motherName || 'Não Informada'}</div>
              <div className="text-slate-500">
                {member.motherIsAlive !== undefined ? (member.motherIsAlive ? 'Viva' : 'Falecida') : ''}
                {member.motherReligion ? ` · ${member.motherReligion}` : ''}
              </div>
              {member.motherIsChurchMember && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                  Membro Palavra e Unção
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tree Connector */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-slate-300" />
        </div>

        {/* LEVEL 2: MEMBER & SPOUSE (Casal Central) */}
        <div>
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-widest font-mono">
              Nível 2 — Núcleo Conjugal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Focal Member */}
            <div className="p-4 bg-amber-50/70 border-2 border-amber-400 rounded-xl text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-amber-300 overflow-hidden shrink-0">
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-slate-600 flex items-center justify-center h-full">
                      {member.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm leading-tight">{member.fullName}</div>
                  <div className="text-amber-800 font-semibold mt-0.5">{member.currentMinisterialRole}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{calculateAge(member.birthDate)} anos</div>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">{congregation?.name}</span>
                <button
                  onClick={() => {
                    setSelectedMemberId(member.id);
                    setActiveView('member_record');
                  }}
                  className="text-amber-800 font-bold hover:underline text-[11px]"
                >
                  Abrir Prontuário &rarr;
                </button>
              </div>
            </div>

            {/* Spouse */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-400 font-semibold uppercase text-[10px] font-mono mb-1">
                  <span>Cônjuge</span>
                  {member.marriageDate && <span>Casados desde {member.marriageDate.slice(0, 4)}</span>}
                </div>

                {member.spouseName ? (
                  <>
                    <div className="font-bold text-slate-900 text-sm">{member.spouseName}</div>
                    <div className="text-slate-600 mt-1">
                      {member.spouseIsChristian ? 'Evangélico(a)' : 'Não evangélico(a)'} ·{' '}
                      {member.spouseIsChurchMember ? 'Membro desta Igreja' : 'Membro de outra congregação'}
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500 italic py-2">Sem cônjuge registrado (Solteiro/Outro).</div>
                )}
              </div>

              {spouseMember && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold">Perfil Sincronizado</span>
                  <button
                    onClick={() => {
                      setSelectedMemberId(spouseMember.id);
                      setActiveView('member_record');
                    }}
                    className="text-amber-800 font-bold hover:underline text-[11px]"
                  >
                    Ver Ficha do Cônjuge &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tree Connector */}
        <div className="flex justify-center">
          <div className="w-0.5 h-6 bg-slate-300" />
        </div>

        {/* LEVEL 3: CHILDREN (Descendentes) */}
        <div>
          <div className="text-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
              Nível 3 — Filhos & Dependentes ({member.children.length})
            </span>
          </div>

          {member.children.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 max-w-md mx-auto">
              Nenhum filho registrado para este núcleo familiar.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {member.children.map((child) => (
                <div key={child.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{child.fullName}</div>
                    <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                      {calculateAge(child.birthDate)} anos ({formatDateBR(child.birthDate)}) · {child.gender}
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {child.isChurchMember && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px]">
                          Membro
                        </span>
                      )}
                      {child.isBaptized && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold text-[10px]">
                          Batizado
                        </span>
                      )}
                      {child.attendsSundaySchool && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-semibold text-[10px]">
                          Frequenta EBD
                        </span>
                      )}
                    </div>
                  </div>

                  {child.linkedMemberId && (
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        onClick={() => {
                          setSelectedMemberId(child.linkedMemberId!);
                          setActiveView('member_record');
                        }}
                        className="text-[11px] text-amber-700 font-bold hover:underline"
                      >
                        Acessar prontuário individual &rarr;
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
