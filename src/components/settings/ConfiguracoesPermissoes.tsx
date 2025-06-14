import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useFirestore } from '@/hooks/useFirestore';
import { toast } from '@/hooks/use-toast';
import { auth, db, storage } from '@/lib/firebase';
import { createUserWithEmailAndPassword, updatePassword, fetchSignInMethodsForEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const PERMISSOES = [
  { key: 'comunicados:criar', label: 'Criar Comunicado' },
  { key: 'comunicados:editar', label: 'Editar Comunicado' },
  { key: 'comunicados:deletar', label: 'Deletar Comunicado' },
  { key: 'documentos:visualizar', label: 'Visualizar Documentos' },
  { key: 'documentos:criar', label: 'Criar Documento' },
  { key: 'documentos:editar', label: 'Editar Documento' },
  { key: 'portarias:visualizar', label: 'Visualizar Portaria' },
  { key: 'portarias:criar', label: 'Criar Portaria' },
  { key: 'portarias:editar', label: 'Editar Portaria' },
  { key: 'portarias:deletar', label: 'Deletar Portaria' },
  { key: 'coordenadores:criar', label: 'Criar Coordenador' },
  { key: 'coordenadores:editar', label: 'Editar Coordenador' },
  { key: 'coordenadores:deletar', label: 'Excluir Coordenador' },
];

const defaultConfig = {
  nomePainel: 'D-Taxi Control Hub',
  corPrimaria: '#22c55e',
  modoEscuro: false,
  notificacoes: true,
  idioma: 'pt-BR',
  popupPesquisa: {
    ativo: true,
    tempoExibicao: 5000,
    frequencia: 'primeira_visita', // 'primeira_visita', 'sempre', 'nunca'
    titulo: 'Ajude-nos a melhorar!',
    descricao: 'Participe da nossa pesquisa de satisfação e nos ajude a melhorar ainda mais nossos serviços.',
  },
};

const defaultUser = {
  nome: '',
  email: '',
  role: 'user',
  permissoes: [],
  senha: '',
  emailRecuperacao: '',
  avatarUrl: '',
};

const ConfiguracoesPermissoes = () => {
  // Configurações gerais do painel
  const { data: configData = [defaultConfig], update: updateConfig, add: addConfig } = useFirestore<any>({ collectionName: 'configuracoes', orderByField: 'nomePainel' });
  const [config, setConfig] = useState<any>(defaultConfig);
  const [configId, setConfigId] = useState<string | null>(null);

  // Usuários
  const { data: usuarios = [], update: updateUsuario, add: addUsuario, remove: removeUsuario, loading } = useFirestore<any>({ collectionName: 'users', orderByField: 'nome' });
  const [modalUser, setModalUser] = useState<any | null>(null);
  const [modalPerms, setModalPerms] = useState<string[]>([]);
  const [editUser, setEditUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState<any>(defaultUser);
  const [showUserModal, setShowUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState('geral');

  useEffect(() => {
    if (configData && configData.length > 0) {
      setConfig(configData[0]);
      setConfigId(configData[0].id);
    }
  }, [configData]);

  // Modal de permissões
  const openPermModal = (user: any) => {
    setModalUser(user);
    setModalPerms(user.permissoes || []);
  };
  const closePermModal = () => {
    setModalUser(null);
    setModalPerms([]);
  };
  const togglePerm = (perm: string) => {
    setModalPerms(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };
  const allPerms = PERMISSOES.map(p => p.key);
  const allActive = allPerms.every(p => modalPerms.includes(p));
  const handleToggleAll = () => {
    setModalPerms(allActive ? [] : allPerms);
  };
  const handleSalvarPerm = async () => {
    if (!modalUser) return;
    await updateUsuario(modalUser.id, { ...modalUser, permissoes: modalPerms });
    toast({ title: 'Permissões atualizadas!' });
    closePermModal();
  };

  // Gerenciamento de usuário
  const openUserModal = (user?: any) => {
    if (user) {
      setEditUser(user);
      setUserForm({
        nome: user.nome,
        email: user.email,
        role: user.role,
        senha: user.senha || '',
        emailRecuperacao: user.emailRecuperacao || '',
        avatarUrl: user.avatarUrl || '',
      });
    } else {
      setEditUser(null);
      setUserForm(defaultUser);
    }
    setShowUserModal(true);
  };
  const closeUserModal = () => {
    setShowUserModal(false);
    setEditUser(null);
    setUserForm(defaultUser);
  };
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUserForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const storageRef = ref(storage, `avatars/${userForm.email}_${Date.now()}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setUserForm((prev: any) => ({ ...prev, avatarUrl: url }));
    toast({ title: 'Avatar atualizado!' });
  };
  const handleSalvarUser = async () => {
    if (!userForm.nome || !userForm.email) {
      toast({ title: 'Preencha nome e email.' });
      return;
    }
    if (!userForm.senha || userForm.senha.length < 6) {
      toast({ title: 'A senha deve ter pelo menos 6 dígitos.' });
      return;
    }
    if ((userForm.role === 'admin' || userForm.role === 'dev') && !userForm.emailRecuperacao) {
      toast({ title: 'Informe o email de recuperação.' });
      return;
    }
    try {
      if (editUser) {
        await updateUsuario(editUser.id, { ...editUser, ...userForm });
        if (auth.currentUser && auth.currentUser.email === userForm.email && userForm.senha.length >= 6) {
          await updatePassword(auth.currentUser, userForm.senha);
          toast({ title: 'Senha atualizada no Auth!' });
        }
        toast({ title: 'Usuário atualizado!' });
      } else {
        const methods = await fetchSignInMethodsForEmail(auth, userForm.email);
        let uid;
        if (methods.length === 0) {
          const cred = await createUserWithEmailAndPassword(auth, userForm.email, userForm.senha);
          uid = cred.user.uid;
        } else {
          const cred = await signInWithEmailAndPassword(auth, userForm.email, userForm.senha);
          uid = cred.user.uid;
        }
        await setDoc(doc(db, 'users', uid), { ...userForm, permissoes: userForm.permissoes || [] });
        toast({ title: 'Usuário criado!' });
      }
    } catch (err: any) {
      toast({ title: 'Erro ao criar/atualizar usuário', description: err.message });
    }
    closeUserModal();
  };
  const handleExcluirUser = async (id: string) => {
    await removeUsuario(id);
    toast({ title: 'Usuário excluído!' });
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target instanceof HTMLInputElement) ? e.target.checked : undefined;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSalvarConfig = async () => {
    if (configId) {
      await updateConfig(configId, config);
    } else {
      await addConfig(config);
    }
    toast({ title: 'Configurações do painel salvas!' });
  };

  // Preferências do sistema (exemplo)
  const handlePreferenciasChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target instanceof HTMLInputElement) ? e.target.checked : undefined;
    setConfig((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  const handleSalvarPreferencias = handleSalvarConfig;

  return (
    <div className="max-w-5xl mx-auto py-8 px-2">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Painel</CardTitle>
          <CardDescription>Gerencie preferências, usuários e permissões do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-4 overflow-x-auto whitespace-nowrap flex gap-2">
              <TabsTrigger value="geral">Geral</TabsTrigger>
              <TabsTrigger value="usuarios">Usuários</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões</TabsTrigger>
              <TabsTrigger value="preferencias">Preferências</TabsTrigger>
            </TabsList>
            {/* Aba Geral */}
            <TabsContent value="geral" className="space-y-6">
              <div className="max-w-lg">
                <label className="block text-sm font-medium mb-1">Nome do Painel</label>
                <input
                  type="text"
                  name="nomePainel"
                  value={config.nomePainel}
                  onChange={handleConfigChange}
                  className="w-full border rounded px-3 py-2"
                />
                <label className="block text-sm font-medium mb-1 mt-4">Cor Primária</label>
                <input
                  type="color"
                  name="corPrimaria"
                  value={config.corPrimaria}
                  onChange={handleConfigChange}
                  className="w-12 h-8 p-0 border-none bg-transparent"
                />
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    name="modoEscuro"
                    checked={!!config.modoEscuro}
                    onChange={handleConfigChange}
                    id="modoEscuro"
                  />
                  <label htmlFor="modoEscuro" className="text-sm font-medium">Modo Escuro</label>
                </div>
                <Button onClick={handleSalvarConfig} className="mt-4">Salvar Configurações</Button>
              </div>
            </TabsContent>
            {/* Aba Usuários */}
            <TabsContent value="usuarios" className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button size="sm" onClick={() => openUserModal()}>Novo Usuário</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-right p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(usuario => (
                      <tr key={usuario.id} className="border-b">
                        <td className="p-2 font-medium">{usuario.nome}</td>
                        <td className="p-2">{usuario.email}</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded bg-gray-200 text-xs">{usuario.role}</span>
                        </td>
                        <td className="p-2 text-right space-x-2">
                          <Button size="sm" variant="ghost" onClick={() => openUserModal(usuario)}>Editar</Button>
                          {usuario.role !== 'admin' && usuario.role !== 'dev' && (
                            <Button size="sm" variant="destructive" onClick={() => handleExcluirUser(usuario.id)}>Excluir</Button>
                          )}
                          {usuario.role !== 'admin' && usuario.role !== 'dev' && (
                            <Button size="sm" onClick={() => openPermModal(usuario)}>
                              Permissões
                            </Button>
                          )}
                          {(usuario.role === 'admin' || usuario.role === 'dev') && (
                            <span className="text-green-700">Acesso Ilimitado</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            {/* Aba Permissões */}
            <TabsContent value="permissoes" className="space-y-6">
              <div className="max-w-lg">
                <h3 className="text-lg font-semibold mb-2">Permissões disponíveis</h3>
                <ul className="list-disc pl-5">
                  {PERMISSOES.map(perm => (
                    <li key={perm.key}>{perm.label} <span className="text-xs text-gray-400">({perm.key})</span></li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground mt-4">Permissões são atribuídas individualmente a cada usuário na aba "Usuários".</p>
              </div>
            </TabsContent>
            {/* Aba Preferências */}
            <TabsContent value="preferencias" className="space-y-6">
              <div className="max-w-lg">
                <label className="block text-sm font-medium mb-1">Idioma</label>
                <select
                  name="idioma"
                  value={config.idioma}
                  onChange={handlePreferenciasChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">Inglês (EUA)</option>
                </select>
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    name="notificacoes"
                    checked={!!config.notificacoes}
                    onChange={handlePreferenciasChange}
                    id="notificacoes"
                  />
                  <label htmlFor="notificacoes" className="text-sm font-medium">Receber notificações do sistema</label>
                </div>
                
                {/* Configurações do Popup de Pesquisa */}
                <div className="border-t pt-4 mt-6">
                  <h4 className="text-lg font-semibold mb-3">Popup de Pesquisa de Satisfação</h4>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      name="popupPesquisa.ativo"
                      checked={!!config.popupPesquisa?.ativo}
                      onChange={(e) => {
                        setConfig(prev => ({
                          ...prev,
                          popupPesquisa: {
                            ...prev.popupPesquisa,
                            ativo: e.target.checked
                          }
                        }));
                      }}
                      id="popupAtivo"
                    />
                    <label htmlFor="popupAtivo" className="text-sm font-medium">Ativar popup de pesquisa</label>
                  </div>
                  
                  {config.popupPesquisa?.ativo && (
                    <div className="space-y-4 ml-6">
                      <div>
                        <label className="block text-sm font-medium mb-1">Frequência de exibição</label>
                        <select
                          value={config.popupPesquisa?.frequencia || 'primeira_visita'}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              popupPesquisa: {
                                ...prev.popupPesquisa,
                                frequencia: e.target.value
                              }
                            }));
                          }}
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="primeira_visita">Apenas na primeira visita</option>
                          <option value="sempre">Sempre que acessar</option>
                          <option value="nunca">Nunca exibir</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Tempo para exibição (segundos)</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={(config.popupPesquisa?.tempoExibicao || 5000) / 1000}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              popupPesquisa: {
                                ...prev.popupPesquisa,
                                tempoExibicao: parseInt(e.target.value) * 1000
                              }
                            }));
                          }}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Título do popup</label>
                        <input
                          type="text"
                          value={config.popupPesquisa?.titulo || ''}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              popupPesquisa: {
                                ...prev.popupPesquisa,
                                titulo: e.target.value
                              }
                            }));
                          }}
                          className="w-full border rounded px-3 py-2"
                          placeholder="Título do popup"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Descrição do popup</label>
                        <textarea
                          value={config.popupPesquisa?.descricao || ''}
                          onChange={(e) => {
                            setConfig(prev => ({
                              ...prev,
                              popupPesquisa: {
                                ...prev.popupPesquisa,
                                descricao: e.target.value
                              }
                            }));
                          }}
                          className="w-full border rounded px-3 py-2 h-20 resize-none"
                          placeholder="Descrição do popup"
                        />
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Nota:</strong> Para aplicar as mudanças no popup, os usuários precisarão limpar o cache do navegador ou acessar em modo anônimo.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button onClick={handleSalvarPreferencias} className="mt-4">Salvar Preferências</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {/* Modal de Usuário */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={closeUserModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4">{editUser ? 'Editar Usuário' : 'Novo Usuário'}</h3>
            <div className="space-y-3">
              <div className="flex flex-col items-center gap-2">
                <label className="block text-sm font-medium mb-1">Avatar</label>
                {userForm.avatarUrl && (
                  <img src={userForm.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
                )}
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={userForm.nome}
                  onChange={handleUserFormChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={userForm.email}
                  onChange={handleUserFormChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha (mínimo 6 dígitos)</label>
                <input
                  type="password"
                  name="senha"
                  value={userForm.senha}
                  onChange={handleUserFormChange}
                  className="w-full border rounded px-3 py-2"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleUserFormChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Administrativo</option>
                  <option value="dev">DEV</option>
                </select>
              </div>
              {(userForm.role === 'admin' || userForm.role === 'dev') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Email de Recuperação</label>
                  <input
                    type="email"
                    name="emailRecuperacao"
                    value={userForm.emailRecuperacao}
                    onChange={handleUserFormChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              )}
              <Button className="mt-2 w-full" onClick={handleSalvarUser}>{editUser ? 'Salvar' : 'Criar'}</Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Permissões */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500" onClick={closePermModal}>&times;</button>
            <h3 className="text-xl font-bold mb-4">Permissões de {modalUser.nome}</h3>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={allActive}
                onChange={handleToggleAll}
                id="toggleAllPerms"
              />
              <label htmlFor="toggleAllPerms" className="text-sm font-medium">Ativar/Desativar todas as permissões</label>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {PERMISSOES.map(perm => (
                <label key={perm.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={modalPerms.includes(perm.key)}
                    onChange={() => togglePerm(perm.key)}
                  />
                  <span>{perm.label}</span>
                </label>
              ))}
            </div>
            <Button className="mt-4 w-full" onClick={handleSalvarPerm}>Salvar Permissões</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesPermissoes;