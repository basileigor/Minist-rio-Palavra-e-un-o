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
  AppUser,
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
const STORAGE_KEY_USERS = 'eclesia_registered_users_v1';
const STORAGE_KEY_CURRENT_USER = 'eclesia_current_user_v1';

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

  // Authentication & Users Management
  adminUser: AdminCredentials;
  registeredUsers: AppUser[];
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  officialPresentationUrl: string;
  login: (usernameOrEmail: string, password: string) => { success: boolean; message?: string };
  registerUser: (userData: {
    name: string;
    username: string;
    email?: string;
    phone?: string;
    password: string;
    role?: UserRole;
  }) => { success: boolean; message: string; user?: AppUser };
  deleteUser: (userId: string) => void;
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

  const defaultMasterUser: AppUser = {
    id: 'usr-admin-master',
    name: 'Administrador Geral',
    username: 'admin',
    email: 'admin@palavraeuncao.com.br',
    password: 'admin123',
    role: 'ADMIN_GERAL',
    createdAt: '2026-01-01T00:00:00.000Z',
    active: true,
  };

  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [defaultMasterUser];
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  const [showAdminCredentialsModal, setShowAdminCredentialsModal] = useState<boolean>(false);

  const officialPresentationUrl = 'https://membrospalavraeuncao.vercel.app';

  const login = (usernameOrEmail: string, password: string) => {
    const input = usernameOrEmail.trim().toLowerCase();

    // 1. Search in registered users list
    const foundUser = registeredUsers.find(
      (u) =>
        u.username.toLowerCase() === input ||
        (u.email && u.email.toLowerCase() === input)
    );

    if (foundUser) {
      if (foundUser.password !== password) {
        return {
          success: false,
          message: 'Senha incorreta. Por favor, verifique os dados digitados.',
        };
      }
      if (!foundUser.active) {
        return {
          success: false,
          message: 'Esta conta de usuário foi temporariamente suspensa pelo Administrador.',
        };
      }

      const updatedUser: AppUser = {
        ...foundUser,
        lastLogin: new Date().toISOString(),
      };

      setCurrentUser(updatedUser);
      setCurrentUserRole(foundUser.role || 'MEMBRO');
      setIsAuthenticated(true);

      try {
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(updatedUser));
        const updatedList = registeredUsers.map((u) =>
          u.id === foundUser.id ? updatedUser : u
        );
        setRegisteredUsers(updatedList);
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedList));
      } catch (e) {
        console.warn('Storage error', e);
      }
      return { success: true };
    }

    // 2. Fallback check for Master Admin Credentials
    const matchesAdmin =
      adminUser.username.toLowerCase() === input ||
      adminUser.email.toLowerCase() === input;

    if (matchesAdmin && adminUser.password === password) {
      const adminAsUser: AppUser = {
        id: 'usr-admin-master',
        name: adminUser.name,
        username: adminUser.username,
        email: adminUser.email,
        password: adminUser.password,
        role: 'ADMIN_GERAL',
        createdAt: adminUser.updatedAt || '2026-01-01T00:00:00.000Z',
        lastLogin: new Date().toISOString(),
        active: true,
      };

      setCurrentUser(adminAsUser);
      setCurrentUserRole('ADMIN_GERAL');
      setIsAuthenticated(true);

      try {
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(adminAsUser));
      } catch (e) {
        console.warn('Storage error', e);
      }
      return { success: true };
    }

    return {
      success: false,
      message: 'Usuário ou senha incorretos. Se ainda não possui acesso, clique na aba "Cadastrar Novo Usuário" ao lado.',
    };
  };

  const registerUser = (userData: {
    name: string;
    username: string;
    email?: string;
    phone?: string;
    password: string;
    role?: UserRole;
  }) => {
    const cleanName = userData.name.trim();
    const cleanUser = userData.username.trim().toLowerCase();
    const cleanPass = userData.password.trim();

    if (!cleanName || !cleanUser || !cleanPass) {
      return {
        success: false,
        message: 'Por favor, preencha o Nome Completo, Login e a Senha.',
      };
    }

    if (cleanUser.length < 3) {
      return {
        success: false,
        message: 'O nome de login deve possuir no mínimo 3 caracteres.',
      };
    }

    if (cleanPass.length < 4) {
      return {
        success: false,
        message: 'A senha cadastrada deve conter no mínimo 4 caracteres.',
      };
    }

    // Check uniqueness
    const usernameTaken =
      registeredUsers.some((u) => u.username.toLowerCase() === cleanUser) ||
      adminUser.username.toLowerCase() === cleanUser;

    if (usernameTaken) {
      return {
        success: false,
        message: `O login "${cleanUser}" já está cadastrado. Por favor, escolha outro nome de usuário.`,
      };
    }

    if (userData.email && userData.email.trim()) {
      const cleanEmail = userData.email.trim().toLowerCase();
      const emailTaken = registeredUsers.some(
        (u) => u.email && u.email.toLowerCase() === cleanEmail
      );
      if (emailTaken) {
        return {
          success: false,
          message: `O e-mail "${cleanEmail}" já está associado a outra conta.`,
        };
      }
    }

    const newUser: AppUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: cleanName,
      username: cleanUser,
      email: userData.email?.trim() || undefined,
      phone: userData.phone?.trim() || undefined,
      password: cleanPass,
      role: userData.role || 'MEMBRO',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      active: true,
    };

    const updatedList = [...registeredUsers, newUser];
    setRegisteredUsers(updatedList);
    setCurrentUser(newUser);
    setCurrentUserRole(newUser.role);
    setIsAuthenticated(true);

    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedList));
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch (e) {
      console.warn('Storage error', e);
    }

    return {
      success: true,
      message: 'Cadastro realizado com sucesso! Seja bem-vindo ao Ministério Palavra e Unção.',
      user: newUser,
    };
  };

  const deleteUser = (userId: string) => {
    if (userId === 'usr-admin-master') return; // Protect master admin
    const updated = registeredUsers.filter((u) => u.id !== userId);
    setRegisteredUsers(updated);
    try {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  const loginAsEndUser = () => {
    // If user clicks quick demo, sign in with default or master
    setIsAuthenticated(true);
    setCurrentUser(defaultMasterUser);
    setCurrentUserRole('ADMIN_GERAL');
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(defaultMasterUser));
    } catch (e) {
      console.warn('Storage error', e);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, 'false');
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
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
        registeredUsers,
        currentUser,
        isAuthenticated,
        officialPresentationUrl,
        showAdminCredentialsModal,
        setShowAdminCredentialsModal,
        login,
        registerUser,
        deleteUser,
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
