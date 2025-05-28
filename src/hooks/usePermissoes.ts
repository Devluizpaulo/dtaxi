import { useMemo } from 'react';

interface User {
  uid: string;
  email: string;
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

type PermissionType = 
  | 'coordenadores:criar'
  | 'coordenadores:editar'
  | 'coordenadores:deletar'
  | 'documentos:criar'
  | 'documentos:editar'
  | 'documentos:deletar'
  | 'comunicados:criar'
  | 'comunicados:editar'
  | 'comunicados:deletar'
  | 'portarias:criar'
  | 'portarias:editar'
  | 'portarias:deletar';

const DEFAULT_PERMISSIONS: PermissionType[] = [
  'coordenadores:criar',
  'coordenadores:editar',
  'coordenadores:deletar',
  'documentos:criar',
  'documentos:editar',
  'documentos:deletar',
  'comunicados:criar',
  'comunicados:editar',
  'comunicados:deletar',
  'portarias:criar',
  'portarias:editar',
  'portarias:deletar'
];

export function usePermissoes(user: User | null) {
  return useMemo(() => {
    // Se não houver usuário, não tem permissão para nada
    if (!user) {
      return {
        temPermissao: (_perm: string) => false,
        permissoes: [] as PermissionType[]
      };
    }

    // Se o usuário tiver roles/permissions específicas, use-as
    if (user.permissions?.length) {
      return {
        temPermissao: (perm: string) => user.permissions?.includes(perm) || false,
        permissoes: user.permissions as PermissionType[]
      };
    }

    // Se o usuário for admin, tem todas as permissões
    if (user.roles?.includes('admin')) {
      return {
        temPermissao: (_perm: string) => true,
        permissoes: DEFAULT_PERMISSIONS
      };
    }

    // Por padrão, tem todas as permissões (temporário - você pode ajustar isso)
    return {
      temPermissao: (_perm: string) => true,
      permissoes: DEFAULT_PERMISSIONS
    };
  }, [user]);
} 