export interface AuthUser { email: string; plan: string; key: string; verified: boolean }

export const useAuth = () => useState<AuthUser | null>('auth-user', () => null)

export async function refreshAuth() {
  const res = await $fetch<{ user: AuthUser | null }>('/api/auth/me').catch(() => ({ user: null }))
  useAuth().value = res.user
  return res.user
}
