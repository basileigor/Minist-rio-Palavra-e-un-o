/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole =
  | 'ADMIN_GERAL'
  | 'SECRETARIA'
  | 'PASTOR_PRESIDENTE'
  | 'PASTOR_CONGREGACAO'
  | 'LIDER_DEPARTAMENTO'
  | 'MEMBRO'
  | 'AUDITOR';

export type MemberStatus =
  | 'Visitante'
  | 'Novo Convertido'
  | 'Congregado'
  | 'Membro em Integração'
  | 'Membro Ativo'
  | 'Membro Afastado'
  | 'Membro Transferido'
  | 'Membro Desligado'
  | 'Membro Falecido';

export type MaritalStatus =
  | 'Solteiro(a)'
  | 'Casado(a)'
  | 'União Estável'
  | 'Divorciado(a)'
  | 'Separado(a)'
  | 'Viúvo(a)';

export type MinisterialRole =
  | 'Membro'
  | 'Cooperador'
  | 'Auxiliar'
  | 'Diácono'
  | 'Diaconisa'
  | 'Presbítero'
  | 'Evangelista'
  | 'Missionário'
  | 'Pastor Auxiliar'
  | 'Pastor'
  | 'Pastor Presidente'
  | 'Bispo'
  | 'Apóstolo'
  | 'Outro';

export type DepartmentType =
  | 'Ministério de Louvor'
  | 'Ministério de Dança'
  | 'Ministério de Intercessão'
  | 'Evangelismo & Missões'
  | 'Escola Bíblica Dominical (EBD)'
  | 'Ministério Infantil'
  | 'Ministério de Adolescentes'
  | 'Ministério de Jovens'
  | 'Ministério de Mulheres'
  | 'Ministério de Homens'
  | 'Ministério de Casais & Família'
  | 'Ação Social & Beneficência'
  | 'Recepção & Boas-Vindas'
  | 'Comunicação & Mídia'
  | 'Sonoplastia & Audiovisual'
  | 'Diaconia & Apoio'
  | 'Ensino Bíblico & Teologia'
  | 'Outro Departamento';

export interface ChildInfo {
  id: string;
  fullName: string;
  birthDate: string;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  isChurchMember: boolean;
  isBaptized: boolean;
  attendsSundaySchool: boolean;
  ministryInvolvement?: string;
  congregation?: string;
  linkedMemberId?: string;
  notes?: string;
}

export interface RelativeInfo {
  id: string;
  fullName: string;
  relationship: 'Irmão(ã)' | 'Avô/Avó' | 'Neto(a)' | 'Tio(a)' | 'Responsável Legal' | 'Outro';
  isChurchMember: boolean;
  linkedMemberId?: string;
  notes?: string;
}

export interface PreviousChurchInfo {
  id: string;
  churchName: string;
  denomination: string;
  seniorPastor?: string;
  address?: string;
  city: string;
  state: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  wasOfficialMember: boolean;
  rolesHeld?: string;
  ministriesParticipated?: string;
  ordinationsReceived?: string;
  reasonForLeaving?: string;
  hasRecommendationLetter: boolean;
  hasTransferLetter: boolean;
  documentUrl?: string;
  notes?: string;
}

export interface MinistryParticipation {
  id: string;
  departmentName: DepartmentType | string;
  startDate: string;
  endDate?: string;
  roleHeld: string; // Ex: Líder, Integrante, Vice-Líder, Regente, Instrumentista
  leaderInCharge?: string;
  congregationId?: string;
  description?: string;
  isCurrent: boolean;
  reasonForEnding?: string;
  notes?: string;
}

export interface OrdinationInfo {
  id: string;
  roleTitle: MinisterialRole;
  startDate?: string;
  ordinationDate: string;
  ordainingChurch: string;
  ordainingAuthority: string; // Nome do pastor/bispo que consagrou
  certificateNumber?: string;
  documentUrl?: string;
  expirationDate?: string;
  endDate?: string;
  congregation?: string;
  notes?: string;
}

export interface TheologicalCourse {
  id: string;
  courseName: string;
  courseType:
    | 'Curso Bíblico'
    | 'Escola de Obreiros'
    | 'Escola Bíblica Dominical'
    | 'Teologia Básico/Médio'
    | 'Bacharelado em Teologia'
    | 'Pós-Graduação Teológica'
    | 'Seminário'
    | 'Congresso/Conferência'
    | 'Outro';
  institution: string;
  completionDate?: string;
  workloadHours?: number;
  certificateNumber?: string;
  certificateUrl?: string;
  notes?: string;
}

export interface CongregationTransfer {
  id: string;
  fromCongregationId?: string;
  fromCongregationName?: string;
  toCongregationId: string;
  toCongregationName: string;
  transferDate: string;
  reason?: string;
  previousPastor?: string;
  newPastor?: string;
  transferLetterUrl?: string;
  status: 'Concluída' | 'Pendente' | 'Cancelada';
  approvedBy?: string;
}

export interface PastoralCareRecord {
  id: string;
  date: string;
  pastorName: string;
  serviceType:
    | 'Visita pastoral'
    | 'Aconselhamento'
    | 'Orientação familiar'
    | 'Acompanhamento espiritual'
    | 'Novos convertidos'
    | 'Acompanhamento de líderes'
    | 'Visita hospitalar'
    | 'Apoio social'
    | 'Outro';
  subject: string;
  guidanceProvided: string;
  referrals?: string;
  followUpNeeded: boolean;
  nextAppointmentDate?: string;
  status: 'Em andamento' | 'Concluído' | 'Agendado';
  confidentialNotes: string;
  confidentialityLevel: 'Pastoral Geral' | 'Pastoral Restrito' | 'Gabinete Pastoral (Sigilo Absoluto)';
}

export interface MemberDocument {
  id: string;
  category:
    | 'Fotografia'
    | 'Documento de Identidade (RG/CPF)'
    | 'Comprovante de Residência'
    | 'Certidão de Nascimento/Casamento'
    | 'Certificado de Batismo'
    | 'Carta de Transferência'
    | 'Carta de Recomendação'
    | 'Diploma/Certificado Bíblico'
    | 'Credencial Ministerial'
    | 'Termo de Consentimento LGPD'
    | 'Outro Documento';
  title: string;
  fileName: string;
  fileSize?: string;
  fileUrl: string;
  issueDate?: string;
  expiryDate?: string;
  uploadDate: string;
  uploadedBy: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'espiritual' | 'sacramental' | 'ministerial' | 'departamental' | 'pastoral' | 'administrativo';
  isAutomatic?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: 'Criação' | 'Atualização' | 'Transferência' | 'Desligamento' | 'Exclusão' | 'Visualização Restrita' | 'Aconselhamento';
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  legalBasis: string;
}

export interface MemberStatusHistory {
  id: string;
  date: string;
  previousStatus: MemberStatus;
  newStatus: MemberStatus;
  changedBy: string;
  reason?: string;
}

export interface Member {
  // MÓDULO 1: DADOS PESSOAIS E IDENTIFICAÇÃO
  id: string;
  registrationNumber: string; // Ex: MEM-2024-0012
  fullName: string;
  socialName?: string;
  photoUrl?: string;
  gender: 'Masculino' | 'Feminino' | 'Outro';
  birthDate: string; // YYYY-MM-DD
  birthplaceCity?: string;
  birthplaceState?: string;
  nationality: string;
  maritalStatus: MaritalStatus;
  profession?: string;
  educationLevel?: string;
  cpf?: string;
  rg?: string;
  rgIssuer?: string;
  rgIssueDate?: string;
  cnh?: string;
  passport?: string;

  // Informações de Contato
  primaryPhone: string;
  secondaryPhone?: string;
  whatsapp?: string;
  email?: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  referencePoint?: string;
  residenceType?: 'Própria' | 'Alugada' | 'Cedida' | 'Familiar';
  preferredContactTime?: 'Manhã' | 'Tarde' | 'Noite' | 'Qualquer Horário';

  // Informações Complementares
  howMetChurch?: string;
  whoInvited?: string;
  firstContactDate?: string;
  firstVisitDate?: string;
  accessibilityNeeds?: string;
  specificServiceRequests?: string;
  generalNotes?: string;

  // MÓDULO 2: DADOS FAMILIARES
  fatherName?: string;
  fatherIsAlive?: boolean;
  fatherReligion?: string;
  fatherIsChurchMember?: boolean;
  fatherChurchName?: string;

  motherName?: string;
  motherIsAlive?: boolean;
  motherReligion?: string;
  motherIsChurchMember?: boolean;
  motherChurchName?: string;

  spouseName?: string;
  spouseMemberId?: string; // Vinculação com membro existente!
  marriageDate?: string;
  unionType?: 'Civil e Religioso' | 'Apenas Religioso' | 'Apenas Civil' | 'União Estável';
  spouseIsChristian?: boolean;
  spouseIsChurchMember?: boolean;
  spouseChurchName?: string;
  spouseJoinDate?: string;
  spouseNotes?: string;

  children: ChildInfo[];
  otherRelatives: RelativeInfo[];

  // MÓDULO 3: HISTÓRICO DE CONVERSÃO E VIDA ESPIRITUAL
  hadPreviousReligiousExperience?: boolean;
  previousReligion?: string;
  attendedEvangelicalChurchBefore?: boolean;
  firstEvangelicalChurchAttended?: string;
  firstEvangelicalChurchStartDate?: string;
  conversionDate?: string;
  conversionPlace?: string;
  conversionChurch?: string;
  mentoredBy?: string;
  conversionStoryDetails?: string;
  situationBeforeConversion?: string;
  wasMemberOfOtherDenomination?: boolean;
  spiritualEventsAttended?: string; // Retiros, congressos
  hasPersonalTestimony?: boolean;
  personalTestimonyText?: string;
  hadSpiritualDrynessPeriod?: boolean;
  spiritualTrajectoryDetails?: string;
  authorizedPastoralNotes?: string;

  // MÓDULO 4: BATISMO E ORDENANÇAS
  isWaterBaptized: boolean;
  waterBaptismDate?: string;
  waterBaptismChurch?: string;
  waterBaptismCity?: string;
  waterBaptismState?: string;
  officiatingPastor?: string;
  officiatingMinister?: string;
  baptismMode?: 'Imersão' | 'Aspersão' | 'Afusão';
  hasBaptismCertificate?: boolean;
  baptismCertificateNumber?: string;
  baptismCertificateUrl?: string;
  waterBaptismNotes?: string;

  hasHolySpiritBaptism: boolean;
  holySpiritBaptismDate?: string;
  holySpiritBaptismPlace?: string;
  holySpiritBaptismChurch?: string;
  holySpiritBaptismAccount?: string;
  holySpiritBaptismNotes?: string;

  partakesHolyCommunionRegularly: boolean;
  firstHolyCommunionDate?: string;
  communionNotes?: string;

  childDedicationDate?: string;
  childDedicatedBy?: string;
  otherOrdinancesNotes?: string;

  // MÓDULO 5: HISTÓRICO DE IGREJAS ANTERIORES
  previousChurches: PreviousChurchInfo[];

  // MÓDULO 6: HISTÓRICO DE MINISTÉRIOS E DEPARTAMENTOS
  ministries: MinistryParticipation[];

  // MÓDULO 7: HISTÓRICO MINISTERIAL E ECLESIÁSTICO
  currentMinisterialRole: MinisterialRole;
  ordinations: OrdinationInfo[];
  leadershipExperience: {
    ledDepartment?: boolean;
    departmentsLed?: string;
    departmentLeadershipDuration?: string;
    nominatedBy?: string;
    supervisor?: string;
    ledCongregation?: boolean;
    pastoredChurch?: boolean;
    exercisedRegionalLeadership?: boolean;
    participatedInConventions?: boolean;
    participatedInCouncils?: boolean;
    hasMinisterialCredentials?: boolean;
    credentialsNumber?: string;
    credentialsExpiryDate?: string;
  };

  // MÓDULO 8: FORMAÇÃO BÍBLICA E TEOLÓGICA
  theologicalCourses: TheologicalCourse[];
  theologicalSkills: {
    bibleKnowledgeAreas?: string;
    teachingExperience?: boolean;
    taughtBibleStudies?: boolean;
    preachingExperience?: boolean;
    counselingExperience?: boolean;
    missionsTraining?: boolean;
    notes?: string;
  };

  // MÓDULO 9: HISTÓRICO DE CONGREGAÇÕES E TRANSFERÊNCIAS
  currentCongregationId: string;
  admissionDate: string;
  admissionType: 'Batismo' | 'Transferência com Carta' | 'Aclamação' | 'Reconciliação' | 'Profissão de Fé';
  effectiveMembershipDate?: string;
  congregationTransfers: CongregationTransfer[];

  // MÓDULO 10: ACOMPANHAMENTO PASTORAL
  pastoralCareRecords: PastoralCareRecord[];

  // MÓDULO 11: SITUAÇÃO ATUAL DO MEMBRO
  currentStatus: MemberStatus;
  statusHistory: MemberStatusHistory[];
  lastDataUpdateDate: string;
  lastPastoralContactDate?: string;
  assignedPastor?: string;

  // MÓDULO 12: DOCUMENTOS E ARQUIVOS
  documents: MemberDocument[];

  // LINHA DO TEMPO & AUDITORIA LGPD
  timeline: TimelineEvent[];
  auditLogs: AuditLogEntry[];

  // TERMOS E LGPD
  lgpdConsentGiven: boolean;
  lgpdConsentDate?: string;
  lgpdLegalBasis: string;
}

export interface Congregation {
  id: string;
  code: string;
  name: string;
  isHeadquarters: boolean; // Sede ou Filial
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  seniorPastor: string;
  phone: string;
  email: string;
  foundationDate: string;
  capacity: number;
}

export interface InstitutionSettings {
  name: string;
  cnpj: string;
  motto: string;
  headquartersAddress: string;
  phone: string;
  email: string;
  website: string;
  seniorPastorPresident: string;
  logoUrl?: string;
  bannerUrl?: string;
  lgpdDpoName: string;
  lgpdDpoEmail: string;
  retentionYears: number;
  allowSelfServiceUpdate: boolean;
}

export interface AdministrativeAlert {
  id: string;
  type: 'aniversario' | 'novo_convertido' | 'integracao' | 'atualizacao' | 'validade_doc' | 'transferencia';
  title: string;
  description: string;
  date: string;
  memberId?: string;
  severity: 'info' | 'warning' | 'urgent';
  resolved?: boolean;
}

export interface AdminCredentials {
  name: string;
  email: string;
  username: string;
  password: string; // Stored securely in persistent storage
  lastLogin?: string;
  updatedAt?: string;
}

