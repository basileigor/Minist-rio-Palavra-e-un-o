/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Sparkles,
  Droplet,
  Award,
  BookOpen,
  Shield,
  Heart,
  FileCheck,
} from 'lucide-react';
import { useChurch } from '../../context/ChurchContext.tsx';
import { Member, ChildInfo, MinisterialRole, MemberStatus } from '../../types/church.ts';
import { calculateAge } from '../../utils/formatters.ts';

export const MemberFormWizard: React.FC = () => {
  const {
    congregations,
    addMember,
    updateMember,
    selectedMemberId,
    getMemberById,
    setActiveView,
    setSelectedMemberId,
  } = useChurch();

  const existingMember = selectedMemberId ? getMemberById(selectedMemberId) : null;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Form State
  const [formData, setFormData] = useState<Partial<Member>>(() => {
    if (existingMember) {
      return { ...existingMember };
    }
    return {
      fullName: '',
      socialName: '',
      gender: 'Masculino',
      birthDate: '1995-01-01',
      nationality: 'Brasileira',
      birthplaceCity: '',
      birthplaceState: 'RJ',
      maritalStatus: 'Solteiro(a)',
      profession: '',
      educationLevel: 'Ensino Médio Completo',
      cpf: '',
      rg: '',
      rgIssuer: 'DETRAN-RJ',
      rgIssueDate: '',
      cnh: '',
      passport: '',
      primaryPhone: '',
      secondaryPhone: '',
      whatsapp: '',
      email: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: 'Nova Iguaçu',
      state: 'RJ',
      referencePoint: '',
      residenceType: 'Própria',
      preferredContactTime: 'Qualquer Horário',
      howMetChurch: '',
      whoInvited: '',
      firstContactDate: '',
      firstVisitDate: '',
      accessibilityNeeds: '',
      generalNotes: '',

      fatherName: '',
      fatherIsAlive: true,
      fatherReligion: '',
      fatherIsChurchMember: false,
      motherName: '',
      motherIsAlive: true,
      motherReligion: '',
      motherIsChurchMember: false,

      spouseName: '',
      marriageDate: '',
      unionType: 'Civil e Religioso',
      spouseIsChristian: true,
      spouseIsChurchMember: true,
      spouseChurchName: '',

      children: [],
      otherRelatives: [],

      hadPreviousReligiousExperience: false,
      previousReligion: '',
      attendedEvangelicalChurchBefore: false,
      firstEvangelicalChurchAttended: '',
      conversionDate: '',
      conversionPlace: 'Altar do Templo',
      conversionChurch: 'Ministério Palavra e Unção',
      mentoredBy: '',
      conversionStoryDetails: '',
      situationBeforeConversion: '',
      wasMemberOfOtherDenomination: false,
      spiritualEventsAttended: '',
      personalTestimonyText: '',
      hadSpiritualDrynessPeriod: false,

      isWaterBaptized: false,
      waterBaptismDate: '',
      waterBaptismChurch: '',
      waterBaptismCity: '',
      waterBaptismState: 'RJ',
      officiatingPastor: '',
      baptismMode: 'Imersão',
      hasBaptismCertificate: false,
      baptismCertificateNumber: '',

      hasHolySpiritBaptism: false,
      holySpiritBaptismDate: '',
      holySpiritBaptismAccount: '',

      partakesHolyCommunionRegularly: false,
      firstHolyCommunionDate: '',

      previousChurches: [],
      ministries: [],

      currentMinisterialRole: 'Membro',
      ordinations: [],
      leadershipExperience: {
        ledDepartment: false,
        departmentsLed: '',
        hasMinisterialCredentials: false,
      },

      theologicalCourses: [],
      theologicalSkills: {
        teachingExperience: false,
        preachingExperience: false,
        counselingExperience: false,
        missionsTraining: false,
      },

      currentCongregationId: congregations[0]?.id || 'cong-01',
      admissionDate: new Date().toISOString().split('T')[0],
      admissionType: 'Aclamação',
      currentStatus: 'Membro Ativo',
      assignedPastor: '',

      documents: [],
      lgpdConsentGiven: true,
      lgpdLegalBasis: 'Consentimento do Titular e Atividades de Organização Religiosa (LGPD Art. 11, II, c)',
    };
  });

  const calculatedAge = calculateAge(formData.birthDate);

  const handleFieldChange = (field: keyof Member, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddChild = () => {
    const newChild: ChildInfo = {
      id: `child-${Date.now()}`,
      fullName: '',
      birthDate: '2015-01-01',
      gender: 'Masculino',
      isChurchMember: false,
      isBaptized: false,
      attendsSundaySchool: true,
    };
    setFormData((prev) => ({
      ...prev,
      children: [...(prev.children || []), newChild],
    }));
  };

  const handleUpdateChild = (id: string, updates: Partial<ChildInfo>) => {
    setFormData((prev) => ({
      ...prev,
      children: (prev.children || []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const handleRemoveChild = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      children: (prev.children || []).map((c) => c).filter((c) => c.id !== id),
    }));
  };

  const handleSaveDraft = () => {
    if (existingMember) {
      updateMember(existingMember.id, formData, 'Rascunho atualizado');
      alert('Rascunho salvo com sucesso no prontuário!');
    } else {
      const created = addMember(formData);
      setSelectedMemberId(created.id);
      alert('Cadastro preliminar iniciado com sucesso! Você pode continuar preenchendo a qualquer momento.');
    }
  };

  const handleFinishWizard = () => {
    if (!formData.fullName?.trim()) {
      alert('Por favor, informe ao menos o Nome Completo da pessoa.');
      setCurrentStep(1);
      return;
    }

    if (existingMember) {
      updateMember(existingMember.id, formData, 'Edição completa via assistente de cadastro');
      setSelectedMemberId(existingMember.id);
    } else {
      const created = addMember(formData);
      setSelectedMemberId(created.id);
    }

    setActiveView('member_record');
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-12">
      {/* Wizard Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('members')}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-600 font-semibold">
              Assistente de Cadastro Eclesiástico
            </span>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {existingMember ? `Editar: ${existingMember.fullName}` : 'Ficha Cadastral Completa por Etapas'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span>Salvar Rascunho</span>
          </button>

          <button
            type="button"
            onClick={handleFinishWizard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Concluir Cadastro</span>
          </button>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {[
            { step: 1, title: '1. Pessoais & Contato' },
            { step: 2, title: '2. Família' },
            { step: 3, title: '3. Conversão' },
            { step: 4, title: '4. Batismos' },
            { step: 5, title: '5. Histórico Eclesiástico' },
            { step: 6, title: '6. Ministério & Teologia' },
            { step: 7, title: '7. Lotação & LGPD' },
          ].map((st) => (
            <button
              key={st.step}
              onClick={() => setCurrentStep(st.step)}
              className={`flex-1 flex items-center justify-center py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                currentStep === st.step
                  ? 'bg-amber-600 text-white shadow-xs'
                  : currentStep > st.step
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span>{st.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Step Body */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs min-h-[460px]">
        {/* STEP 1: DADOS PESSOAIS */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Etapa 1 — Dados Pessoais, Identificação Civil e Contato
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ''}
                  onChange={(e) => handleFieldChange('fullName', e.target.value)}
                  placeholder="Nome civil completo..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nome Social (se aplicável)</label>
                <input
                  type="text"
                  value={formData.socialName || ''}
                  onChange={(e) => handleFieldChange('socialName', e.target.value)}
                  placeholder="Nome social..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Sexo Administrativo</label>
                <select
                  value={formData.gender || 'Masculino'}
                  onChange={(e) => handleFieldChange('gender', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Data de Nascimento (Idade: <span className="text-amber-700 font-bold">{calculatedAge} anos</span>)
                </label>
                <input
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => handleFieldChange('birthDate', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Estado Civil</label>
                <select
                  value={formData.maritalStatus || 'Solteiro(a)'}
                  onChange={(e) => handleFieldChange('maritalStatus', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="União Estável">União Estável</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Separado(a)">Separado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Naturalidade (Cidade / Estado)</label>
                <input
                  type="text"
                  value={formData.birthplaceCity || ''}
                  onChange={(e) => handleFieldChange('birthplaceCity', e.target.value)}
                  placeholder="Ex: Nova Iguaçu / RJ"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nacionalidade</label>
                <input
                  type="text"
                  value={formData.nationality || 'Brasileira'}
                  onChange={(e) => handleFieldChange('nationality', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Profissão</label>
                <input
                  type="text"
                  value={formData.profession || ''}
                  onChange={(e) => handleFieldChange('profession', e.target.value)}
                  placeholder="Profissão / Ocupação..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Escolaridade</label>
                <select
                  value={formData.educationLevel || 'Ensino Médio Completo'}
                  onChange={(e) => handleFieldChange('educationLevel', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Ensino Fundamental Incompleto">Ensino Fundamental Incompleto</option>
                  <option value="Ensino Fundamental Completo">Ensino Fundamental Completo</option>
                  <option value="Ensino Médio Incompleto">Ensino Médio Incompleto</option>
                  <option value="Ensino Médio Completo">Ensino Médio Completo</option>
                  <option value="Superior Incompleto">Superior Incompleto</option>
                  <option value="Superior Completo">Superior Completo</option>
                  <option value="Pós-Graduação / Mestrado / Doutorado">Pós-Graduação / Mestrado / Doutorado</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CPF (Apenas números)</label>
                <input
                  type="text"
                  maxLength={14}
                  value={formData.cpf || ''}
                  onChange={(e) => handleFieldChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">RG / Órgão Emissor</label>
                <input
                  type="text"
                  value={formData.rg || ''}
                  onChange={(e) => handleFieldChange('rg', e.target.value)}
                  placeholder="Nº do RG e emissor..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CNH (Opcional)</label>
                <input
                  type="text"
                  value={formData.cnh || ''}
                  onChange={(e) => handleFieldChange('cnh', e.target.value)}
                  placeholder="Nº da CNH..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Passaporte (Opcional)</label>
                <input
                  type="text"
                  value={formData.passport || ''}
                  onChange={(e) => handleFieldChange('passport', e.target.value)}
                  placeholder="Nº do Passaporte..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Telefone Principal (com DDD)</label>
                <input
                  type="text"
                  value={formData.primaryPhone || ''}
                  onChange={(e) => handleFieldChange('primaryPhone', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp || ''}
                  onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">E-mail</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">Endereço Residencial (Rua, Av, etc)</label>
                <input
                  type="text"
                  value={formData.street || ''}
                  onChange={(e) => handleFieldChange('street', e.target.value)}
                  placeholder="Logradouro..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Número / Complemento</label>
                <input
                  type="text"
                  value={formData.number || ''}
                  onChange={(e) => handleFieldChange('number', e.target.value)}
                  placeholder="Nº, Apt, Bloco..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Bairro</label>
                <input
                  type="text"
                  value={formData.neighborhood || ''}
                  onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
                  placeholder="Bairro..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cidade / Estado</label>
                <input
                  type="text"
                  value={formData.city || 'Nova Iguaçu'}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">CEP</label>
                <input
                  type="text"
                  value={formData.cep || ''}
                  onChange={(e) => handleFieldChange('cep', e.target.value)}
                  placeholder="00000-000"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DADOS FAMILIARES */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Etapa 2 — Filiação, Cônjuge e Cadastro de Filhos
            </h2>

            {/* Parents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block font-bold text-slate-800">Dados do Pai</label>
                <input
                  type="text"
                  value={formData.fatherName || ''}
                  onChange={(e) => handleFieldChange('fatherName', e.target.value)}
                  placeholder="Nome completo do pai..."
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                />
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fatherIsAlive ?? true}
                      onChange={(e) => handleFieldChange('fatherIsAlive', e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Pai vivo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.fatherIsChurchMember || false}
                      onChange={(e) => handleFieldChange('fatherIsChurchMember', e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Membro desta igreja</span>
                  </label>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <label className="block font-bold text-slate-800">Dados da Mãe</label>
                <input
                  type="text"
                  value={formData.motherName || ''}
                  onChange={(e) => handleFieldChange('motherName', e.target.value)}
                  placeholder="Nome completo da mãe..."
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                />
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.motherIsAlive ?? true}
                      onChange={(e) => handleFieldChange('motherIsAlive', e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Mãe viva</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.motherIsChurchMember || false}
                      onChange={(e) => handleFieldChange('motherIsChurchMember', e.target.checked)}
                      className="rounded text-amber-600"
                    />
                    <span>Membro desta igreja</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Spouse */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
              <label className="block font-bold text-slate-800">Dados Conjugais</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600">Nome do Cônjuge</label>
                  <input
                    type="text"
                    value={formData.spouseName || ''}
                    onChange={(e) => handleFieldChange('spouseName', e.target.value)}
                    placeholder="Nome completo..."
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-600">Data do Casamento</label>
                  <input
                    type="date"
                    value={formData.marriageDate || ''}
                    onChange={(e) => handleFieldChange('marriageDate', e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-slate-600">Tipo de União</label>
                  <select
                    value={formData.unionType || 'Civil e Religioso'}
                    onChange={(e) => handleFieldChange('unionType', e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-1"
                  >
                    <option value="Civil e Religioso">Civil e Religioso</option>
                    <option value="Apenas Religioso">Apenas Religioso</option>
                    <option value="Apenas Civil">Apenas Civil</option>
                    <option value="União Estável">União Estável</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Children List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs">
                  Filhos (Adicione quantos forem necessários)
                </label>
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Filho</span>
                </button>
              </div>

              {(formData.children || []).length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-center">
                  Nenhum filho cadastrado. Clique no botão acima para adicionar.
                </div>
              ) : (
                <div className="space-y-2">
                  {(formData.children || []).map((child, idx) => (
                    <div key={child.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-400">Nome do Filho {idx + 1}</label>
                        <input
                          type="text"
                          value={child.fullName}
                          onChange={(e) => handleUpdateChild(child.id, { fullName: e.target.value })}
                          placeholder="Nome..."
                          className="w-full p-1.5 border border-slate-200 rounded bg-white mt-0.5"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400">Nascimento</label>
                        <input
                          type="date"
                          value={child.birthDate}
                          onChange={(e) => handleUpdateChild(child.id, { birthDate: e.target.value })}
                          className="w-full p-1.5 border border-slate-200 rounded bg-white mt-0.5"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-3">
                        <label className="flex items-center gap-1 text-[11px]">
                          <input
                            type="checkbox"
                            checked={child.isChurchMember}
                            onChange={(e) => handleUpdateChild(child.id, { isChurchMember: e.target.checked })}
                          />
                          <span>Membro</span>
                        </label>
                        <label className="flex items-center gap-1 text-[11px]">
                          <input
                            type="checkbox"
                            checked={child.attendsSundaySchool}
                            onChange={(e) => handleUpdateChild(child.id, { attendsSundaySchool: e.target.checked })}
                          />
                          <span>EBD</span>
                        </label>
                      </div>

                      <div className="text-right pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveChild(child.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: CONVERSÃO & VIDA ESPIRITUAL */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Etapa 3 — Conversão a Cristo e Vida Espiritual (16 Perguntas Eclesiásticas)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  1. Já teve alguma experiência religiosa antes de conhecer esta igreja?
                </label>
                <select
                  value={formData.hadPreviousReligiousExperience ? 'sim' : 'nao'}
                  onChange={(e) => handleFieldChange('hadPreviousReligiousExperience', e.target.value === 'sim')}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="nao">Não, sem experiência religiosa anterior</option>
                  <option value="sim">Sim</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  2. Qual era sua religião ou tradição anterior?
                </label>
                <input
                  type="text"
                  value={formData.previousReligion || ''}
                  onChange={(e) => handleFieldChange('previousReligion', e.target.value)}
                  placeholder="Ex: Católica / Espírita / Nenhuma..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  3. Já havia frequentado alguma igreja evangélica antes?
                </label>
                <select
                  value={formData.attendedEvangelicalChurchBefore ? 'sim' : 'nao'}
                  onChange={(e) => handleFieldChange('attendedEvangelicalChurchBefore', e.target.value === 'sim')}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  4. Qual foi a primeira igreja evangélica que frequentou?
                </label>
                <input
                  type="text"
                  value={formData.firstEvangelicalChurchAttended || ''}
                  onChange={(e) => handleFieldChange('firstEvangelicalChurchAttended', e.target.value)}
                  placeholder="Nome da igreja..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  5. Data ou período em que aceitou Jesus Cristo como Salvador
                </label>
                <input
                  type="date"
                  value={formData.conversionDate || ''}
                  onChange={(e) => handleFieldChange('conversionDate', e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  6. Onde aconteceu sua conversão? (Local / Cidade)
                </label>
                <input
                  type="text"
                  value={formData.conversionPlace || ''}
                  onChange={(e) => handleFieldChange('conversionPlace', e.target.value)}
                  placeholder="Ex: Templo Sede / Retiro / Em casa..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  7. Quem foi a pessoa responsável por conduzir ou acompanhar esse momento?
                </label>
                <input
                  type="text"
                  value={formData.mentoredBy || ''}
                  onChange={(e) => handleFieldChange('mentoredBy', e.target.value)}
                  placeholder="Nome do pastor, evangelista, amigo ou líder..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  8. Qual era sua situação espiritual antes da conversão?
                </label>
                <textarea
                  rows={2}
                  value={formData.situationBeforeConversion || ''}
                  onChange={(e) => handleFieldChange('situationBeforeConversion', e.target.value)}
                  placeholder="Descreva brevemente o contexto de vida anterior..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1">
                  9. Testemunho Pessoal de Conversão (Texto do Membro)
                </label>
                <textarea
                  rows={4}
                  value={formData.personalTestimonyText || ''}
                  onChange={(e) => handleFieldChange('personalTestimonyText', e.target.value)}
                  placeholder="Relato do testemunho para documentação no prontuário eclesiástico..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: BATISMO E ORDENANÇAS */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Etapa 4 — Batismo nas Águas, Batismo no Espírito Santo e Ordenanças
            </h2>

            {/* Water Baptism */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">Batismo nas Águas</span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isWaterBaptized || false}
                    onChange={(e) => handleFieldChange('isWaterBaptized', e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Já foi batizado(a) nas águas?</span>
                </label>
              </div>

              {formData.isWaterBaptized && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-slate-600">Data do Batismo</label>
                    <input
                      type="date"
                      value={formData.waterBaptismDate || ''}
                      onChange={(e) => handleFieldChange('waterBaptismDate', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Igreja onde foi Batizado</label>
                    <input
                      type="text"
                      value={formData.waterBaptismChurch || ''}
                      onChange={(e) => handleFieldChange('waterBaptismChurch', e.target.value)}
                      placeholder="Nome da igreja..."
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Pastor Celebrante</label>
                    <input
                      type="text"
                      value={formData.officiatingPastor || ''}
                      onChange={(e) => handleFieldChange('officiatingPastor', e.target.value)}
                      placeholder="Nome do pastor..."
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Forma de Batismo</label>
                    <select
                      value={formData.baptismMode || 'Imersão'}
                      onChange={(e) => handleFieldChange('baptismMode', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    >
                      <option value="Imersão">Imersão</option>
                      <option value="Aspersão">Aspersão</option>
                      <option value="Afusão">Afusão</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600">Nº do Certificado de Batismo</label>
                    <input
                      type="text"
                      value={formData.baptismCertificateNumber || ''}
                      onChange={(e) => handleFieldChange('baptismCertificateNumber', e.target.value)}
                      placeholder="Ex: CERT-BAT-2024-01"
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Holy Spirit Baptism */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="font-bold text-slate-900 text-sm">Batismo no Espírito Santo</span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.hasHolySpiritBaptism || false}
                    onChange={(e) => handleFieldChange('hasHolySpiritBaptism', e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Relata experiência de Batismo no Espírito Santo?</span>
                </label>
              </div>

              {formData.hasHolySpiritBaptism && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-slate-600">Data ou Período da Experiência</label>
                    <input
                      type="date"
                      value={formData.holySpiritBaptismDate || ''}
                      onChange={(e) => handleFieldChange('holySpiritBaptismDate', e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-slate-600">Relato Pessoal da Experiência Espiritual</label>
                    <textarea
                      rows={2}
                      value={formData.holySpiritBaptismAccount || ''}
                      onChange={(e) => handleFieldChange('holySpiritBaptismAccount', e.target.value)}
                      placeholder="Relato pessoal declarado..."
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Holy Communion */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 text-sm">Santa Ceia do Senhor</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.partakesHolyCommunionRegularly || false}
                    onChange={(e) => handleFieldChange('partakesHolyCommunionRegularly', e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Participa regularmente da Santa Ceia?</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: HISTÓRICO DE IGREJAS ANTERIORES & MINISTÉRIOS */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Etapa 5 — Histórico de Igrejas Anteriores & Departamentos
            </h2>

            <div className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                Registre as igrejas das quais o membro participou antes de ingressar nesta instituição, formando uma linha do tempo eclesiástica contínua.
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
                <div className="font-bold text-slate-800">Igreja Anterior Principal (se houver)</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-600">Nome da Igreja</label>
                    <input
                      type="text"
                      placeholder="Nome da congregação..."
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Denominação</label>
                    <input
                      type="text"
                      placeholder="Ex: Batista, Presbiteriana, AD..."
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600">Pastor Responsável</label>
                    <input
                      type="text"
                      placeholder="Nome do pastor..."
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white mt-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: VIDA MINISTERIAL & FORMAÇÃO TEOLÓGICA */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Etapa 6 — Histórico Ministerial, Funções e Formação Teológica
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Cargo / Função Ministerial Atual *
                </label>
                <select
                  value={formData.currentMinisterialRole || 'Membro'}
                  onChange={(e) => handleFieldChange('currentMinisterialRole', e.target.value as MinisterialRole)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Membro">Membro</option>
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
                <label className="block text-slate-700 font-semibold mb-1">
                  Possui Credencial Ministerial Oficial?
                </label>
                <select
                  value={formData.leadershipExperience?.hasMinisterialCredentials ? 'sim' : 'nao'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      leadershipExperience: {
                        ...(prev.leadershipExperience || {}),
                        hasMinisterialCredentials: e.target.value === 'sim',
                      },
                    }))
                  }
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="nao">Não</option>
                  <option value="sim">Sim, credencial emitida</option>
                </select>
              </div>

              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800">Experiência e Competências Bíblicas</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.theologicalSkills?.teachingExperience || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theologicalSkills: { ...(prev.theologicalSkills || {}), teachingExperience: e.target.checked },
                        }))
                      }
                    />
                    <span>Professor Bíblico</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.theologicalSkills?.preachingExperience || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theologicalSkills: { ...(prev.theologicalSkills || {}), preachingExperience: e.target.checked },
                        }))
                      }
                    />
                    <span>Pregador da Palavra</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.theologicalSkills?.counselingExperience || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theologicalSkills: { ...(prev.theologicalSkills || {}), counselingExperience: e.target.checked },
                        }))
                      }
                    />
                    <span>Aconselhamento</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.theologicalSkills?.missionsTraining || false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          theologicalSkills: { ...(prev.theologicalSkills || {}), missionsTraining: e.target.checked },
                        }))
                      }
                    />
                    <span>Formação Missionária</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: LOTAÇÃO, SITUAÇÃO & LGPD */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Etapa 7 — Congregação de Lotação, Situação Eclesiástica & Termo LGPD
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Congregação de Vinculação *
                </label>
                <select
                  value={formData.currentCongregationId || congregations[0]?.id}
                  onChange={(e) => handleFieldChange('currentCongregationId', e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  {congregations.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.isHeadquarters ? '(Sede)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Forma de Ingresso</label>
                <select
                  value={formData.admissionType || 'Aclamação'}
                  onChange={(e) => handleFieldChange('admissionType', e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Batismo">Batismo nas Águas</option>
                  <option value="Transferência com Carta">Transferência com Carta</option>
                  <option value="Aclamação">Aclamação / Testemunho</option>
                  <option value="Reconciliação">Reconciliação</option>
                  <option value="Profissão de Fé">Profissão de Fé</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Situação Cadastral Inicial</label>
                <select
                  value={formData.currentStatus || 'Membro Ativo'}
                  onChange={(e) => handleFieldChange('currentStatus', e.target.value as MemberStatus)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-medium"
                >
                  <option value="Membro Ativo">Membro Ativo</option>
                  <option value="Novo Convertido">Novo Convertido</option>
                  <option value="Congregado">Congregado</option>
                  <option value="Membro em Integração">Membro em Integração</option>
                  <option value="Visitante">Visitante</option>
                </select>
              </div>
            </div>

            {/* LGPD Consent Section */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2 text-xs text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>Termo de Consentimento & Base Legal LGPD (Lei 13.709/2018)</span>
              </div>
              <p className="leading-relaxed text-[11px] text-emerald-900">
                Os dados aqui coletados destinam-se exclusivamente à gestão eclesiástica, pastoral e administrativa da instituição religiosa,
                conforme expressamente autorizado pelo <strong>Art. 11, II, "c"</strong> da Lei Geral de Proteção de Dados (tratamento de dados sensíveis para finalidades legítimas de organizações religiosas).
              </p>
              <label className="flex items-center gap-2 pt-2 cursor-pointer font-bold text-emerald-900">
                <input
                  type="checkbox"
                  required
                  checked={formData.lgpdConsentGiven || false}
                  onChange={(e) => handleFieldChange('lgpdConsentGiven', e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>O titular autorizou expressamente o tratamento dos seus dados para os fins eclesiásticos institucionais.</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Bottom Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Etapa Anterior</span>
        </button>

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
          >
            <span>Próxima Etapa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinishWizard}
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Gravar no Prontuário Eclesiástico</span>
          </button>
        )}
      </div>
    </div>
  );
};
