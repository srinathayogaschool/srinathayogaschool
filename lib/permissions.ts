export type Role = 'student' | 'teacher' | 'admin'

export const ROLES = {
  STUDENT: 'student' as const,
  TEACHER: 'teacher' as const,
  ADMIN: 'admin' as const,
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  student: 0,
  teacher: 1,
  admin: 2,
}

export function hasMinRole(userRole: Role | undefined | null, minRole: Role): boolean {
  if (!userRole) return false
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minRole]
}

export function isAdmin(role: Role | undefined | null): boolean {
  return role === ROLES.ADMIN
}

export function isTeacher(role: Role | undefined | null): boolean {
  return role === ROLES.TEACHER
}

export function isStudent(role: Role | undefined | null): boolean {
  return role === ROLES.STUDENT
}

export const PROTECTED_ROUTES: Record<string, Role[]> = {
  '/dashboard/admin': ['admin'],
  '/dashboard/admin/login': ['student', 'teacher', 'admin'],
  '/dashboard/teacher': ['teacher', 'admin'],
}

export function canAccessRoute(pathname: string, role: Role | undefined | null): boolean {
  const match = Object.entries(PROTECTED_ROUTES).find(([route]) =>
    pathname.startsWith(route)
  )
  if (!match) return true
  const [_, allowedRoles] = match
  return role ? allowedRoles.includes(role) : false
}
