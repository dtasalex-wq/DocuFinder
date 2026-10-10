import React, { useState, useEffect } from 'react';
import { AppUser, UserRole, UserStatus, UserPermissions } from '../types';
import {
  getVisibleUsers,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  toggleUserStatus,
  resetManagedUserPassword,
} from '../utils/auth';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Shield,
  KeyRound,
  UserPlus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Mail,
  User,
  Building2,
  Check,
  Power,
  BarChart3,
  FileText,
  UploadCloud,
  Download,
} from 'lucide-react';

interface UserManagerProps {
  currentUser: AppUser;
}

export const UserManager: React.FC<UserManagerProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Create form state
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createCompany, setCreateCompany] = useState(currentUser.company || 'DocuFinder Workspace');
  const [createRole, setCreateRole] = useState<UserRole>('membro');
  const [createPlan, setCreatePlan] = useState<'Profissional' | 'Empresarial'>('Empresarial');
  const [createPassword, setCreatePassword] = useState('');
  const [createPermissions, setCreatePermissions] = useState<UserPermissions>({
    canUploadDocs: true,
    canDeleteDocs: false,
    canExportData: false,
    canManageUsers: false,
    canViewMetrics: false,
  });

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('membro');
  const [editPlan, setEditPlan] = useState<'Profissional' | 'Empresarial'>('Empresarial');
  const [editStatus, setEditStatus] = useState<UserStatus>('ativo');
  const [editPermissions, setEditPermissions] = useState<UserPermissions>({
    canUploadDocs: true,
    canDeleteDocs: false,
    canExportData: false,
    canManageUsers: false,
    canViewMetrics: false,
  });

  // Reset password state
  const [newPassword, setNewPassword] = useState('');

  // Load visible users (superusuário suporte nunca aparece)
  const refreshUsers = () => {
    const list = getVisibleUsers();
    setUsers(list);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Adjust default permissions when changing role in create modal
  const handleRoleChangeInCreate = (newRole: UserRole) => {
    setCreateRole(newRole);
    if (newRole === 'admin') {
      setCreatePermissions({
        canUploadDocs: true,
        canDeleteDocs: true,
        canExportData: true,
        canManageUsers: true,
        canViewMetrics: true,
      });
    } else if (newRole === 'analista') {
      setCreatePermissions({
        canUploadDocs: true,
        canDeleteDocs: false,
        canExportData: true,
        canManageUsers: false,
        canViewMetrics: true,
      });
    } else {
      setCreatePermissions({
        canUploadDocs: true,
        canDeleteDocs: false,
        canExportData: false,
        canManageUsers: false,
        canViewMetrics: false,
      });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createManagedUser({
      name: createName,
      email: createEmail,
      username: createUsername,
      company: createCompany,
      role: createRole,
      plan: createPlan,
      password: createPassword,
      permissions: createPermissions,
    });

    if (res.success) {
      showNotification('success', `Usuário ${createName} cadastrado com sucesso!`);
      setIsCreateOpen(false);
      setCreateName('');
      setCreateEmail('');
      setCreateUsername('');
      setCreatePassword('');
      refreshUsers();
    } else {
      showNotification('error', res.error || 'Erro ao cadastrar usuário.');
    }
  };

  const openEditModal = (u: AppUser) => {
    setSelectedUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditUsername(u.username || '');
    setEditCompany(u.company);
    setEditRole(u.role || 'membro');
    setEditPlan(u.plan);
    setEditStatus(u.status || 'ativo');
    setEditPermissions(
      u.permissions || {
        canUploadDocs: true,
        canDeleteDocs: u.role === 'admin',
        canExportData: u.role === 'admin' || u.role === 'analista',
        canManageUsers: u.role === 'admin',
        canViewMetrics: u.role === 'admin' || u.role === 'analista',
      }
    );
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = updateManagedUser({
      ...selectedUser,
      name: editName,
      email: editEmail,
      username: editUsername,
      company: editCompany,
      role: editRole,
      plan: editPlan,
      status: editStatus,
      permissions: editPermissions,
    });

    if (res.success) {
      showNotification('success', 'Dados e permissões atualizados com sucesso!');
      setIsEditOpen(false);
      refreshUsers();
    } else {
      showNotification('error', res.error || 'Erro ao atualizar usuário.');
    }
  };

  const handleToggleStatus = (u: AppUser) => {
    const res = toggleUserStatus(u.id);
    if (res.success) {
      showNotification(
        'success',
        `Usuário ${u.name} agora está ${res.newStatus === 'ativo' ? 'Ativo' : 'Inativo'}.`
      );
      refreshUsers();
    } else {
      showNotification('error', res.error || 'Erro ao alterar status.');
    }
  };

  const handleDelete = (u: AppUser) => {
    if (window.confirm(`Tem certeza que deseja remover o usuário "${u.name}" (${u.email})?`)) {
      const res = deleteManagedUser(u.id);
      if (res.success) {
        showNotification('success', `Usuário ${u.name} removido com sucesso.`);
        refreshUsers();
      } else {
        showNotification('error', res.error || 'Erro ao excluir usuário.');
      }
    }
  };

  const openResetPasswordModal = (u: AppUser) => {
    setSelectedUser(u);
    setNewPassword('');
    setIsResetPassOpen(true);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const res = resetManagedUserPassword(selectedUser.id, newPassword);
    if (res.success) {
      showNotification('success', `Senha do usuário ${selectedUser.name} redefinida com sucesso!`);
      setIsResetPassOpen(false);
      setNewPassword('');
    } else {
      showNotification('error', res.error || 'Erro ao redefinir senha.');
    }
  };

  // Metrics calculation
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status !== 'inativo').length;
  const adminUsersCount = users.filter((u) => u.role === 'admin').length;
  const analystUsersCount = users.filter((u) => u.role === 'analista').length;
  const memberUsersCount = users.filter((u) => u.role === 'membro' || !u.role).length;

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchFilter.toLowerCase())) ||
      u.company.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesRole =
      roleFilter === 'todos' ||
      (roleFilter === 'admin' && u.role === 'admin') ||
      (roleFilter === 'analista' && u.role === 'analista') ||
      (roleFilter === 'membro' && (u.role === 'membro' || !u.role));

    const matchesStatus =
      statusFilter === 'todos' ||
      (statusFilter === 'ativo' && u.status !== 'inativo') ||
      (statusFilter === 'inativo' && u.status === 'inativo');

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-bold text-slate-900">Gestão de Usuários & Permissões</h2>
          </div>
          <p className="text-xs text-slate-500">
            Métricas de equipe, controle granular de papéis e cadastro seguro de novos operadores.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Usuário</span>
        </button>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg text-xs font-medium flex items-center justify-between animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Total de Usuários</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalUsersCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Cadastrados no sistema</p>
        </div>

        {/* Card 2: Active Users */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Usuários Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{activeUsersCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {totalUsersCount - activeUsersCount > 0
              ? `${totalUsersCount - activeUsersCount} desativado(s)`
              : '100% ativos com acesso'}
          </p>
        </div>

        {/* Card 3: Administrators */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Gestores / Admins</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600">{adminUsersCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Acesso irrestrito a configurações</p>
        </div>

        {/* Card 4: Analysts & Members */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500">Analistas & Membros</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{analystUsersCount + memberUsersCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {analystUsersCount} analistas • {memberUsersCount} membros
          </p>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Buscar por nome, e-mail ou @usuário..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        {/* Role & Status Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Papel:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="todos">Todos os Papéis</option>
              <option value="admin">Administrador</option>
              <option value="analista">Analista</option>
              <option value="membro">Membro</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="todos">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* USERS MANAGEMENT TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Usuário</th>
                <th className="py-3 px-4">Organização / E-mail</th>
                <th className="py-3 px-4">Papel & Plano</th>
                <th className="py-3 px-4">Permissões de Acesso</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isAdmin = u.role === 'admin';
                  const isAnalyst = u.role === 'analista';
                  const isActive = u.status !== 'inativo';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Column 1: User info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                            <p className="text-[11px] text-slate-400">
                              @{u.username || u.email.split('@')[0]}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Organization & email */}
                      <td className="py-3 px-4">
                        <p className="text-slate-800 font-medium">{u.email}</p>
                        <p className="text-[11px] text-slate-500">{u.company}</p>
                      </td>

                      {/* Column 3: Role & Plan badge */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isAdmin
                                ? 'bg-purple-100 text-purple-800'
                                : isAnalyst
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isAdmin ? 'Administrador' : isAnalyst ? 'Analista' : 'Membro'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Plano {u.plan}
                          </span>
                        </div>
                      </td>

                      {/* Column 4: Granular Permissions */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions?.canUploadDocs && (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] flex items-center gap-1 font-medium">
                              <UploadCloud className="w-2.5 h-2.5" /> Upload
                            </span>
                          )}
                          {u.permissions?.canDeleteDocs && (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] flex items-center gap-1 font-medium">
                              <Trash2 className="w-2.5 h-2.5" /> Exclusão
                            </span>
                          )}
                          {u.permissions?.canExportData && (
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] flex items-center gap-1 font-medium">
                              <Download className="w-2.5 h-2.5" /> Exportação
                            </span>
                          )}
                          {u.permissions?.canManageUsers && (
                            <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] flex items-center gap-1 font-medium">
                              <Shield className="w-2.5 h-2.5" /> Gestão
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Column 5: Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                          title="Clique para alternar o status do usuário"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-emerald-600' : 'bg-slate-500'
                            }`}
                          />
                          <span>{isActive ? 'Ativo' : 'Inativo'}</span>
                        </button>
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar Dados e Permissões"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openResetPasswordModal(u)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Redefinir Senha do Usuário"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CADASTRAR NOVO USUÁRIO */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Cadastrar Novo Usuário</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="Ex: Roberto Alves"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome de Usuário (@login)
                  </label>
                  <input
                    type="text"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="Ex: roberto.alves"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="roberto@empresa.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Senha Inicial (mínimo 5) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={5}
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Papel / Função no Sistema
                  </label>
                  <select
                    value={createRole}
                    onChange={(e) => handleRoleChangeInCreate(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="membro">Membro (Consulta e Leitura)</option>
                    <option value="analista">Analista (Busca Avançada e Métricas)</option>
                    <option value="admin">Administrador (Gestão Completa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plano de Assinatura
                  </label>
                  <select
                    value={createPlan}
                    onChange={(e) => setCreatePlan(e.target.value as 'Profissional' | 'Empresarial')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="Empresarial">Empresarial (OCR + Ilimitado)</option>
                    <option value="Profissional">Profissional (5.000 páginas/mês)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Permissões de Acesso Granulares
                </label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={createPermissions.canUploadDocs}
                      onChange={(e) =>
                        setCreatePermissions((prev) => ({ ...prev, canUploadDocs: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Fazer Upload de novos arquivos PDF</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={createPermissions.canDeleteDocs}
                      onChange={(e) =>
                        setCreatePermissions((prev) => ({ ...prev, canDeleteDocs: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Excluir documentos da base de pesquisa</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={createPermissions.canExportData}
                      onChange={(e) =>
                        setCreatePermissions((prev) => ({ ...prev, canExportData: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Exportar relatórios e resultados de busca</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={createPermissions.canManageUsers}
                      onChange={(e) =>
                        setCreatePermissions((prev) => ({ ...prev, canManageUsers: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Gerenciar outros usuários e alterar permissões</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={createPermissions.canViewMetrics}
                      onChange={(e) =>
                        setCreatePermissions((prev) => ({ ...prev, canViewMetrics: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Visualizar dashboard de métricas e analytics</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR USUÁRIO & PERMISSÕES */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Editar Usuário & Permissões</h3>
              </div>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome de Usuário (@login)
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail de Acesso
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Organização / Empresa
                  </label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Papel / Função
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="membro">Membro</option>
                    <option value="analista">Analista</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Plano
                  </label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as 'Profissional' | 'Empresarial')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="Empresarial">Empresarial</option>
                    <option value="Profissional">Profissional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 bg-white"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Granular Permissions Section */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Permissões Granulares
                </label>
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={editPermissions.canUploadDocs}
                      onChange={(e) =>
                        setEditPermissions((prev) => ({ ...prev, canUploadDocs: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Upload de arquivos PDF</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={editPermissions.canDeleteDocs}
                      onChange={(e) =>
                        setEditPermissions((prev) => ({ ...prev, canDeleteDocs: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Exclusão de Documentos</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={editPermissions.canExportData}
                      onChange={(e) =>
                        setEditPermissions((prev) => ({ ...prev, canExportData: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Exportação de Dados e Resultados</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={editPermissions.canManageUsers}
                      onChange={(e) =>
                        setEditPermissions((prev) => ({ ...prev, canManageUsers: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Gerenciamento de Usuários e Permissões</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700">
                    <input
                      type="checkbox"
                      checked={editPermissions.canViewMetrics}
                      onChange={(e) =>
                        setEditPermissions((prev) => ({ ...prev, canViewMetrics: e.target.checked }))
                      }
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span>Visualização de Métricas do Sistema</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REDEFINIR SENHA DO USUÁRIO */}
      {isResetPassOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden animate-scale-up p-6">
            <div className="flex items-center gap-2 text-indigo-600 mb-2 font-bold text-sm">
              <KeyRound className="w-5 h-5" />
              <span>Redefinir Senha de Acesso</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Atribua uma nova senha para o usuário <strong>{selectedUser.name}</strong> ({selectedUser.email}):
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nova Senha (mínimo 5 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={5}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetPassOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Redefinir Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
