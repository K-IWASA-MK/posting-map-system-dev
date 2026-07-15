export type Permission = 'READ' | 'WRITE' | 'DELETE' | 'EXPORT' | 'ADMIN';

export const Permission = {
  READ: 'READ' as Permission,
  WRITE: 'WRITE' as Permission,
  DELETE: 'DELETE' as Permission,
  EXPORT: 'EXPORT' as Permission,
  ADMIN: 'ADMIN' as Permission
};
