/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Printer,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  Droplet,
  FileText,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { calculateAge, formatDateBR, formatPhone, formatCPF, formatCEP } from '../../utils/formatters.ts';

export const PrintableMemberCard: React.FC = () => {
  const { members, selectedMemberId, congregations, settings, setActiveView } = useChurch();

  const member = members.find((m) => m.id === selectedMemberId) || members[0];
  const congregation = congregations.find((c) => c.id === member?.currentCongregationId);

  if (!member) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Nenhum membro selecionado para impressão.
      </div>
    );
  }

  const age = calculateAge(member.birthDate);

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Non-printable Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between no-print">
        <button
          onClick={() => setActiveView('member_record')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao Prontuário</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir Ficha Oficial (PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Standard A4 Letterhead Format) */}
      <div className="bg-white p-8 sm:p-12 border border-slate-300 rounded-xl shadow-xs print-shadow-none text-slate-900 space-y-6 font-sans">
        {/* Church Header */}
        <div className="pb-4 border-b-2 border-slate-900 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/assets/aistudio/Logo_igreja_30f200bb.jpg"
              alt="Logotipo Ministério Palavra e Unção"
              className="w-16 h-16 rounded-lg object-cover border-2 border-amber-400 shrink-0 shadow-xs"
            />
            <div>
              <h1 className="text-base font-extrabold uppercase tracking-tight text-slate-900">
                {settings.name}
              </h1>
              <div className="text-xs font-mono text-slate-700">
                CNPJ: {settings.cnpj} · Sede: {settings.headquartersAddress}
              </div>
              <div className="text-[11px] text-slate-600 italic mt-0.5">
                "{settings.motto}"
              </div>
            </div>
          </div>

          <div className="text-right text-xs shrink-0">
            <div className="text-[10px] uppercase font-mono text-slate-400">Prontuário Individual</div>
            <div className="text-sm font-bold font-mono text-amber-800 mt-0.5">
              {member.registrationNumber}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              Emissão: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>

        {/* Member Title Banner */}
        <div className="flex items-start justify-between gap-6 pb-2 border-b border-slate-200">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Ficha Cadastral e Prontuário Eclesiástico de Membro
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
              {member.fullName}
            </h2>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
              <span>Cargo: <strong className="text-amber-900">{member.currentMinisterialRole}</strong></span>
              <span>·</span>
              <span>Situação: <strong>{member.currentStatus}</strong></span>
              <span>·</span>
              <span>Congregação: <strong>{congregation?.name}</strong></span>
            </div>
          </div>

          {/* Photo */}
          <div className="w-24 h-28 border-2 border-slate-300 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
            {member.photoUrl ? (
              <img src={member.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-slate-400">3 x 4</span>
            )}
          </div>
        </div>

        {/* 1. DADOS CIVIS E PESSOAIS */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 rounded">
            1. Identificação Civil & Dados Pessoais
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>Data Nasc: <strong>{formatDateBR(member.birthDate)}</strong> ({age} anos)</div>
            <div>Sexo: <strong>{member.gender}</strong></div>
            <div>Estado Civil: <strong>{member.maritalStatus}</strong></div>
            <div>Naturalidade: <strong>{member.birthplaceCity || '—'}/{member.birthplaceState || '—'}</strong></div>
            <div>Nacionalidade: <strong>{member.nationality}</strong></div>
            <div>Profissão: <strong>{member.profession || 'Não informada'}</strong></div>
            <div>CPF: <strong className="font-mono">{formatCPF(member.cpf, false)}</strong></div>
            <div>RG: <strong className="font-mono">{member.rg || '—'} {member.rgIssuer}</strong></div>
            <div>Escolaridade: <strong>{member.educationLevel || '—'}</strong></div>
          </div>
        </div>

        {/* 2. CONTATO E ENDEREÇO */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 rounded">
            2. Contato & Residência
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>Telefone Principal: <strong className="font-mono">{formatPhone(member.primaryPhone)}</strong></div>
            <div>WhatsApp: <strong className="font-mono">{formatPhone(member.whatsapp)}</strong></div>
            <div>E-mail: <strong>{member.email || 'Não informado'}</strong></div>
            <div className="col-span-2">
              Endereço: <strong>{member.street}, nº {member.number} {member.complement || ''} - {member.neighborhood}, {member.city}/{member.state}</strong>
            </div>
            <div>CEP: <strong className="font-mono">{formatCEP(member.cep)}</strong></div>
          </div>
        </div>

        {/* 3. DADOS FAMILIARES */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 rounded">
            3. Filiação & Composição Familiar
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>Pai: <strong>{member.fatherName || 'Não informado'}</strong> ({member.fatherIsAlive ? 'Vivo' : 'Falecido'})</div>
            <div>Mãe: <strong>{member.motherName || 'Não informada'}</strong> ({member.motherIsAlive ? 'Viva' : 'Falecida'})</div>
            {member.spouseName && (
              <div className="col-span-2">
                Cônjuge: <strong>{member.spouseName}</strong> · Casamento: <strong>{formatDateBR(member.marriageDate)}</strong> ({member.unionType})
              </div>
            )}
            <div className="col-span-2">
              Filhos Cadastrados: <strong>{member.children.length > 0 ? member.children.map((c) => `${c.fullName} (${calculateAge(c.birthDate)}a)`).join(', ') : 'Nenhum'}</strong>
            </div>
          </div>
        </div>

        {/* 4. HISTÓRICO SACRAMENTAL E CONVERSÃO */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 rounded">
            4. Vida Espiritual, Conversão & Batismo
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>Conversão: <strong>{formatDateBR(member.conversionDate)}</strong></div>
            <div>Local da Conversão: <strong>{member.conversionPlace || '—'}</strong></div>
            <div>Discipulador: <strong>{member.mentoredBy || '—'}</strong></div>
            <div>Batismo nas Águas: <strong>{member.isWaterBaptized ? 'Sim' : 'Pendente'}</strong></div>
            <div>Data do Batismo: <strong>{formatDateBR(member.waterBaptismDate)}</strong></div>
            <div>Pastor Celebrante: <strong>{member.officiatingPastor || '—'}</strong></div>
            <div>Batismo no Espírito Santo: <strong>{member.hasHolySpiritBaptism ? 'Sim, declarado' : 'Não declarado'}</strong></div>
            <div>Santa Ceia: <strong>{member.partakesHolyCommunionRegularly ? 'Regular' : 'Não participa'}</strong></div>
            <div>Certificado Batismo: <strong className="font-mono">{member.baptismCertificateNumber || 'Arquivado'}</strong></div>
          </div>
        </div>

        {/* 5. HISTÓRICO MINISTERIAL E DEPARTAMENTOS */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 p-1.5 rounded">
            5. Histórico Ministerial & Consagrações Oficiais
          </h3>
          <div className="text-xs space-y-1">
            {member.ordinations.length === 0 ? (
              <div className="text-slate-500 italic">Membro atuante sem consagrações oficiais anteriores.</div>
            ) : (
              member.ordinations.map((ord, i) => (
                <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-1">
                  <span>
                    <strong>{ord.roleTitle}</strong> — Ordenado em {formatDateBR(ord.ordinationDate)} por {ord.ordainingAuthority} ({ord.ordainingChurch})
                  </span>
                  <span className="font-mono text-slate-500">{ord.certificateNumber}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 6. LGPD AND ARCHIVAL VALIDATION */}
        <div className="pt-2 text-[10px] text-slate-500 leading-tight">
          Documento eclesiástico confidencial para arquivo pastoral e arquivo permanente da instituição. Tratamento de dados fundamentado no Art. 11, II, c da Lei nº 13.709/2018 (LGPD).
        </div>

        {/* Signatures */}
        <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
          <div>
            <div className="border-t border-slate-900 pt-1 font-semibold">{member.fullName}</div>
            <div className="text-[10px] text-slate-500">Assinatura do Membro Titular</div>
          </div>
          <div>
            <div className="border-t border-slate-900 pt-1 font-semibold">Secretaria Geral</div>
            <div className="text-[10px] text-slate-500">Conferido e Arquivado no Livro de Rol</div>
          </div>
          <div>
            <div className="border-t border-slate-900 pt-1 font-semibold">{settings.seniorPastorPresident}</div>
            <div className="text-[10px] text-slate-500">Pastor Presidente / Visto Homologado</div>
          </div>
        </div>
      </div>
    </div>
  );
};
