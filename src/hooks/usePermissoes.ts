import { useMemo } from 'react';

export function usePermissoes(user: any) {
  // Permissões liberadas para todos os usuários (sem restrição)
  return useMemo(() => ({
    temPermissao: (_perm: string) => true,
    permissoes: 'all',
  }), [user]);
} 