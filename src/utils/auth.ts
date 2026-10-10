import { AppUser } from '../types';

export interface UserAccount extends AppUser {
  passwordHash: string;
}

const SESSION_KEY = 'docufinder_auth_session';
const USERS_KEY = 'docufinder_registered_users';
const REMEMBER_KEY = 'docufinder_remember_me';

const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr_super',
    name: 'Suporte DocuFinder',
    username: 'suporte',
    email: 'suporte@docufinder.com',
    company: 'DocuFinder Master Admin',
    plan: 'Empresarial',
    role: 'admin',
    isSuperuser: true,
    status: 'ativo',
    permissions: {
      canUploadDocs: true,
      canDeleteDocs: true,
      canExportData: true,
      canManageUsers: true,
      canViewMetrics: true,
      canResetAllData: true,
    },
    createdAt: '2026-10-09T00:00:00.000Z',
    passwordHash: 'suporteabc',
  },
  {
    id: 'usr_admin',
    name: 'Administrador do Sistema',
    username: 'administrador',
    email: 'administrador@docufinder.com',
    company: 'DocuFinder Gestão',
    plan: 'Empresarial',
    role: 'admin',
    status: 'ativo',
    permissions: {
      canUploadDocs: true,
      canDeleteDocs: true,
      canExportData: true,
      canManageUsers: true,
      canViewMetrics: true,
      canResetAllData: true,
    },
    createdAt: '2026-10-09T10:00:00.000Z',
    passwordHash: 'adm321',
  },
  {
    id: 'usr_1',
    name: 'Alex Silva',
    username: 'alex',
    email: 'dtas.alex@gmail.com',
    company: 'DocuFinder Workspace',
    plan: 'Empresarial',
    role: 'admin',
    status: 'ativo',
    permissions: {
      canUploadDocs: true,
      canDeleteDocs: true,
      canExportData: true,
      canManageUsers: true,
      canViewMetrics: true,
      canResetAllData: true,
    },
    createdAt: '2026-01-15T10:00:00.000Z',
    passwordHash: 'dantas123',
  },
  {
    id: 'usr_3',
    name: 'Mariana Costa',
    username: 'mariana',
    email: 'mariana.costa@empresa.com.br',
    company: 'Auditoria & Compliance Corp',
    plan: 'Profissional',
    role: 'analista',
    status: 'ativo',
    permissions: {
      canUploadDocs: true,
      canDeleteDocs: false,
      canExportData: true,
      canManageUsers: false,
      canViewMetrics: true,
      canResetAllData: false,
    },
    createdAt: '2026-03-10T14:20:00.000Z',
    passwordHash: 'senha123',
  },
];

/**
 * Initializes and retrieves all registered users from localStorage with automatic migrations
 */
export function getRegisteredUsers(): UserAccount[] {
  if (typeof window === 'undefined') return DEFAULT_ACCOUNTS;

  try {
    const raw = localStorage.getItem(USERS_KEY);
    let users: UserAccount[] = DEFAULT_ACCOUNTS;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        users = parsed;
      }
    }

    // Migration: ensure dtas.alex@gmail.com has updated password 'dantas123'
    const alexIndex = users.findIndex(
      (u) => u.email.toLowerCase() === 'dtas.alex@gmail.com'
    );
    if (alexIndex !== -1) {
      users[alexIndex].passwordHash = 'dantas123';
      if (!users[alexIndex].status) users[alexIndex].status = 'ativo';
    }

    // Migration: ensure user 'administrador' exists with password 'adm321'
    const adminIndex = users.findIndex(
      (u) => (u.username && u.username.toLowerCase() === 'administrador') || u.email.toLowerCase() === 'administrador@docufinder.com'
    );
    if (adminIndex === -1) {
      users.push({
        id: 'usr_admin',
        name: 'Administrador do Sistema',
        username: 'administrador',
        email: 'administrador@docufinder.com',
        company: 'DocuFinder Gestão',
        plan: 'Empresarial',
        role: 'admin',
        status: 'ativo',
        permissions: {
          canUploadDocs: true,
          canDeleteDocs: true,
          canExportData: true,
          canManageUsers: true,
          canViewMetrics: true,
          canResetAllData: true,
        },
        createdAt: '2026-10-09T10:00:00.000Z',
        passwordHash: 'adm321',
      });
    } else {
      users[adminIndex].passwordHash = 'adm321';
      users[adminIndex].username = 'administrador';
      users[adminIndex].role = 'admin';
      users[adminIndex].status = 'ativo';
      if (!users[adminIndex].permissions) {
        users[adminIndex].permissions = {
          canUploadDocs: true,
          canDeleteDocs: true,
          canExportData: true,
          canManageUsers: true,
          canViewMetrics: true,
          canResetAllData: true,
        };
      } else {
        users[adminIndex].permissions.canResetAllData = true;
      }
    }

    // Migration: ensure superuser 'suporte' exists with password 'suporteabc'
    const superIndex = users.findIndex(
      (u) => (u.username && u.username.toLowerCase() === 'suporte') || u.email.toLowerCase() === 'suporte@docufinder.com'
    );
    if (superIndex === -1) {
      users.unshift({
        id: 'usr_super',
        name: 'Suporte DocuFinder',
        username: 'suporte',
        email: 'suporte@docufinder.com',
        company: 'DocuFinder Master Admin',
        plan: 'Empresarial',
        role: 'admin',
        isSuperuser: true,
        status: 'ativo',
        permissions: {
          canUploadDocs: true,
          canDeleteDocs: true,
          canExportData: true,
          canManageUsers: true,
          canViewMetrics: true,
          canResetAllData: true,
        },
        createdAt: '2026-10-09T00:00:00.000Z',
        passwordHash: 'suporteabc',
      });
    } else {
      users[superIndex].passwordHash = 'suporteabc';
      users[superIndex].username = 'suporte';
      users[superIndex].isSuperuser = true;
      if (!users[superIndex].permissions) {
        users[superIndex].permissions = {
          canUploadDocs: true,
          canDeleteDocs: true,
          canExportData: true,
          canManageUsers: true,
          canViewMetrics: true,
          canResetAllData: true,
        };
      } else {
        users[superIndex].permissions.canResetAllData = true;
      }
    }

    // Normalize canResetAllData for all users: only Admins and Support can have true
    users.forEach((u) => {
      const isPrivileged = u.role === 'admin' || u.isSuperuser || u.username === 'suporte' || u.username === 'administrador';
      if (u.permissions) {
        u.permissions.canResetAllData = isPrivileged;
      }
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return users;
  } catch (err) {
    console.error('Failed to parse registered users:', err);
    return DEFAULT_ACCOUNTS;
  }
}

/**
 * Saves the users list to localStorage
 */
function saveUsers(users: UserAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users:', err);
  }
}

/**
 * Strips password before returning safe AppUser object
 */
export function sanitizeUser(account: UserAccount): AppUser {
  const { passwordHash, ...safeUser } = account;
  return safeUser;
}

/**
 * Gets currently logged in user from session or localStorage
 */
export function getCurrentSession(): AppUser | null {
  if (typeof window === 'undefined') return null;

  try {
    // Check localStorage (persistent) or sessionStorage (transient)
    const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      return JSON.parse(stored) as AppUser;
    }
  } catch (err) {
    console.error('Failed to get current session:', err);
  }
  return null;
}

/**
 * Login routine with email or username and password verification
 */
export function loginUser(
  loginOrEmail: string,
  password: string,
  rememberMe: boolean = true
): { success: boolean; user?: AppUser; error?: string } {
  const normalizedLogin = loginOrEmail.trim().toLowerCase();
  const normalizedPassword = password.trim();

  if (!normalizedLogin || !normalizedPassword) {
    return { success: false, error: 'Por favor, preencha o usuário/e-mail e a senha.' };
  }

  const users = getRegisteredUsers();
  const found = users.find((u) => {
    const emailMatch = u.email.toLowerCase() === normalizedLogin;
    const usernameMatch = u.username && u.username.toLowerCase() === normalizedLogin;
    const adminAlias =
      (normalizedLogin === 'administrador' || normalizedLogin === 'admin') &&
      (u.username === 'administrador' || u.username === 'admin');
    const superMatch =
      normalizedLogin === 'suporte' &&
      (u.username === 'suporte' || u.email.startsWith('suporte@'));
    return emailMatch || usernameMatch || adminAlias || superMatch;
  });

  if (!found) {
    return {
      success: false,
      error: 'Usuário ou e-mail não encontrado. Verifique a digitação ou cadastre-se.',
    };
  }

  if (found.status === 'inativo') {
    return {
      success: false,
      error: 'Esta conta de usuário está desativada. Entre em contato com a administração.',
    };
  }

  if (found.passwordHash !== normalizedPassword) {
    return {
      success: false,
      error: 'Senha incorreta. Tente novamente ou use a recuperação de senha.',
    };
  }

  const safe = sanitizeUser(found);

  try {
    const userJson = JSON.stringify(safe);
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, userJson);
      localStorage.setItem(REMEMBER_KEY, 'true');
      sessionStorage.removeItem(SESSION_KEY);
    } else {
      sessionStorage.setItem(SESSION_KEY, userJson);
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(REMEMBER_KEY);
    }
  } catch (err) {
    console.error('Could not persist session:', err);
  }

  return { success: true, user: safe };
}

/**
 * Returns all visible users for management and metrics, strictly hiding superuser 'suporte'
 */
export function getVisibleUsers(): AppUser[] {
  const users = getRegisteredUsers();
  return users
    .filter(
      (u) =>
        !u.isSuperuser &&
        u.username !== 'suporte' &&
        u.email.toLowerCase() !== 'suporte@docufinder.com'
    )
    .map((u) => sanitizeUser(u));
}

/**
 * Administrative user creation with role, permissions, and initial password
 */
export function createManagedUser(params: {
  name: string;
  email: string;
  username?: string;
  company?: string;
  plan?: 'Profissional' | 'Empresarial';
  role?: import('../types').UserRole;
  status?: import('../types').UserStatus;
  password: string;
  permissions?: import('../types').UserPermissions;
}): { success: boolean; user?: AppUser; error?: string } {
  const cleanName = params.name.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanUsername = params.username?.trim().toLowerCase();
  const cleanPass = params.password.trim();

  if (!cleanName) return { success: false, error: 'O nome é obrigatório.' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'E-mail inválido.' };
  if (!cleanPass || cleanPass.length < 5) return { success: false, error: 'A senha deve conter no mínimo 5 caracteres.' };

  const users = getRegisteredUsers();
  const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
  if (emailExists) return { success: false, error: 'Já existe um usuário com este e-mail.' };

  if (cleanUsername) {
    const userExists = users.some((u) => u.username && u.username.toLowerCase() === cleanUsername);
    if (userExists) return { success: false, error: 'Este nome de usuário já está em uso.' };
  }

  const role = params.role || 'membro';
  const defaultPermissions: import('../types').UserPermissions = role === 'admin'
    ? { canUploadDocs: true, canDeleteDocs: true, canExportData: true, canManageUsers: true, canViewMetrics: true, canResetAllData: true }
    : role === 'analista'
    ? { canUploadDocs: true, canDeleteDocs: false, canExportData: true, canManageUsers: false, canViewMetrics: true, canResetAllData: false }
    : { canUploadDocs: true, canDeleteDocs: false, canExportData: false, canManageUsers: false, canViewMetrics: false, canResetAllData: false };

  const finalPermissions: import('../types').UserPermissions = {
    ...(params.permissions || defaultPermissions),
    // By security metric: only administrators can have canResetAllData
    canResetAllData: role === 'admin',
  };

  const newAccount: UserAccount = {
    id: `usr_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    username: cleanUsername || cleanEmail.split('@')[0],
    company: params.company?.trim() || 'DocuFinder Workspace',
    plan: params.plan || 'Empresarial',
    role,
    status: params.status || 'ativo',
    permissions: finalPermissions,
    createdAt: new Date().toISOString(),
    passwordHash: cleanPass,
  };

  const updatedList = [...users, newAccount];
  saveUsers(updatedList);
  return { success: true, user: sanitizeUser(newAccount) };
}

/**
 * Update managed user details, permissions, role, and plan
 */
export function updateManagedUser(updatedUser: AppUser): { success: boolean; error?: string } {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  if (index === -1) return { success: false, error: 'Usuário não encontrado.' };

  const nextRole = updatedUser.role || users[index].role || 'membro';
  const nextPermissions: import('../types').UserPermissions = {
    ...(updatedUser.permissions || users[index].permissions || {
      canUploadDocs: true,
      canDeleteDocs: false,
      canExportData: false,
      canManageUsers: false,
      canViewMetrics: false,
    }),
    canResetAllData: nextRole === 'admin',
  };

  users[index] = {
    ...users[index],
    name: updatedUser.name,
    email: updatedUser.email,
    username: updatedUser.username || users[index].username,
    company: updatedUser.company,
    plan: updatedUser.plan,
    role: nextRole,
    status: updatedUser.status || users[index].status || 'ativo',
    permissions: nextPermissions,
  };
  saveUsers(users);

  const currentSession = getCurrentSession();
  if (currentSession && currentSession.id === updatedUser.id) {
    updateUserProfile(updatedUser);
  }
  return { success: true };
}

/**
 * Delete user from system (cannot delete superuser or protected accounts)
 */
export function deleteManagedUser(userId: string): { success: boolean; error?: string } {
  const users = getRegisteredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, error: 'Usuário não encontrado.' };
  if (target.isSuperuser || target.username === 'suporte') {
    return { success: false, error: 'Esta conta protegida não pode ser removida.' };
  }

  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);
  return { success: true };
}

/**
 * Toggle user status between 'ativo' and 'inativo'
 */
export function toggleUserStatus(userId: string): { success: boolean; newStatus?: import('../types').UserStatus; error?: string } {
  const users = getRegisteredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, error: 'Usuário não encontrado.' };

  const nextStatus: import('../types').UserStatus = target.status === 'inativo' ? 'ativo' : 'inativo';
  target.status = nextStatus;
  saveUsers(users);
  return { success: true, newStatus: nextStatus };
}

/**
 * Reset password for managed user
 */
export function resetManagedUserPassword(userId: string, newPass: string): { success: boolean; error?: string } {
  if (!newPass || newPass.trim().length < 5) {
    return { success: false, error: 'A senha deve conter no mínimo 5 caracteres.' };
  }
  const users = getRegisteredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, error: 'Usuário não encontrado.' };

  target.passwordHash = newPass.trim();
  saveUsers(users);
  return { success: true };
}

/**
 * Registration routine for creating a new user account
 */
export function registerUser(
  name: string,
  email: string,
  company: string,
  plan: 'Profissional' | 'Empresarial',
  password: string
): { success: boolean; user?: AppUser; error?: string } {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanCompany = company.trim() || 'Minha Empresa';
  const cleanPassword = password.trim();

  if (!cleanName) {
    return { success: false, error: 'O nome é obrigatório.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Forneça um endereço de e-mail válido.' };
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' };
  }

  const users = getRegisteredUsers();
  const exists = users.some((u) => u.email.toLowerCase() === cleanEmail);

  if (exists) {
    return {
      success: false,
      error: 'Já existe uma conta cadastrada com este e-mail.',
    };
  }

  const newAccount: UserAccount = {
    id: `usr_${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    company: cleanCompany,
    plan,
    role: 'membro',
    createdAt: new Date().toISOString(),
    passwordHash: cleanPassword,
  };

  const updatedUsers = [...users, newAccount];
  saveUsers(updatedUsers);

  const safe = sanitizeUser(newAccount);
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  } catch (err) {
    console.error('Could not store new session:', err);
  }

  return { success: true, user: safe };
}

/**
 * Updates an existing user's profile details
 */
export function updateUserProfile(updated: AppUser): void {
  const users = getRegisteredUsers();
  const index = users.findIndex((u) => u.id === updated.id);

  if (index !== -1) {
    users[index] = {
      ...users[index],
      name: updated.name,
      email: updated.email,
      company: updated.company,
      plan: updated.plan,
      role: updated.role || users[index].role,
    };
    saveUsers(users);
  }

  try {
    if (localStorage.getItem(SESSION_KEY)) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
    if (sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Failed to update session store:', err);
  }
}

/**
 * Logout routine: clears session storage
 */
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch (err) {
    console.error('Failed to logout:', err);
  }
}

/**
 * Simulated password reset routine
 */
export function requestPasswordReset(loginOrEmail: string): { success: boolean; message: string } {
  const clean = loginOrEmail.trim().toLowerCase();
  const users = getRegisteredUsers();
  const found = users.find(
    (u) =>
      u.email.toLowerCase() === clean ||
      (u.username && u.username.toLowerCase() === clean) ||
      (clean === 'suporte' && u.email === 'suporte@docufinder.com')
  );

  if (!found) {
    return {
      success: false,
      message: 'Nenhuma conta encontrada com o usuário ou e-mail informado.',
    };
  }

  return {
    success: true,
    message: `Se esta conta estiver cadastrada, as instruções para redefinição de senha foram enviadas para ${found.email}.`,
  };
}

/**
 * Valid authorization keys for triggering a system reset
 */
export const AUTHORIZED_RESET_PASSWORDS = ['autorizo_zerar', 'suporteabc'] as const;

/**
 * Checks whether a given user has authorization to clear/reset system data.
 * Strictly limited to:
 * 1. Superuser / Suporte account
 * 2. Administrator role ('admin' / 'administrador')
 */
export function canUserResetData(user: AppUser | null | undefined): boolean {
  if (!user) return false;
  if (user.isSuperuser || user.username === 'suporte') return true;
  if (user.role === 'admin' || user.username === 'administrador') return true;
  if (user.permissions?.canResetAllData === true) return true;
  return false;
}

/**
 * Validates the authorization password entered for resetting data:
 * Must match "autorizo_zerar" or "suporteabc".
 */
export function verifyResetAuthorizationPassword(password: string): boolean {
  if (!password) return false;
  const clean = password.trim();
  return clean === 'autorizo_zerar' || clean === 'suporteabc';
}

const SYSTEM_RESETS_LOG_KEY = 'docufinder_system_resets_log';

/**
 * Retrieves the audit trail of all executed system resets
 */
export function getSystemResetLogs(): import('../types').SystemResetLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYSTEM_RESETS_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Records an authorized system reset in the audit log
 */
export function recordSystemResetLog(entry: Omit<import('../types').SystemResetLog, 'id' | 'timestamp'>): import('../types').SystemResetLog {
  const logItem: import('../types').SystemResetLog = {
    ...entry,
    id: `reset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    try {
      const logs = getSystemResetLogs();
      logs.unshift(logItem);
      localStorage.setItem(SYSTEM_RESETS_LOG_KEY, JSON.stringify(logs.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save reset audit log:', e);
    }
  }

  return logItem;
}

