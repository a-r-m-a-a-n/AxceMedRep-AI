import React, { useState } from 'react';
import { User } from '../types/clinical';
import { ShieldCheck, ChevronDown, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  availablePersonas: User[];
  onSwitchPersona: (userId: string) => void;
  pendingReviewCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  availablePersonas,
  onSwitchPersona,
  pendingReviewCount,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 bg-slate-900 text-white rounded flex items-center justify-center font-bold text-xs tracking-wider">
            AM
          </div>
          <span>AxceMedRep AI</span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'dashboard'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('documents')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              currentTab === 'documents'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Document Queue</span>
            {pendingReviewCount > 0 && (
              <span className="text-[11px] font-mono text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
                {pendingReviewCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('patients')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'patients'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Patients
          </button>
          <button
            onClick={() => onSelectTab('reports')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'reports'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Clinical Reports
          </button>
          <button
            onClick={() => onSelectTab('evaluation')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'evaluation'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Safety & Accuracy Tests
          </button>
          <button
            onClick={() => onSelectTab('audit')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'audit'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Audit Logs & Admin
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Persona Switcher) */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800"
            title="Switch User Persona for RBAC Testing"
          >
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold leading-tight text-slate-900">
                {currentUser?.name || 'Clinician'}
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                {currentUser?.role === 'Physician' && currentUser.licenseNumber
                  ? `Physician · ${currentUser.licenseNumber}`
                  : currentUser?.role || 'Staff'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                Switch Role / Clinician Persona (RBAC)
              </div>
              {availablePersonas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => {
                    onSwitchPersona(persona.id);
                    setShowPersonaMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-start gap-2 hover:bg-slate-50 transition-colors ${
                    currentUser?.id === persona.id ? 'bg-slate-50 font-medium' : ''
                  }`}
                >
                  <UserCheck className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${currentUser?.id === persona.id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <div>
                    <div className="font-semibold text-slate-900">{persona.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {persona.role} {persona.licenseNumber ? `· ${persona.licenseNumber}` : ''}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
