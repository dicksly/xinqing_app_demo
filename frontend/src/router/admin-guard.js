export function canAccessAdminRoute(path, adminStore) {
  if (!path.startsWith('/admin/content')) {
    return true
  }

  return adminStore.isAuthenticated ? true : '/admin/login'
}
