export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'superadmin' | string;
}

export const getCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem('pjaa_admin_user');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const isSuperAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'superadmin';
};
