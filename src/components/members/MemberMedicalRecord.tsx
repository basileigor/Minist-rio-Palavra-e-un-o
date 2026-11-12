/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Printer,
  Edit,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Droplet,
  Sparkles,
  BookOpen,
  Award,
  Users,
  FileText,
  Clock,
  Shield,
  ShieldAlert,
  Lock,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Send,
  X,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import {
  calculateAge,
  formatDateBR,
  formatDateTimeBR,
  formatPhone,
  formatCPF,
  formatCEP,
  getStatusStyle,
  getRoleBadgeStyle,
} from '../../utils/formatters.ts';
import { PastoralCareRecord, TimelineEvent, MemberDocument } from '../../types/church.ts';

export const MemberMedicalRecord: React.FC = () => {
  const {
    members,
    selectedMemberId,
    setSelectedMemberId,
    congregations,
    setActiveView,
    activeTabInRecord,
    setActiveTabInRecord,
    currentUserRole,
    addPastoralCareRecord,
    addTimelineEvent,
    addDocument,
    deleteDocument,
    deleteMember,
    changeMemberStatus,
  } = useChurch();

  const member = members.find((m) => m.id === selectedMemberId) || members[0];
  const congregation = congregations.find((c) => c.id === member?.currentCongregationId);

  // Pastoral record modal state
  const [showPastoralModal, setShowPastoralModal] = useState(false);
  const [pastoralServiceType, setPastoralServiceType] = useState<PastoralCareRecord['serviceType']>('Aconselhamento');
  const [pastoralSubject, setPastoralSubject] = useState('');
  const [pastoralGuidance, setPastoralGuidance] = useState('');
  const [pastoralConfidentialNotes, setPastoralConfidentialNotes] = useState('');
  const [pastoralConfidentiality, setPastoralConfidentiality] = useState<PastoralCareRecord['confidentialityLevel']>('Pastoral Restrito');
  const [pastoralNextDate, setPastoralNextDate] = useState('');

  // Custom Timeline event modal state
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [timelineTitle, setTimelineTitle] = useState('');
  const [timelineDate, setTimelineDate] = useState('');
  const [timelineCategory, setTimelineCategory] = useState<TimelineEvent['category']>('espiritual');
  const [timelineDescription, setTimelineDescription] = useState('');

  // Upload document modal state
  const [showDocModal, setShowDocModal] = useState(false);
  const [docCategory, setDocCategory] = useState<MemberDocument['category']>('Outro Documento');
  const [docTitle, setDocTitle] = useState('');
  const [docFileName, setDocFileName] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState<'permanent' | 'soft'>('permanent');
  const [deleteReason, setDeleteReason] = useState('');

  const handleConfirmDelete = () => {
    if (!member) return;
    if (deleteMode === 'permanent') {
      deleteMember(member.id, deleteReason || 'Exclusão realizada a partir do prontuário');
    } else {
      changeMemberStatus(member.id, 'Membro Desligado', deleteReason || 'Desligado do rol eclesiástico');
    }
    setShowDeleteModal(false);
    setActiveView('members');
  };

  if (!member) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-4">
        <p className="text-slate-600 text-sm">Nenhum membro selecionado.</p>
        <button
          onClick={() => setActiveView('members')}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold"
        >
          Voltar para a Lista de Membros
        </button>
      </div>
    );
  }

  const age = calculateAge(member.birthDate);
  const statusStyle = getStatusStyle(member.currentStatus);
  const roleBadge = getRoleBadgeStyle(member.currentMinisterialRole);

  // Check access to sensitive pastoral care (LGPD compliance)
  const canAccessPastoral =
    currentUserRole === 'ADMIN_GERAL' ||
    currentUserRole === 'PASTOR_PRESIDENTE' ||
    currentUserRole === 'PASTOR_CONGREGACAO';

  const handleSavePastoralCare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastoralSubject.trim()) return;

    addPastoralCareRecord(member.id, {
      date: new Date().toISOString().split('T')[0],
      pastorName:
        currentUserRole === 'PASTOR_PRESIDENTE'
          ? 'Pr. Samuel Oliveira (Presidente)'
          : `Pastor / Conselheiro (${currentUserRole})`,
      serviceType: pastoralServiceType,
      subject: pastoralSubject,
      guidanceProvided: pastoralGuidance,
      followUpNeeded: Boolean(pastoralNextDate),
      nextAppointmentDate: pastoralNextDate || undefined,
      status: 'Em andamento',
      confidentialNotes: pastoralConfidentialNotes,
      confidentialityLevel: pastoralConfidentiality,
    });

    setShowPastoralModal(false);
    setPastoralSubject('');
    setPastoralGuidance('');
    setPastoralConfidentialNotes('');
    setPastoralNextDate('');
  };

  const handleSaveTimelineEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!timelineTitle.trim() || !timelineDate) return;

    addTimelineEvent(member.id, {
      title: timelineTitle,
      date: timelineDate,
      category: timelineCategory,
      description: timelineDescription,
      isAutomatic: false,
    });

    setShowTimelineModal(false);
    setTimelineTitle('');
    setTimelineDate('');
    setTimelineDescription('');
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    addDocument(member.id, {
      category: docCategory,
      title: docTitle,
      fileName: docFileName || 'documento_anexo.pdf',
      fileSize: '1.2 MB',
      fileUrl: '#',
      issueDate: new Date().toISOString().split('T')[0],
    });

    setShowDocModal(false);
    setDocTitle('');
    setDocFileName('');
  };

  const tabs = [
    { id: 'dados_pessoais', label: '1. Dados Pessoais' },
    { id: 'familia', label: '2. Família' },
    { id: 'vida_espiritual', label: '3. Vida Espiritual' },
    { id: 'conversao', label: '4. Conversão' },
    { id: 'batismo', label: '5. Batismo & Ordenanças' },
    { id: 'igrejas_anteriores', label: '6. Igrejas Anteriores' },
    { id: 'vida_ministerial', label: '7. Vida Ministerial' },
    { id: 'formacao_teologica', label: '8. Formação Teológica' },
    { id: 'departamentos', label: '9. Departamentos' },
    { id: 'congregações', label: '10. Congregações' },
    { id: 'pastoral', label: '11. Acompanhamento Pastoral' },
    { id: 'documentos', label: '12. Documentos' },
    { id: 'linha_tempo', label: '13. Linha do Tempo' },
    { id: 'alteracoes', label: '14. Alterações & LGPD' },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('members')}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Voltar à lista"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Prontuário Eclesiástico Individual
              </span>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">
                {member.fullName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedMemberId(member.id);
                setActiveView('print_record');
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir Ficha</span>
            </button>

            <button
              onClick={() => {
                setSelectedMemberId(member.id);
                setActiveView('wizard');
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteMode('permanent');
                setDeleteReason('');
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Excluir cadastro deste membro"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Excluir</span>
            </button>
          </div>
        </div>

        {/* Member Header Strip */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-amber-300 flex items-center justify-center font-bold text-lg text-slate-700 overflow-hidden shrink-0 shadow-xs">
              {member.photoUrl ? (
                <img
                  src={member.photoUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                member.fullName.charAt(0)
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-xs ${roleBadge.bg}`}>
                  {member.currentMinisterialRole}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyle.bg}`}
                >
                  {member.currentStatus}
                </span>
              </div>

              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 font-mono">
                <span>Matrícula: <strong>{member.registrationNumber}</strong></span>
                <span>·</span>
                <span>{age} anos ({formatDateBR(member.birthDate)})</span>
                <span>·</span>
                <span>{member.maritalStatus}</span>
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Congregação: <strong>{congregation?.name || 'Sede'}</strong></span>
                <span>·</span>
                <span>Admissão: {formatDateBR(member.admissionDate)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1 sm:max-w-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono">{formatPhone(member.primaryPhone)}</span>
            </div>
            {member.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{member.neighborhood}, {member.city} - {member.state}</span>
            </div>
          </div>
        </div>

        {/* 14 Tabs Navigation Bar */}
        <div className="mt-5 border-t border-slate-200 pt-2 flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabInRecord(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                activeTabInRecord === tab.id
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs min-h-[420px]">
        {/* TAB 1: DADOS PESSOAIS */}
        {activeTabInRecord === 'dados_pessoais' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 1 — Identificação & Dados Pessoais</h2>
              <span className="text-xs text-slate-400 font-mono">Última atualização: {formatDateBR(member.lastDataUpdateDate)}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium">Nome Completo</label>
                <div className="font-semibold text-slate-900 mt-0.5">{member.fullName}</div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">Nome Social (se aplicável)</label>
                <div className="text-slate-700 mt-0.5">{member.socialName || 'Não se aplica'}</div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">Sexo</label>
                <div className="text-slate-700 mt-0.5">{member.gender}</div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Data de Nascimento / Idade</label>
                <div className="text-slate-700 mt-0.5">
                  {formatDateBR(member.birthDate)} (<strong className="font-mono">{age} anos</strong>)
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">Naturalidade / Nacionalidade</label>
                <div className="text-slate-700 mt-0.5">
                  {member.birthplaceCity ? `${member.birthplaceCity}/${member.birthplaceState}` : '—'} · {member.nationality}
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">Estado Civil</label>
                <div className="text-slate-700 mt-0.5">{member.maritalStatus}</div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">Profissão</label>
                <div className="text-slate-700 mt-0.5">{member.profession || 'Não informada'}</div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">Escolaridade</label>
                <div className="text-slate-700 mt-0.5">{member.educationLevel || 'Não informada'}</div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">CPF (Protegido por Acesso)</label>
                <div className="font-mono text-slate-900 mt-0.5">
                  {formatCPF(member.cpf, currentUserRole === 'MEMBRO')}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-medium">RG / Órgão Emissor</label>
                <div className="font-mono text-slate-700 mt-0.5">
                  {member.rg || 'Não informado'} {member.rgIssuer ? `(${member.rgIssuer})` : ''}
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">Data de Emissão RG</label>
                <div className="text-slate-700 mt-0.5">{formatDateBR(member.rgIssueDate)}</div>
              </div>
              <div>
                <label className="text-slate-400 font-medium">CNH / Passaporte</label>
                <div className="font-mono text-slate-700 mt-0.5">
                  CNH: {member.cnh || '—'} · Passaporte: {member.passport || '—'}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Informações de Contato e Residência</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Telefone Principal / WhatsApp</label>
                  <div className="font-mono text-slate-900 mt-0.5">
                    {formatPhone(member.primaryPhone)} {member.whatsapp ? `(WhatsApp: ${formatPhone(member.whatsapp)})` : ''}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Telefone Secundário</label>
                  <div className="font-mono text-slate-700 mt-0.5">{formatPhone(member.secondaryPhone)}</div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">E-mail Principal</label>
                  <div className="text-slate-900 mt-0.5">{member.email || 'Não informado'}</div>
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-400 font-medium">Endereço Residencial Completo</label>
                  <div className="text-slate-900 mt-0.5">
                    {member.street}, nº {member.number} {member.complement ? `(${member.complement})` : ''} - {member.neighborhood}, {member.city}/{member.state}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">CEP / Tipo de Residência</label>
                  <div className="font-mono text-slate-700 mt-0.5">
                    {formatCEP(member.cep)} · {member.residenceType || 'Própria'}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Ponto de Referência</label>
                  <div className="text-slate-700 mt-0.5">{member.referencePoint || 'Nenhum informado'}</div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Melhor Horário para Contato</label>
                  <div className="text-slate-700 mt-0.5">{member.preferredContactTime || 'Qualquer Horário'}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Informações Complementares de Acolhimento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Como conheceu a instituição?</label>
                  <div className="text-slate-800 mt-0.5">{member.howMetChurch || 'Não informado'}</div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Quem o convidou?</label>
                  <div className="text-slate-800 mt-0.5">{member.whoInvited || 'Não informado'}</div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Data do 1º Contato / 1ª Visita</label>
                  <div className="text-slate-800 mt-0.5">
                    1º Contato: {formatDateBR(member.firstContactDate)} · 1ª Visita: {formatDateBR(member.firstVisitDate)}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Necessidades de Acessibilidade</label>
                  <div className="text-slate-800 mt-0.5">{member.accessibilityNeeds || 'Nenhuma informada'}</div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-400 font-medium">Observações Gerais da Secretaria</label>
                  <div className="text-slate-700 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {member.generalNotes || 'Sem observações adicionais.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FAMÍLIA */}
        {activeTabInRecord === 'familia' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 2 — Dados Familiares & Árvore Genealógica</h2>
              <button
                onClick={() => setActiveView('family_tree')}
                className="text-xs text-amber-700 hover:underline font-semibold"
              >
                Abrir Visualizador Gráfico de Árvore Familiar &rarr;
              </button>
            </div>

            {/* Parents */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Filiação (Pais)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="text-slate-400">Nome do Pai</div>
                  <div className="font-semibold text-slate-900">{member.fatherName || 'Não informado'}</div>
                  <div className="text-slate-500">
                    Status: {member.fatherIsAlive !== undefined ? (member.fatherIsAlive ? 'Vivo' : 'Falecido') : 'Não informado'}
                    {member.fatherReligion ? ` · Religião: ${member.fatherReligion}` : ''}
                  </div>
                  {member.fatherIsChurchMember && (
                    <span className="inline-block px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded font-medium">
                      Membro desta Instituição
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-slate-400">Nome da Mãe</div>
                  <div className="font-semibold text-slate-900">{member.motherName || 'Não informada'}</div>
                  <div className="text-slate-500">
                    Status: {member.motherIsAlive !== undefined ? (member.motherIsAlive ? 'Viva' : 'Falecida') : 'Não informada'}
                    {member.motherReligion ? ` · Religião: ${member.motherReligion}` : ''}
                  </div>
                  {member.motherIsChurchMember && (
                    <span className="inline-block px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded font-medium">
                      Membro desta Instituição
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Conjugal */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Informações Conjugais</h3>
              {member.maritalStatus === 'Casado(a)' || member.spouseName ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400">Nome do Cônjuge</label>
                    <div className="font-semibold text-slate-900 mt-0.5">{member.spouseName}</div>
                    {member.spouseMemberId && (
                      <button
                        onClick={() => setSelectedMemberId(member.spouseMemberId!)}
                        className="text-[11px] text-amber-700 hover:underline mt-1 block"
                      >
                        Ver prontuário do cônjuge &rarr;
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-slate-400">Data do Casamento</label>
                    <div className="text-slate-800 mt-0.5">{formatDateBR(member.marriageDate)}</div>
                  </div>
                  <div>
                    <label className="text-slate-400">Tipo de União</label>
                    <div className="text-slate-800 mt-0.5">{member.unionType || 'Civil e Religioso'}</div>
                  </div>
                  <div>
                    <label className="text-slate-400">Cônjuge é Cristão?</label>
                    <div className="text-slate-800 mt-0.5">{member.spouseIsChristian ? 'Sim, evangélico' : 'Não'}</div>
                  </div>
                  <div>
                    <label className="text-slate-400">Cônjuge é Membro desta Igreja?</label>
                    <div className="text-slate-800 mt-0.5">{member.spouseIsChurchMember ? 'Sim, membro cadastrado' : 'Não'}</div>
                  </div>
                  <div>
                    <label className="text-slate-400">Igreja do Cônjuge</label>
                    <div className="text-slate-800 mt-0.5">{member.spouseChurchName || 'Esta instituição'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">Membro solteiro(a), sem vínculo conjugal registrado.</div>
              )}
            </div>

            {/* Children */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Filhos Cadastrados ({member.children.length})
                </h3>
              </div>

              {member.children.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                  Nenhum filho registrado no prontuário.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {member.children.map((child) => (
                    <div key={child.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-slate-900">{child.fullName}</div>
                      <div className="text-slate-500">
                        Nasc: {formatDateBR(child.birthDate)} ({calculateAge(child.birthDate)} anos) · {child.gender}
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {child.isChurchMember && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded font-medium">
                            Membro
                          </span>
                        )}
                        {child.isBaptized && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded font-medium">
                            Batizado(a)
                          </span>
                        )}
                        {child.attendsSundaySchool && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded font-medium">
                            Frequenta EBD
                          </span>
                        )}
                      </div>
                      {child.linkedMemberId && (
                        <button
                          onClick={() => setSelectedMemberId(child.linkedMemberId!)}
                          className="text-[11px] text-amber-700 hover:underline pt-1 block"
                        >
                          Acessar ficha deste filho &rarr;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VIDA ESPIRITUAL */}
        {activeTabInRecord === 'vida_espiritual' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 3 — Trajetória Espiritual & Experiências</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <label className="text-slate-400 font-medium">1. Já teve experiência religiosa anterior?</label>
                <div className="font-semibold text-slate-800">{member.hadPreviousReligiousExperience ? 'Sim' : 'Não'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <label className="text-slate-400 font-medium">2. Religião ou tradição anterior</label>
                <div className="font-semibold text-slate-800">{member.previousReligion || 'Nenhuma / Não declarada'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <label className="text-slate-400 font-medium">3. Já havia sido membro de outra denominação?</label>
                <div className="font-semibold text-slate-800">{member.wasMemberOfOtherDenomination ? 'Sim' : 'Não'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <label className="text-slate-400 font-medium">4. Participação em campanhas, congressos e retiros</label>
                <div className="text-slate-800">{member.spiritualEventsAttended || 'Não informada'}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 md:col-span-2">
                <label className="text-slate-400 font-medium">5. Já passou por período de afastamento espiritual?</label>
                <div className="text-slate-800">
                  {member.hadSpiritualDrynessPeriod ? 'Sim, relatou histórico de afastamento temporário anterior.' : 'Não relatou períodos de afastamento.'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 md:col-span-2">
                <label className="text-slate-400 font-medium">6. Relato da trajetória espiritual e observações autorizadas</label>
                <div className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {member.spiritualTrajectoryDetails || member.authorizedPastoralNotes || 'Trajetória espiritual sem observações pastorais restritivas registradas.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONVERSÃO */}
        {activeTabInRecord === 'conversao' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 3.1 — Histórico de Conversão a Jesus Cristo</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="text-slate-400">Data ou Período da Conversão</label>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {formatDateBR(member.conversionDate)}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="text-slate-400">Local da Conversão</label>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {member.conversionPlace || 'Altar do templo'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <label className="text-slate-400">Igreja onde ocorreu</label>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {member.conversionChurch || 'Igreja Sede'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 md:col-span-3">
                <label className="text-slate-400">Responsável por conduzir ou acompanhar esse momento</label>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {member.mentoredBy || 'Ministério de Evangelismo'}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 md:col-span-3">
                <label className="text-slate-400">Situação Espiritual e Pessoal antes da Conversão</label>
                <div className="text-slate-800 mt-1 leading-relaxed">
                  {member.situationBeforeConversion || 'Informação não fornecida.'}
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 md:col-span-3">
                <div className="flex items-center gap-2 mb-2 text-amber-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Testemunho Pessoal de Conversão Declarado</span>
                </div>
                <div className="text-xs text-slate-800 italic leading-relaxed whitespace-pre-wrap">
                  "{member.personalTestimonyText || member.conversionStoryDetails || 'Testemunho verbal prestado na recepção de novos membros.'}"
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BATISMO E ORDENANÇAS */}
        {activeTabInRecord === 'batismo' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 4 — Batismo e Ordenanças Eclesiásticas</h2>
            </div>

            {/* Water Baptism */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span>Batismo nas Águas</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.isWaterBaptized ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {member.isWaterBaptized ? 'Batizado(a)' : 'Não Batizado(a)'}
                </span>
              </div>

              {member.isWaterBaptized ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
                  <div>
                    <label className="text-slate-400">Data do Batismo</label>
                    <div className="font-bold text-slate-900 font-mono mt-0.5">
                      {formatDateBR(member.waterBaptismDate)}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400">Igreja / Local</label>
                    <div className="text-slate-900 mt-0.5">{member.waterBaptismChurch || 'Templo Central'}</div>
                  </div>
                  <div>
                    <label className="text-slate-400">Cidade / Estado</label>
                    <div className="text-slate-900 mt-0.5">
                      {member.waterBaptismCity ? `${member.waterBaptismCity}/${member.waterBaptismState}` : '—'}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400">Pastor Responsável / Celebrante</label>
                    <div className="text-slate-900 mt-0.5">{member.officiatingPastor || 'Pastor Titular'}</div>
                  </div>
                  <div>
                    <label className="text-slate-400">Forma de Batismo</label>
                    <div className="text-slate-900 mt-0.5">{member.baptismMode || 'Imersão Bíblica'}</div>
                  </div>
                  <div>
                    <label className="text-slate-400">Número do Certificado</label>
                    <div className="font-mono text-slate-900 mt-0.5">
                      {member.baptismCertificateNumber || 'Certificado Arquivado'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-600">
                  {member.waterBaptismNotes || 'Pessoa em preparação bíblica ou aguardando próximo batismo nas águas.'}
                </div>
              )}
            </div>

            {/* Holy Spirit Baptism */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Batismo no Espírito Santo (Conforme Fé Declarada)</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    member.hasHolySpiritBaptism ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {member.hasHolySpiritBaptism ? 'Experiência Declarada' : 'Não Declarado'}
                </span>
              </div>

              {member.hasHolySpiritBaptism && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                  <div>
                    <label className="text-slate-400">Data / Período da Experiência</label>
                    <div className="font-mono text-slate-900 mt-0.5">
                      {formatDateBR(member.holySpiritBaptismDate)}
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400">Local / Igreja</label>
                    <div className="text-slate-900 mt-0.5">
                      {member.holySpiritBaptismPlace || member.holySpiritBaptismChurch || 'Culto de oração'}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-400">Relato Pessoal da Experiência</label>
                    <div className="text-slate-800 italic mt-0.5">
                      "{member.holySpiritBaptismAccount || 'Evidência bíblica e dons espirituais declarados pelo membro.'}"
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Holy Communion & Dedication */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Santa Ceia do Senhor</div>
                <div className="text-slate-600">
                  Participa regularmente:{' '}
                  <strong className="text-slate-900">{member.partakesHolyCommunionRegularly ? 'Sim' : 'Não'}</strong>
                </div>
                <div className="text-slate-500">
                  Primeira ceia: {formatDateBR(member.firstHolyCommunionDate)}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">Apresentação / Dedicação Infantil</div>
                <div className="text-slate-600">
                  {member.childDedicationDate
                    ? `Dedicado(a) em ${formatDateBR(member.childDedicationDate)} por ${member.childDedicatedBy || 'Pastor'}`
                    : 'Sem registro de apresentação de infância.'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: IGREJAS ANTERIORES */}
        {activeTabInRecord === 'igrejas_anteriores' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 5 — Histórico de Igrejas Anteriores</h2>
            </div>

            {member.previousChurches.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Nenhuma igreja anterior registrada. Membro formado desde o início nesta instituição ou sem transferências prévias.
              </div>
            ) : (
              <div className="space-y-3">
                {member.previousChurches.map((ch, idx) => (
                  <div key={ch.id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">{ch.churchName}</div>
                      <span className="font-mono text-slate-500 text-[11px]">{ch.period || `${ch.startDate || ''} - ${ch.endDate || ''}`}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600 pt-1">
                      <div>Denominação: <strong>{ch.denomination}</strong></div>
                      <div>Pastor Responsável: <strong>{ch.seniorPastor || '—'}</strong></div>
                      <div>Cidade/UF: <strong>{ch.city}/{ch.state}</strong></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                      <div>Funções/Ministérios exercidos: {ch.rolesHeld || ch.ministriesParticipated || 'Membro ouvinte'}</div>
                      <div>Motivo da saída: {ch.reasonForLeaving || 'Mudança residencial'}</div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px]">
                      {ch.hasRecommendationLetter && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">
                          Possui Carta de Recomendação
                        </span>
                      )}
                      {ch.hasTransferLetter && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">
                          Possui Carta de Transferência
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: VIDA MINISTERIAL */}
        {activeTabInRecord === 'vida_ministerial' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 7 — Histórico Ministerial, Consagrações & Ordenações</h2>
              <button
                onClick={() => setActiveView('ministerial')}
                className="text-xs text-amber-700 hover:underline font-semibold"
              >
                Ver Gestão Ministerial Completa &rarr;
              </button>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-800 font-medium">Função Ministerial Atual:</span>
                <div className="text-lg font-bold text-amber-950 mt-0.5">{member.currentMinisterialRole}</div>
              </div>
              {member.leadershipExperience.hasMinisterialCredentials && (
                <div className="text-right text-xs">
                  <span className="text-slate-500">Credencial nº:</span>
                  <div className="font-mono font-bold text-slate-900">{member.leadershipExperience.credentialsNumber}</div>
                  <div className="text-[11px] text-slate-500">Válida até: {formatDateBR(member.leadershipExperience.credentialsExpiryDate)}</div>
                </div>
              )}
            </div>

            {/* Consagrations Timeline */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Histórico Cronológico de Ordenações ({member.ordinations.length})
              </h3>
              {member.ordinations.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                  Membro sem ordenações eclesiásticas formais registradas.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {member.ordinations.map((ord, idx) => (
                    <div key={ord.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-600" />
                          <span>{ord.roleTitle}</span>
                        </div>
                        <div className="text-slate-600">
                          Ordenado em <strong>{formatDateBR(ord.ordinationDate)}</strong> por <strong>{ord.ordainingAuthority}</strong>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Igreja: {ord.ordainingChurch} {ord.certificateNumber ? `· Certificado: ${ord.certificateNumber}` : ''}
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded">
                        {ord.ordinationDate.slice(0, 4)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leadership Experience */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider">Histórico de Liderança</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div>Já liderou departamento: <strong>{member.leadershipExperience.ledDepartment ? 'Sim' : 'Não'}</strong></div>
                <div>Departamentos liderados: <strong>{member.leadershipExperience.departmentsLed || 'Nenhum'}</strong></div>
                <div>Já liderou congregação: <strong>{member.leadershipExperience.ledCongregation ? 'Sim' : 'Não'}</strong></div>
                <div>Já pastoreou igreja: <strong>{member.leadershipExperience.pastoredChurch ? 'Sim' : 'Não'}</strong></div>
                <div>Participação em concílios: <strong>{member.leadershipExperience.participatedInCouncils ? 'Sim' : 'Não'}</strong></div>
                <div>Liderança regional: <strong>{member.leadershipExperience.exercisedRegionalLeadership ? 'Sim' : 'Não'}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: FORMAÇÃO TEOLÓGICA */}
        {activeTabInRecord === 'formacao_teologica' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 8 — Formação Bíblica, Teológica e Ministerial</h2>
            </div>

            {member.theologicalCourses.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Nenhum curso bíblico ou teológico cadastrado até o momento.
              </div>
            ) : (
              <div className="space-y-3">
                {member.theologicalCourses.map((c, idx) => (
                  <div key={c.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{c.courseName}</div>
                      <div className="text-slate-600 mt-0.5">
                        {c.institution} · Conclusão: {formatDateBR(c.completionDate)} {c.workloadHours ? `(${c.workloadHours} horas)` : ''}
                      </div>
                      {c.certificateNumber && (
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5">Certificado nº {c.certificateNumber}</div>
                      )}
                    </div>
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 font-medium rounded text-[11px]">
                      {c.courseType}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <h3 className="font-bold text-slate-800 uppercase tracking-wider">Aptidões e Experiência Ministerial Prática</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                <div>Experiência como professor: <strong>{member.theologicalSkills.teachingExperience ? 'Sim' : 'Não'}</strong></div>
                <div>Ministra estudos bíblicos: <strong>{member.theologicalSkills.taughtBibleStudies ? 'Sim' : 'Não'}</strong></div>
                <div>Experiência em pregação: <strong>{member.theologicalSkills.preachingExperience ? 'Sim' : 'Não'}</strong></div>
                <div>Experiência em aconselhamento: <strong>{member.theologicalSkills.counselingExperience ? 'Sim' : 'Não'}</strong></div>
                <div>Formação em missões: <strong>{member.theologicalSkills.missionsTraining ? 'Sim' : 'Não'}</strong></div>
                <div>Áreas específicas de conhecimento: <strong>{member.theologicalSkills.bibleKnowledgeAreas || 'Geral'}</strong></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DEPARTAMENTOS */}
        {activeTabInRecord === 'departamentos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 6 — Departamentos e Ministérios de Atuação</h2>
            </div>

            {member.ministries.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                Membro não vinculado formalmente a nenhum departamento no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {member.ministries.map((min, idx) => (
                  <div key={min.id || idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{min.departmentName}</div>
                      <div className="text-slate-600 mt-0.5">Função: <strong>{min.roleHeld}</strong></div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Início: {formatDateBR(min.startDate)} {min.endDate ? `· Término: ${formatDateBR(min.endDate)}` : ''}
                      </div>
                      {min.description && <div className="text-slate-600 mt-1 italic">{min.description}</div>}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        min.isCurrent ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {min.isCurrent ? 'Atuação Atual' : 'Encerrado'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 10: CONGREGAÇÕES */}
        {activeTabInRecord === 'congregações' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 9 — Congregações & Histórico de Transferências</h2>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Congregação Atual:</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">{congregation?.name}</div>
                <div className="text-slate-500 mt-0.5">Pastor Responsável: {congregation?.seniorPastor}</div>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Data de Ingresso:</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{formatDateBR(member.admissionDate)}</div>
                <div className="text-slate-500 text-[11px]">Forma: {member.admissionType}</div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Movimentações e Transferências Internas ({member.congregationTransfers.length})
              </h3>

              {member.congregationTransfers.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                  Membro sempre permaneceu na congregação atual sem transferências registradas.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {member.congregationTransfers.map((tr) => (
                    <div key={tr.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900">
                          {tr.fromCongregationName || 'Origem'} &rarr; {tr.toCongregationName}
                        </div>
                        <span className="font-mono text-[11px] text-slate-500">{formatDateBR(tr.transferDate)}</span>
                      </div>
                      <div className="text-slate-600 mt-1">Motivo: {tr.reason || 'Transferência solicitada'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 11: ACOMPANHAMENTO PASTORAL */}
        {activeTabInRecord === 'pastoral' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">Módulo 10 — Acompanhamento Pastoral & Aconselhamentos</h2>
              </div>
              {canAccessPastoral && (
                <button
                  onClick={() => setShowPastoralModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Atendimento</span>
                </button>
              )}
            </div>

            {!canAccessPastoral ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">Acesso Restrito ao Gabinete Pastoral</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Conforme as diretrizes da LGPD (Art. 11, II, c) e o sigilo pastoral eclesiástico,
                  este módulo é acessível apenas a Pastores e Administradores Gerais. Alterne seu perfil no menu superior para visualizar este conteúdo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Sigilo Pastoral Ativo:</strong> Registros confidenciais protegidos para aconselhamento familiar, espiritual e orientação pastoral.
                  </span>
                </div>

                {member.pastoralCareRecords.length === 0 ? (
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Nenhum atendimento pastoral registrado para esta pessoa. Clique em "Novo Atendimento" para registrar uma visita ou aconselhamento.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {member.pastoralCareRecords.map((care) => (
                      <div key={care.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                            <span>{care.serviceType}</span>
                            <span className="text-xs font-normal text-slate-500">por {care.pastorName}</span>
                          </div>
                          <span className="font-mono text-slate-500">{formatDateBR(care.date)}</span>
                        </div>

                        <div>
                          <strong className="text-slate-800">Assunto:</strong> {care.subject}
                        </div>
                        <div>
                          <strong className="text-slate-800">Orientações Fornecidas:</strong> {care.guidanceProvided}
                        </div>
                        {care.confidentialNotes && (
                          <div className="p-2.5 bg-amber-50 rounded border border-amber-200 text-amber-950 italic">
                            <strong>Anotações Reservadas:</strong> {care.confidentialNotes}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                          <span>Nível: <strong className="text-slate-700">{care.confidentialityLevel}</strong></span>
                          {care.nextAppointmentDate && (
                            <span className="text-amber-800 font-semibold">
                              Próximo Retorno: {formatDateBR(care.nextAppointmentDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 12: DOCUMENTOS */}
        {activeTabInRecord === 'documentos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 12 — Gestão Eletrônica de Documentos & Certidões</h2>
              <button
                onClick={() => setShowDocModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Anexar Documento</span>
              </button>
            </div>

            {member.documents.length === 0 ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p>Nenhum documento anexado ao prontuário.</p>
                <button
                  onClick={() => setShowDocModal(true)}
                  className="text-amber-700 hover:underline font-semibold"
                >
                  Fazer upload do primeiro documento &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {member.documents.map((doc) => (
                  <div key={doc.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-semibold truncate max-w-[170px]">
                          {doc.category}
                        </span>
                        <button
                          onClick={() => deleteDocument(member.id, doc.id)}
                          className="text-slate-400 hover:text-rose-600 p-0.5"
                          title="Remover anexo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="font-bold text-slate-900 mt-2">{doc.title}</div>
                      <div className="text-slate-500 font-mono text-[11px] truncate mt-0.5">{doc.fileName}</div>
                      {doc.expiryDate && (
                        <div className="text-amber-800 text-[11px] mt-1">Validade: {formatDateBR(doc.expiryDate)}</div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{formatDateBR(doc.uploadDate)}</span>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(`Visualização do arquivo: ${doc.fileName}`);
                        }}
                        className="text-amber-700 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Baixar</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 13: LINHA DO TEMPO */}
        {activeTabInRecord === 'linha_tempo' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 13 — Linha do Tempo Eclesiástica Automática & Histórica</h2>
              <button
                onClick={() => setShowTimelineModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Marco Histórico</span>
              </button>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {member.timeline.map((event) => (
                <div key={event.id} className="relative group">
                  <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-amber-600 ring-4 ring-white" />
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-sm">{event.title}</div>
                      <span className="font-mono text-slate-500 font-medium">{formatDateBR(event.date)}</span>
                    </div>
                    <div className="text-slate-600 leading-relaxed">{event.description}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider pt-1">
                      Categoria: {event.category} {event.isAutomatic ? '· Gerado Automaticamente' : '· Registro Manual'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 14: ALTERAÇÕES & LGPD */}
        {activeTabInRecord === 'alteracoes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Módulo 14 — Auditoria, Histórico de Alterações & Conformidade LGPD</h2>
            </div>

            {/* LGPD Consent Banner */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-950">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Consentimento e Base Legal LGPD Ativos</span>
              </div>
              <div>Base Legal: <strong>{member.lgpdLegalBasis}</strong></div>
              <div className="text-emerald-800 text-[11px]">
                Consentimento concedido em: {formatDateBR(member.lgpdConsentDate)} · Direito de retificação, consulta e revogação garantidos ao titular.
              </div>
            </div>

            {/* Status History */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Histórico de Mudanças de Situação Eclesiástica
              </h3>
              <div className="space-y-2 text-xs">
                {member.statusHistory.map((sh) => (
                  <div key={sh.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-600">{sh.previousStatus}</span>
                      <span className="mx-2">&rarr;</span>
                      <strong className="text-slate-900">{sh.newStatus}</strong>
                      {sh.reason && <div className="text-slate-500 text-[11px] mt-0.5">{sh.reason}</div>}
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <div>{formatDateBR(sh.date)}</div>
                      <div>por {sh.changedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Audit Log */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Trilha de Auditoria do Prontuário
              </h3>
              {member.auditLogs.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                  Nenhum registro de auditoria modificado recentemente.
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  {member.auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900">{log.action}:</strong> {log.fieldChanged || 'Registro geral'}
                        {log.newValue && <div className="text-slate-500 text-[11px]">{log.newValue}</div>}
                      </div>
                      <div className="text-right text-[11px] text-slate-400 font-mono">
                        <div>{formatDateTimeBR(log.timestamp)}</div>
                        <div>{log.userName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pastoral Record Modal */}
      {showPastoralModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSavePastoralCare} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Registrar Atendimento Pastoral & Aconselhamento
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Atendimento:</label>
              <select
                value={pastoralServiceType}
                onChange={(e) => setPastoralServiceType(e.target.value as any)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Aconselhamento">Aconselhamento</option>
                <option value="Visita pastoral">Visita pastoral</option>
                <option value="Orientação familiar">Orientação familiar</option>
                <option value="Acompanhamento espiritual">Acompanhamento espiritual</option>
                <option value="Novos convertidos">Novos convertidos</option>
                <option value="Acompanhamento de líderes">Acompanhamento de líderes</option>
                <option value="Visita hospitalar">Visita hospitalar</option>
                <option value="Apoio social">Apoio social</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assunto / Motivo:</label>
              <input
                type="text"
                required
                value={pastoralSubject}
                onChange={(e) => setPastoralSubject(e.target.value)}
                placeholder="Ex: Orientação sobre vocação ministerial / Crise familiar..."
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Orientações Bíblicas / Pastorais Fornecidas:</label>
              <textarea
                rows={3}
                value={pastoralGuidance}
                onChange={(e) => setPastoralGuidance(e.target.value)}
                placeholder="Orientações e passagens bíblicas compartilhadas..."
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Anotações Confidenciais (Gabinete Pastoral):</label>
              <textarea
                rows={2}
                value={pastoralConfidentialNotes}
                onChange={(e) => setPastoralConfidentialNotes(e.target.value)}
                placeholder="Detalhes íntimos sob estrito sigilo pastoral..."
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nível de Sigilo:</label>
                <select
                  value={pastoralConfidentiality}
                  onChange={(e) => setPastoralConfidentiality(e.target.value as any)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Pastoral Geral">Pastoral Geral</option>
                  <option value="Pastoral Restrito">Pastoral Restrito</option>
                  <option value="Gabinete Pastoral (Sigilo Absoluto)">Gabinete Pastoral (Sigilo Absoluto)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Próximo Retorno (Opcional):</label>
                <input
                  type="date"
                  value={pastoralNextDate}
                  onChange={(e) => setPastoralNextDate(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPastoralModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Salvar Atendimento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Timeline Event Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSaveTimelineEvent} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Adicionar Marco Histórico à Linha do Tempo
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Acontecimento:</label>
              <input
                type="text"
                required
                value={timelineTitle}
                onChange={(e) => setTimelineTitle(e.target.value)}
                placeholder="Ex: Viagem missionária ao sertão / Casamento na igreja..."
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data:</label>
              <input
                type="date"
                required
                value={timelineDate}
                onChange={(e) => setTimelineDate(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria:</label>
              <select
                value={timelineCategory}
                onChange={(e) => setTimelineCategory(e.target.value as any)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="espiritual">Espiritual</option>
                <option value="sacramental">Sacramental</option>
                <option value="ministerial">Ministerial</option>
                <option value="departamental">Departamental</option>
                <option value="pastoral">Pastoral</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Detalhada:</label>
              <textarea
                rows={3}
                value={timelineDescription}
                onChange={(e) => setTimelineDescription(e.target.value)}
                placeholder="Relato histórico deste momento..."
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTimelineModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Gravar Marco Histórico
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Document Upload Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <form onSubmit={handleSaveDocument} className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Anexar Documento ao Prontuário
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria do Documento:</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value as any)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Documento de Identidade (RG/CPF)">Documento de Identidade (RG/CPF)</option>
                <option value="Certidão de Nascimento/Casamento">Certidão de Nascimento/Casamento</option>
                <option value="Certificado de Batismo">Certificado de Batismo</option>
                <option value="Carta de Transferência">Carta de Transferência</option>
                <option value="Carta de Recomendação">Carta de Recomendação</option>
                <option value="Diploma/Certificado Bíblico">Diploma/Certificado Bíblico</option>
                <option value="Credencial Ministerial">Credencial Ministerial</option>
                <option value="Termo de Consentimento LGPD">Termo de Consentimento LGPD</option>
                <option value="Outro Documento">Outro Documento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Documento:</label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="Ex: Certificado de Batismo Original Digitalizado"
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Arquivo:</label>
              <input
                type="text"
                value={docFileName}
                onChange={(e) => setDocFileName(e.target.value)}
                placeholder="Ex: certificado_batismo_digitalizado.pdf"
                className="w-full p-2 text-xs border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDocModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Salvar Anexo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Member Modal */}
      {showDeleteModal && member && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-rose-200 w-full max-w-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Excluir Prontuário de Membro
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ação irreversível ou arquivamento de histórico
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div>
                <span className="text-slate-500">Membro:</span>{' '}
                <strong className="text-slate-900">{member.fullName}</strong>
              </div>
              <div className="flex gap-4 text-slate-600">
                <span>Matrícula: <strong className="font-mono text-slate-800">{member.registrationNumber}</strong></span>
                <span>Cargo: <strong>{member.currentMinisterialRole}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Selecione a ação desejada:
              </label>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${deleteMode === 'permanent' ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name="recordDeleteMode"
                    value="permanent"
                    checked={deleteMode === 'permanent'}
                    onChange={() => setDeleteMode('permanent')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-rose-900">
                      Exclusão Definitiva do Sistema
                    </div>
                    <div className="text-[11px] text-rose-700/80">
                      Remove todo o cadastro do banco de dados, certidões e histórico eclesiástico.
                    </div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${deleteMode === 'soft' ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    name="recordDeleteMode"
                    value="soft"
                    checked={deleteMode === 'soft'}
                    onChange={() => setDeleteMode('soft')}
                    className="mt-0.5 text-amber-600 focus:ring-amber-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-amber-900">
                      Desligar do Rol Eclesiástico (Recomendado)
                    </div>
                    <div className="text-[11px] text-amber-700/80">
                      Mantém o prontuário arquivado com status "Membro Desligado" para consultas históricas.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo / Justificativa da Exclusão:
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={2}
                placeholder="Ex: Cadastro duplicado, transferência não comunicada, falecimento, solicitação própria..."
                className="w-full p-2.5 text-xs border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleteMode === 'permanent' ? 'Excluir Definitivamente' : 'Desligar Membro'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
