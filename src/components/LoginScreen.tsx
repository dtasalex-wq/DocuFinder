import React, { useState } from 'react';
import { AppUser } from '../types';
import {
  loginUser,
  requestPasswordReset,
} from '../utils/auth';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Search,
  FileText,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  // Login fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const res = loginUser(email, password, rememberMe);
      setIsSubmitting(false);

      if (res.success && res.user) {
        setSuccessMessage(`Bem-vindo de volta, ${res.user.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 400);
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas.');
      }
    }, 300);
  };


  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestPasswordReset(resetEmail);
    setResetFeedback(res.message);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-8 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 right-10 w-[400px] h-[250px] bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />

      {/* Main Login Card Box - Compact */}
      <div className="sm:mx-auto sm:w-full max-w-[370px] relative z-10 px-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Logo Banner inside the same box */}
          <div className="pt-5 pb-3 px-5 flex justify-center items-center bg-white border-b border-slate-100">
            <img
              src="/logo-banner.png"
              alt="DocuFinder - Encontre o que você precisa em arquivos .pdf."
              className="w-full max-w-[230px] h-auto object-contain mx-auto"
            />
          </div>

          <div className="p-5 sm:p-5">
            {/* Feedback messages */}
            {errorMessage && (
              <div className="mb-4 flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span className="leading-tight">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* DIRECT LOGIN FORM */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usuário ou E-mail
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="administrador, dtas.alex@gmail.com ou suporte"
                    className="block w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetFeedback(null);
                      setForgotPasswordOpen(true);
                    }}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative rounded-lg shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-8 pr-9 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600">Lembrar acesso</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1.5 flex items-center justify-center gap-2 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-600/20 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar no DocuFinder</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Security & Features badges */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-slate-400 text-[10px]">
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Processamento Local</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>OCR e Leitura</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span>Grandes PDFs</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden p-6 animate-scale-up">
            <div className="flex items-center gap-2.5 mb-2 text-indigo-600 font-semibold text-sm">
              <HelpCircle className="w-5 h-5" />
              <span>Recuperação de Senha</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Informe seu e-mail cadastrado para obter orientações de recuperação de acesso.
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {resetFeedback && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-900 text-xs">
                  {resetFeedback}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                >
                  Verificar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
