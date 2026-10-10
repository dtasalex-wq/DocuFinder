import React, { useState } from 'react';
import {
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  X,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AppUser } from '../types';
import { verifyResetAuthorizationPassword } from '../utils/auth';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => Promise<void> | void;
  currentUser: AppUser;
  totalDocs: number;
  totalHistory: number;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
  currentUser,
  totalDocs,
  totalHistory,
}) => {
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isProcessing) return;
    setAuthPassword('');
    setErrorMessage(null);
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const isAuthorized = verifyResetAuthorizationPassword(authPassword);
    if (!isAuthorized) {
      setErrorMessage(
        'Senha de autorização incorreta. Esta operação requer a credencial de segurança master ("autorizo_zerar" ou "suporteabc").'
      );
      return;
    }

    try {
      setIsProcessing(true);
      await onConfirmReset();
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 900);
    } catch {
      setErrorMessage('Ocorreu um erro ao zerar os dados. Tente novamente.');
      setIsProcessing(false);
    }
  };

  const isSupport = currentUser.isSuperuser || currentUser.username === 'suporte';
  const roleLabel = isSupport ? 'Superusuário / Suporte' : 'Administrador do Sistema';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-scale-up">
        {/* Header Bar */}
        <div className="bg-red-50/70 border-b border-red-100 p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Zerar Todos os Dados</h3>
              <p className="text-[11px] text-red-700 font-medium mt-0.5">
                Ação crítica restrita a Administradores e Suporte
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {/* Operator identification badge */}
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Operador Solicitante:</span>
              <span className="font-semibold text-slate-800">{currentUser.name}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-semibold text-indigo-700 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>{roleLabel}</span>
            </div>
          </div>

          {/* Impact summary */}
          <div className="mb-5 grid grid-cols-2 gap-2.5 text-center">
            <div className="p-2.5 bg-red-50/50 border border-red-100 rounded-xl">
              <span className="block text-[11px] text-slate-500">Documentos a apagar</span>
              <span className="text-lg font-bold text-red-600">{totalDocs}</span>
            </div>
            <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-xl">
              <span className="block text-[11px] text-slate-500">Histórico de buscas</span>
              <span className="text-lg font-bold text-amber-700">{totalHistory}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            Esta operação apagará permanentemente todos os arquivos PDF indexados, índices em memória e históricos salvos. 
            Para confirmar, digite a senha de autorização do sistema.
          </p>

          {/* Error & Success Feedback */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span className="leading-tight">{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Dados zerados com sucesso! Fechando...</span>
            </div>
          )}

          {/* Form with authorization password input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Senha de Autorização Master
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  disabled={isProcessing || isSuccess}
                  value={authPassword}
                  onChange={(e) => {
                    setAuthPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Digite 'autorizo_zerar' ou 'suporteabc'"
                  className="block w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                A autorização exige a credencial: <code className="text-slate-600 font-mono">autorizo_zerar</code> ou <code className="text-slate-600 font-mono">suporteabc</code>.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isProcessing || isSuccess || !authPassword.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirmar e Zerar Tudo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
