/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Member,
  Congregation,
  InstitutionSettings,
  AdministrativeAlert,
  UserRole,
  MemberStatus,
  PastoralCareRecord,
  TimelineEvent,
  MemberDocument,
  AuditLogEntry,
  MemberStatusHistory,
  AdminCredentials,
} from '../types/church.ts';
import {
  initialMembers,
  initialCongregations,
  initialInstitutionSettings,
  initialAlerts,
} from '../data/initialData.ts';

const STORAGE_KEY_MEMBERS = 'eclesia_church_members_v2';
const STORAGE_KEY_CONGREGATIONS = 'eclesia_church_congregations_v2';
const STORAGE_KEY_SETTINGS = 'eclesia_church_settings_v2';
const STORAGE_KEY_ALERTS = 'eclesia_church_alerts_v2';
const STORAGE_KEY_ROLE = 'eclesia_church_role_v2';
const STORAGE_KEY_ADMIN_CREDS = 'eclesia_admin_creds_v3';
const STORAGE_KEY_AUTH = 'eclesia_admin_auth_v3';

interface ChurchContextType {
  members: Member[];
  congregations: Congregation[];
  settings: InstitutionSettings;
  alerts: AdministrativeAlert[];
  currentUserRole: UserRole;
  setCurrentUserRole: (role: UserRole) => void;
  activeCongregationId: string;
  setActiveCongregationId: (id: string) => void;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;
  activeTabInRecord: string;
  setActiveTabInRecord: (tab: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;

  // Admin Authentication & Credentials
  adminUser: AdminCredentials;
  isAuthenticated: boolean;
  officialPresentationUrl: string;
  login: (usernameOrEmail: string, password: string) => { success: boolean; message?: string };
  loginAsEndUser: () => void;
  logout: () => void;
  updateAdminCredentials: (data: {
    name?: string;
    email?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => { success: boolean; message: string };
  showAdminCredentialsModal: boolean;
  setShowAdminCredentialsModal: (show: boolean) => void;

  // Member CRUD and actions
  addMember: (memberData: Partial<Member>) => Member;
  updateMember: (id: string, updates: Partial<Member>, reason?: string) => void;
  deleteMember: (id: string, reason: string) => void;
  transferMember: (memberId: string, toCongregationId: string, reason: string) => void;
  changeMemberStatus: (memberId: string, newStatus: MemberStatus, reason: string) => void;
  addPastoralCareRecord: (memberId: string, record: Omit<PastoralCareRecord, 'id'>) => void;
  addTimelineEvent: (memberId: string, event: Omit<TimelineEvent, 'id'>) => void;
  addDocument: (memberId: string, doc: Omit<MemberDocument, 'id' | 'uploadDate' | 'uploadedBy'>) => void;
  deleteDocument: (memberId: string, documentId: string) => void;

  // Congregations & Settings
  addCongregation: (cong: Omit<Congregation, 'id'>) => Congregation;
  updateCongregation: (id: string, updates: Partial<Congregation>) => void;
  updateSettings: (updates: Partial<InstitutionSettings>) => void;
  dismissAlert: (id: string) => void;

  // Backup & Import
  exportFullDatabaseJSON: () => void;
  importFullDatabaseJSON: (jsonStr: string) => boolean;
  importMembersFromCSV: (membersToAdd: Partial<Member>[]) => number;
  resetToDefaultData: () => void;

  // Helper getters
  getMemberById: (id: string) => Member | undefined;
  getCongregationById: (id: string) => Congregation | undefined;
}

const ChurchContext = createContext<ChurchContextType | undefined>(undefined);

export const ChurchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMBERS);
      return saved ? JSON.parse(saved) : initialMembers;
    } catch {
      return initialMembers;
    }
  });

  const [congregations, setCongregations] = useState<Congregation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONGREGATIONS);
      return saved ? JSON.parse(saved) : initialCongregations;
    } catch {
      return initialCongregations;
    }
  });

  const [settings, setSettings] = useState<InstitutionSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && (parsed.name.includes('Eclésia') || parsed.name.includes('Eclesia'))) {
          parsed.name = 'Ministério Palavra e Unção';
        }
        parsed.logoUrl = '/assets/aistudio/Logo_igreja_30f200bb.jpg';
        return parsed;
      }
      return initialInstitutionSettings;
    } catch {
      return initialInstitutionSettings;
    }
  });

  const [alerts, setAlerts] = useState<AdministrativeAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALERTS);
      return saved ? JSON.parse(saved) : initialAlerts;
    } catch {
      return initialAlerts;
    }
  });

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('ADMIN_GERAL');
  const [activeCongregationId, setActiveCongregationId] = useState<string>('cong-01');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [activeTabInRecord, setActiveTabInRecord] = useState<string>('dados_pessoais');
  const [activeView, setActiveView] = useState<string>('dashboard');

  const defaultAdminCredentials: AdminCredentials = {
    name: 'Administrador Geral',
    email: 'admin@palavraeuncao.com.br',
    username: 'admin',
    password: 'admin123',
    updatedAt: new Date().toISOString(),
  };

  const [adminUser, setAdminUser] = useState<AdminCredentials>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ADMIN_CREDS);
      return saved ? JSON.parse(saved) : defaultAdminCredentials;
    } catch {
      return defaultAdminCredentials;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [showAdminCredentialsModal, setShowAdminCredentialsModal] = useState<boolean>(false);

  const login = (usernameOrEmail: string, password: string) => {
    const input = usernameOrEmail.trim().toLowerCase();
    const matchesUser =
      adminUser.username.toLowerCase() === input ||
      adminUser.email.toLowerCase() === input;

    if (matchesUser && adminUser.password === password) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
        const updated = { ...adminUser, lastLogin: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY_ADMIN_CREDS, JSON.stringify(updated));
        setAdminUser(updated);
      } catch (e) {
        console.warn('Storage error', e);
      }
      return { success: true };
    }

    return {
      success: false,
      message: 'Usuário/E-mail ou senha incorretos. Verifique suas credenciais de Admin Geral.',
    };
  };

  const officialPresentationUrl = 'https://membrospalavraeuncao.vercel.app';

  const loginAsEndUser = () => {
    setIsAuthenticated(true);
    setCurrentUserRole('ADMIN_GERAL');
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'false');
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  const updateAdminCredentials = (data: {
    name?: string;
    email?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    if (data.newPassword) {
      if (!data.currentPassword || data.currentPassword !== adminUser.password) {
        return {
          success: false,
          message: 'A senha atual informada está incorreta.',
        };
      }
      if (data.newPassword.length < 4) {
        return {
          success: false,
          message: 'A nova senha deve possuir no mínimo 4 caracteres.',
        };
      }
    }

    const updated: AdminCredentials = {
      ...adminUser,
      name: data.name?.trim() || adminUser.name,
      email: data.email?.trim() || adminUser.email,
      username: data.username?.trim() || adminUser.username,
      password: data.newPassword || adminUser.password,
      updatedAt: new Date().toISOString(),
    };

    setAdminUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_CREDS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }

    return {
      success: true,
      message: 'Credenciais de Admin Geral salvas e atualizadas com sucesso!',
    };
  };

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.warn('Storage quota exceeded for members', e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONGREGATIONS, JSON.stringify(congregations));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [congregations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ALERTS, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, currentUserRole);
    } catch (e) {
      console.warn('Storage error', e);
    }
  }, [currentUserRole]);

  const getMemberById = (id: string) => members.find((m) => m.id === id);
  const getCongregationById = (id: string) => congregations.find((c) => c.id === id);

  const addMember = (memberData: Partial<Member>): Member => {
    const nextNum = members.length + 1;
    const currentYear = new Date().getFullYear();
    const regNum = `MEM-${currentYear}-${String(nextNum).padStart(4, '0')}`;
    const newId = `mem-${Date.now()}`;

    const newMember: Member = {
      id: newId,
      registrationNumber: memberData.registrationNumber || regNum,
      fullName: memberData.fullName || 'Novo Membro',
      gender: memberData.gender || 'Masculino',
      birthDate: memberData.birthDate || '1990-01-01',
      nationality: memberData.nationality || 'Brasileira',
      maritalStatus: memberData.maritalStatus || 'Solteiro(a)',
      primaryPhone: memberData.primaryPhone || '',
      cep: memberData.cep || '',
      street: memberData.street || '',
      number: memberData.number || '',
      neighborhood: memberData.neighborhood || '',
      city: memberData.city || 'Nova Iguaçu',
      state: memberData.state || 'RJ',
      children: memberData.children || [],
      otherRelatives: memberData.otherRelatives || [],
      previousChurches: memberData.previousChurches || [],
      ministries: memberData.ministries || [],
      currentMinisterialRole: memberData.currentMinisterialRole || 'Membro',
      ordinations: memberData.ordinations || [],
      leadershipExperience: memberData.leadershipExperience || {},
      theologicalCourses: memberData.theologicalCourses || [],
      theologicalSkills: memberData.theologicalSkills || {},
      currentCongregationId: memberData.currentCongregationId || congregations[0]?.id || 'cong-01',
      admissionDate: memberData.admissionDate || new Date().toISOString().split('T')[0],
      admissionType: memberData.admissionType || 'Aclamação',
      congregationTransfers: [],
      pastoralCareRecords: [],
      currentStatus: memberData.currentStatus || 'Membro Ativo',
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          previousStatus: 'Visitante',
          newStatus: memberData.currentStatus || 'Membro Ativo',
          changedBy: `Usuário (${currentUserRole})`,
          reason: 'Cadastro inicial no sistema.',
        },
      ],
      lastDataUpdateDate: new Date().toISOString().split('T')[0],
      documents: memberData.documents || [],
      timeline: [
        {
          id: `tl-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: 'Cadastro no Sistema Eclesiástico',
          description: `Registro efetuado por ${currentUserRole} com número ${regNum}.`,
          category: 'administrativo',
          isAutomatic: true,
        },
      ],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userName: `Operador (${currentUserRole})`,
          userRole: currentUserRole,
          action: 'Criação',
          legalBasis: 'Atividades de Organizações Religiosas - Art. 11, II, c da LGPD',
        },
      ],
      isWaterBaptized: memberData.isWaterBaptized || false,
      hasHolySpiritBaptism: memberData.hasHolySpiritBaptism || false,
      partakesHolyCommunionRegularly: memberData.partakesHolyCommunionRegularly || false,
      lgpdConsentGiven: memberData.lgpdConsentGiven || true,
      lgpdConsentDate: new Date().toISOString().split('T')[0],
      lgpdLegalBasis: 'Consentimento expresso e Organização Religiosa (LGPD)',
      ...memberData,
    };

    setMembers((prev) => [newMember, ...prev]);
    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Member>, reason: string = 'Atualização cadastral') => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        const auditEntry: AuditLogEntry = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userName: `Operador (${currentUserRole})`,
          userRole: currentUserRole,
          action: 'Atualização',
          fieldChanged: Object.keys(updates).join(', '),
          oldValue: 'Dados anteriores salvos',
          newValue: reason,
          legalBasis: 'Atualização e Tratamento Legítimo - LGPD Art. 11, II, c',
        };

        return {
          ...m,
          ...updates,
          lastDataUpdateDate: new Date().toISOString().split('T')[0],
          auditLogs: [auditEntry, ...m.auditLogs],
        };
      })
    );
  };

  const deleteMember = (id: string, reason: string = 'Exclusão de cadastro') => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setAlerts((prev) => prev.filter((a) => a.memberId !== id));
    if (selectedMemberId === id) {
      setSelectedMemberId(null);
    }
  };

  const transferMember = (memberId: string, toCongregationId: string, reason: string) => {
    const targetCongregation = getCongregationById(toCongregationId);
    if (!targetCongregation) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        const prevCongregation = getCongregationById(m.currentCongregationId);
        const transferRecord = {
          id: `trans-${Date.now()}`,
          fromCongregationId: m.currentCongregationId,
          fromCongregationName: prevCongregation ? prevCongregation.name : 'Origem',
          toCongregationId: toCongregationId,
          toCongregationName: targetCongregation.name,
          transferDate: new Date().toISOString().split('T')[0],
          reason: reason || 'Transferência entre congregações da instituição.',
          previousPastor: prevCongregation ? prevCongregation.seniorPastor : undefined,
          newPastor: targetCongregation.seniorPastor,
          status: 'Concluída' as const,
        };

        const timelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: `Transferência para ${targetCongregation.name}`,
          description: `Transferido de ${prevCongregation?.name || 'Origem'} para ${targetCongregation.name}. Motivo: ${reason}`,
          category: 'administrativo',
          isAutomatic: true,
        };

        return {
          ...m,
          currentCongregationId: toCongregationId,
          congregationTransfers: [transferRecord, ...m.congregationTransfers],
          timeline: [timelineEvent, ...m.timeline],
          lastDataUpdateDate: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const changeMemberStatus = (memberId: string, newStatus: MemberStatus, reason: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;

        const statusEntry: MemberStatusHistory = {
          id: `sh-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          previousStatus: m.currentStatus,
          newStatus: newStatus,
          changedBy: `Usuário (${currentUserRole})`,
          reason: reason || 'Alteração de situação eclesiástica.',
        };

        const timelineEvent: TimelineEvent = {
          id: `tl-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          title: `Situação Cadastral: ${newStatus}`,
          description: `Status alterado de ${m.currentStatus} para ${newStatus}. ${reason ? `Motivo: ${reason}` : ''}`,
          category: 'administrativo',
          isAutomatic: true,
        };

        return {
          ...m,
          currentStatus: newStatus,
          statusHistory: [statusEntry, ...m.statusHistory],
          timeline: [timelineEvent, ...m.timeline],
          lastDataUpdateDate: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const addPastoralCareRecord = (memberId: string, record: Omit<PastoralCareRecord, 'id'>) => {
    const newRecord: PastoralCareRecord = {
      ...record,
      id: `past-${Date.now()}`,
    };

    const timelineEvent: TimelineEvent = {
      id: `tl-${Date.now()}`,
      date: record.date,
      title: `Atendimento Pastoral: ${record.serviceType}`,
      description: `Atendimento realizado por ${record.pastorName}. Assunto: ${record.subject}`,
      category: 'pastoral',
      isAutomatic: true,
    };

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          pastoralCareRecords: [newRecord, ...m.pastoralCareRecords],
          timeline: [timelineEvent, ...m.timeline],
          lastPastoralContactDate: record.date,
        };
      })
    );
  };

  const addTimelineEvent = (memberId: string, event: Omit<TimelineEvent, 'id'>) => {
    const newEvent: TimelineEvent = {
      ...event,
      id: `tl-${Date.now()}`,
    };

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          timeline: [newEvent, ...m.timeline].sort((a, b) => (a.date < b.date ? 1 : -1)),
        };
      })
    );
  };

  const addDocument = (
    memberId: string,
    doc: Omit<MemberDocument, 'id' | 'uploadDate' | 'uploadedBy'>
  ) => {
    const newDoc: MemberDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: `Usuário (${currentUserRole})`,
    };

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          documents: [newDoc, ...m.documents],
        };
      })
    );
  };

  const deleteDocument = (memberId: string, documentId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== memberId) return m;
        return {
          ...m,
          documents: m.documents.filter((d) => d.id !== documentId),
        };
      })
    );
  };

  const addCongregation = (cong: Omit<Congregation, 'id'>): Congregation => {
    const newCong: Congregation = {
      ...cong,
      id: `cong-${Date.now()}`,
    };
    setCongregations((prev) => [...prev, newCong]);
    return newCong;
  };

  const updateCongregation = (id: string, updates: Partial<Congregation>) => {
    setCongregations((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const updateSettings = (updates: Partial<InstitutionSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const dismissAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const exportFullDatabaseJSON = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      institution: settings.name,
      version: '2.0.0',
      members,
      congregations,
      settings,
      alerts,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_palavra_e_uncao_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFullDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.members)) {
        setMembers(data.members);
      }
      if (Array.isArray(data.congregations)) {
        setCongregations(data.congregations);
      }
      if (data.settings && typeof data.settings === 'object') {
        setSettings(data.settings);
      }
      if (Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
      return true;
    } catch (e) {
      console.error('Failed to parse JSON backup', e);
      return false;
    }
  };

  const importMembersFromCSV = (membersToAdd: Partial<Member>[]): number => {
    let count = 0;
    membersToAdd.forEach((item) => {
      if (item.fullName) {
        addMember(item);
        count++;
      }
    });
    return count;
  };

  const resetToDefaultData = () => {
    setMembers(initialMembers);
    setCongregations(initialCongregations);
    setSettings(initialInstitutionSettings);
    setAlerts(initialAlerts);
    localStorage.clear();
  };

  return (
    <ChurchContext.Provider
      value={{
        members,
        congregations,
        settings,
        alerts,
        currentUserRole,
        setCurrentUserRole,
        activeCongregationId,
        setActiveCongregationId,
        selectedMemberId,
        setSelectedMemberId,
        activeTabInRecord,
        setActiveTabInRecord,
        activeView,
        setActiveView,
        adminUser,
        isAuthenticated,
        officialPresentationUrl,
        showAdminCredentialsModal,
        setShowAdminCredentialsModal,
        login,
        loginAsEndUser,
        logout,
        updateAdminCredentials,
        addMember,
        updateMember,
        deleteMember,
        transferMember,
        changeMemberStatus,
        addPastoralCareRecord,
        addTimelineEvent,
        addDocument,
        deleteDocument,
        addCongregation,
        updateCongregation,
        updateSettings,
        dismissAlert,
        exportFullDatabaseJSON,
        importFullDatabaseJSON,
        importMembersFromCSV,
        resetToDefaultData,
        getMemberById,
        getCongregationById,
      }}
    >
      {children}
    </ChurchContext.Provider>
  );
};

export const useChurch = () => {
  const context = useContext(ChurchContext);
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider');
  }
  return context;
};
