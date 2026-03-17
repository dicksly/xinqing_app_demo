export function getAdminEntryTarget(isAuthenticated) {
  return isAuthenticated ? '/admin/content' : '/admin/login'
}
