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
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView, currentUserRole, isAuthenticated } = useChurch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

      {/* Mobile Sidebar Toggle Button (visible on small screens) */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-2 flex items-center justify-between border-b border-slate-800 no-print">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-semibold p-1 hover:text-amber-400"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Módulos do Sistema Eclesiástico</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block no-print">
          <Sidebar />
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex no-print">
            <div className="fixed inset-0 bg-slate-900/60" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative z-50 w-72 bg-slate-900 h-full flex flex-col">
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>

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
