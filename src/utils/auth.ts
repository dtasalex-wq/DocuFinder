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
    createdAt: '2026-10-09T00:00:00.000Z',
    passwordHash: 'suporteabc',
  },
  {
    id: 'usr_1',
    name: 'Alex Silva',
    email: 'dtas.alex@gmail.com',
    company: 'DocuFinder Workspace',
    plan: 'Empresarial',
    role: 'admin',
    createdAt: '2026-01-15T10:00:00.000Z',
    passwordHash: 'dantas123',
  },
  {
    id: 'usr_2',
    name: 'Administrador DocuFinder',
    email: 'admin@docufinder.com',
    company: 'DocuFinder Enterprise',
    plan: 'Empresarial',
    role: 'admin',
    createdAt: '2026-02-01T08:30:00.000Z',
    passwordHash: 'admin123',
  },
  {
    id: 'usr_3',
    name: 'Mariana Costa',
    email: 'mariana.costa@empresa.com.br',
    company: 'Auditoria & Compliance Corp',
    plan: 'Profissional',
    role: 'analista',
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
        createdAt: '2026-10-09T00:00:00.000Z',
        passwordHash: 'suporteabc',
      });
    } else {
      users[superIndex].passwordHash = 'suporteabc';
      users[superIndex].username = 'suporte';
      users[superIndex].isSuperuser = true;
    }

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
    const superMatch = normalizedLogin === 'suporte' && (u.username === 'suporte' || u.email.startsWith('suporte@'));
    return emailMatch || usernameMatch || superMatch;
  });

  if (!found) {
    return {
      success: false,
      error: 'Usuário ou e-mail não encontrado. Verifique a digitação ou cadastre-se.',
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
