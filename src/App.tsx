/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChurchProvider, useChurch } from './context/ChurchContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { MemberList } from './components/members/MemberList.tsx';
import { MemberMedicalRecord } from './components/members/MemberMedicalRecord.tsx';
import { MemberFormWizard } from './components/members/MemberFormWizard.tsx';
import { FamilyTreeView } from './components/members/FamilyTreeView.tsx';
import { MinisterialManagementView } from './components/members/MinisterialManagementView.tsx';
import { CongregationsView } from './components/congregations/CongregationsView.tsx';
import { PastoralCareView } from './components/pastoral/PastoralCareView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { BirthdaysView } from './components/birthdays/BirthdaysView.tsx';
import { LgpdSettingsView } from './components/lgpd/LgpdSettingsView.tsx';
import { SettingsBackupView } from './components/settings/SettingsBackupView.tsx';
import { PrintableMemberCard } from './components/members/PrintableMemberCard.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { AdminCredentialsModal } from './components/auth/AdminCredentialsModal.tsx';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  UserPlus,
  Calendar,
  Layers,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    setSelectedMemberId,
    currentUserRole,
    isAuthenticated,
    members,
    alerts,
  } = useChurch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeAlertsCount = alerts.filter((a) => !a.resolved).length;

  // If not logged in, present Admin Geral Login screen
  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'members':
        return <MemberList />;
      case 'member_record':
        return <MemberMedicalRecord />;
      case 'wizard':
        return <MemberFormWizard />;
      case 'family_tree':
        return <FamilyTreeView />;
      case 'ministerial':
        return <MinisterialManagementView />;
      case 'congregations':
        return <CongregationsView />;
      case 'pastoral':
        return <PastoralCareView />;
      case 'reports':
        return <ReportsView />;
      case 'birthdays':
        return <BirthdaysView />;
      case 'lgpd':
        return <LgpdSettingsView />;
      case 'settings':
        return currentUserRole === 'ADMIN_GERAL' ? <SettingsBackupView /> : <DashboardView />;
      case 'print_record':
        return <PrintableMemberCard />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block no-print">
          <Sidebar />
        </div>

        {/* Mobile Slide-Over Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex no-print">
            <div
              className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-72 max-w-[85vw] bg-slate-900 h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
              <Sidebar
                onNavigate={() => setMobileMenuOpen(false)}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Viewport with extra bottom padding on mobile for the bottom nav bar */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Sticky Mobile Bottom Navigation Bar (Phone optimized) */}
      <nav
        aria-label="Navegação Móvel"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-2xl no-print"
      >
        {/* Dashboard */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setActiveView('dashboard');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer min-w-[56px] ${
            activeView === 'dashboard'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Início</span>
        </button>

        {/* Membros */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setActiveView('members');
          }}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer min-w-[56px] ${
            activeView === 'members'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            {members.length > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono bg-slate-800 text-amber-300 px-1 rounded-full border border-slate-700">
                {members.length}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Membros</span>
        </button>

        {/* Quick Add Member Action (Elevated Button) */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setSelectedMemberId(null);
            setActiveView('wizard');
          }}
          className="flex flex-col items-center justify-center -mt-4 group cursor-pointer"
          title="Cadastrar Novo Membro"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-900/40 group-active:scale-95 transition-transform border-2 border-slate-900">
            <UserPlus className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold text-amber-400 mt-0.5">Novo</span>
        </button>

        {/* Aniversários */}
        <button
          onClick={() => {
            setMobileMenuOpen(false);
            setActiveView('birthdays');
          }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer min-w-[56px] ${
            activeView === 'birthdays'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Aniversários</span>
        </button>

        {/* Menu / Mais Módulos */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer min-w-[56px] ${
            mobileMenuOpen
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Layers className="w-5 h-5" />
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">Mais</span>
        </button>
      </nav>

      {/* Admin Geral Credentials Modal */}
      <AdminCredentialsModal />
    </div>
  );
};

export default function App() {
  return (
    <ChurchProvider>
      <AppContent />
    </ChurchProvider>
  );
}
