import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Search, History, BarChart3, User, RotateCcw, LogOut, ChevronDown, Shield } from 'lucide-react';
import { AppUser } from '../types';

interface TopBarProps {
  activeTab: 'search' | 'documents' | 'history' | 'metrics';
  setActiveTab: (tab: 'search' | 'documents' | 'history' | 'metrics') => void;
  onOpenUpload: () => void;
  user: AppUser;
  onOpenAccount: () => void;
  onResetAll?: () => void;
  onLogout?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  user,
  onOpenAccount,
  onResetAll,
  onLogout,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand logo and header text */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('search');
            }}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            title="DocuFinder - Encontre o que você precisa em arquivos .pdf."
          >
            <img
              src="/logo.png"
              alt="DocuFinder Logo"
              className="h-10 w-10 object-contain rounded-lg shrink-0"
            />
            <div className="flex flex-col justify-center">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                DocuFinder
              </span>
              <span className="text-[10.5px] font-semibold text-indigo-600 leading-tight mt-0.5 hidden sm:inline">
                Encontre o que você precisa em arquivos .pdf.
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              activeTab === 'search'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Pesquisa</span>
          </button>

          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              activeTab === 'documents'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Documentos</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              activeTab === 'history'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Histórico</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center gap-1.5 py-1 transition-colors ${
              activeTab === 'metrics'
                ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                : 'hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onResetAll && (
            <button
              onClick={onResetAll}
              title="Zerar todos os dados do aplicativo"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Zerar Dados</span>
            </button>
          )}

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Enviar PDFs</span>
          </button>

          {/* User Profile & Account Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="Menu do Usuário"
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[110px] truncate font-semibold">{user.name.split(' ')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {user.plan}
                    </span>
                    {user.role && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenAccount();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Configurações da Conta</span>
                  </button>
                </div>

                {onLogout && (
                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>Sair da Conta (Logout)</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
