import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  SmilePlus,
  MessageSquare,
  UserCog,
  ClipboardList,
  SendHorizontal,
  Bell,
  Search,
  Home,
  ChevronRight,
  Wifi,
  WifiOff,
  Keyboard,
  RefreshCw,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/dashboard/ModeToggle';
import { useAuth } from '@/hooks/useAuth';
import { usePermissoes } from '@/hooks/usePermissoes';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Interfaces e tipos
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  shortcut?: string;
}

const DashboardLayout = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const { toast } = useToast();

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
      toast({
        title: "Conexão restaurada",
        description: "Você está online novamente.",
        variant: "success",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Conexão perdida",
        description: "Você está offline. Algumas funcionalidades podem não estar disponíveis.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader isOnline={isOnline} lastSync={lastSync} />
          <BreadcrumbNavigation />
          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <GlobalShortcuts />
    </SidebarProvider>
  );
};

const DashboardSidebar = () => {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { user } = useAuth();
  const { temPermissao } = usePermissoes(user);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isActive = (path: string) => location.pathname === path;

  // Monitorar notificações em tempo real
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Notification[];
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const menuGroups = [
    {
      label: 'Principal',
      items: [
        {
          title: 'Dashboard',
          icon: LayoutDashboard,
          path: '/dashboard',
          badge: null,
        },
        {
          title: 'Mensagens',
          icon: MessageSquare,
          path: '/dashboard/mensagens',
          badge: unreadCount > 0 ? unreadCount : null,
        },
      ]
    },
    {
      label: 'Gestão',
      items: [
        {
          title: 'Pesq. Satisfação',
          icon: SmilePlus,
          path: '/dashboard/satisfacao',
          badge: null,
        },
        {
          title: 'Coordenação',
          icon: ClipboardList,
          path: '/dashboard/coordenacao',
          badge: null,
          permission: 'coordenadores:criar',
        },
        {
          title: 'Elogios Motoristas',
          icon: SendHorizontal,
          path: '/dashboard/motorista-elogios',
          badge: null,
        },
      ]
    },
    {
      label: 'Sistema',
      items: [
        {
          title: 'Configurações',
          icon: Settings,
          path: '/dashboard/configuracoes',
          badge: null,
        },
      ]
    }
  ];

  const filteredMenuGroups = menuGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      !item.permission || temPermissao(item.permission)
    )
  })).filter(group => group.items.length > 0);

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="flex items-center pl-4 gap-2 py-4">
          <img
            src="/lovable-uploads/edee2f14-becc-4974-8b85-8255bf4a9484.png"
            alt="D-TAXI Logo"
            className="h-10"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">D-TAXI</span>
            <span className="text-xs text-muted-foreground">Control Hub</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredMenuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4 py-2">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      className={isActive(item.path) ? "bg-accent text-accent-foreground" : ""}
                      asChild
                    >
                      <Link
                        to={item.path}
                        className="flex items-center gap-2 justify-between w-full"
                        onClick={() => {
                          if (isMobile) setOpenMobile(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon size={20} />
                          <span>{item.title}</span>
                        </div>
                        {item.badge && (
                          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {item.badge > 99 ? '99+' : item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-2 text-sm hover:text-foreground transition-colors">
            <LogOut size={16} />
            <span>Sair</span>
          </Link>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

const DashboardHeader = ({ isOnline, lastSync }: { isOnline: boolean; lastSync: Date }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          setNome(snap.data().nome || null);
          setAvatarUrl(snap.data().avatarUrl || null);
        } else {
          setNome(null);
          setAvatarUrl(null);
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Monitorar notificações
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as Notification[];
      
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}min atrás`;
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <header className="border-b bg-background h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isOnline ? (
            <div className="flex items-center gap-1">
              <Wifi size={14} className="text-green-500" />
              <span>Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <WifiOff size={14} className="text-red-500" />
              <span>Offline</span>
            </div>
          )}
          <span className="text-xs">•</span>
          <span className="text-xs">Última sync: {formatLastSync(lastSync)}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-6 w-6 p-0"
          >
            <RefreshCw size={12} />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Busca rápida */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2"
        >
          <Search size={16} />
          <span className="hidden md:inline">Buscar...</span>
          <kbd className="hidden md:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>

        {/* Notificações */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell size={16} />
              {unreadNotifications.length > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                  <div className="flex items-center gap-2 w-full">
                    <div className={`w-2 h-2 rounded-full ${
                      notification.type === 'error' ? 'bg-red-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'success' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="font-medium text-sm">{notification.title}</span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full ml-auto" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatLastSync(notification.timestamp)}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
              <div className="flex flex-col items-end text-right">
                <span className="text-sm font-medium">
                  {loading ? 'Carregando...' : nome || user?.email || 'Usuário'}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <Avatar className="h-8 w-8">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={nome || 'User'} />
                ) : (
                  <AvatarImage src="https://github.com/shadcn.png" alt={nome || 'User'} />
                )}
                <AvatarFallback className="text-xs">
                  {(nome || user?.email || 'U').slice(0,2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/configuracoes')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
              <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowSearch(true)}>
              <Keyboard className="mr-2 h-4 w-4" />
              <span>Atalhos</span>
              <DropdownMenuShortcut>⌘/</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/')}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog de busca */}
      <CommandDialog open={showSearch} onOpenChange={setShowSearch}>
        <CommandInput placeholder="Digite um comando ou busque..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Navegação">
            <CommandItem onSelect={() => { navigate('/dashboard'); setShowSearch(false); }}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/mensagens'); setShowSearch(false); }}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>Mensagens</span>
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/satisfacao'); setShowSearch(false); }}>
              <SmilePlus className="mr-2 h-4 w-4" />
              <span>Pesquisa de Satisfação</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Ações">
            <CommandItem onSelect={() => { handleRefresh(); setShowSearch(false); }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Atualizar página</span>
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/dashboard/configuracoes'); setShowSearch(false); }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

// Componente de navegação breadcrumb
const BreadcrumbNavigation = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  const getBreadcrumbItems = () => {
    const items = [{ label: 'Início', path: '/' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = segment;
      switch (segment) {
        case 'dashboard':
          label = index === 0 ? 'Dashboard' : segment;
          break;
        case 'satisfacao':
          label = 'Pesquisa de Satisfação';
          break;
        case 'mensagens':
          label = 'Mensagens';
          break;
        case 'coordenacao':
          label = 'Coordenação';
          break;
        case 'motorista-elogios':
          label = 'Elogios Motoristas';
          break;
        case 'configuracoes':
          label = 'Configurações';
          break;
        default:
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      items.push({ label, path: currentPath });
    });
    
    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();
  
  if (breadcrumbItems.length <= 2) return null;

  return (
    <div className="border-b bg-muted/30 px-6 py-2">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <BreadcrumbItem>
                {index === breadcrumbItems.length - 1 ? (
                  <BreadcrumbPage className="font-medium">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.path} className="hover:text-foreground transition-colors">
                      {index === 0 ? <Home size={14} /> : item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbItems.length - 1 && (
                <BreadcrumbSeparator>
                  <ChevronRight size={14} />
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

// Componente de atalhos globais
const GlobalShortcuts = () => {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K para busca
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // Cmd/Ctrl + , para configurações
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        navigate('/dashboard/configuracoes');
      }
      
      // Shift + Cmd/Ctrl + Q para sair
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Q') {
        e.preventDefault();
        navigate('/');
      }
      
      // Cmd/Ctrl + / para ajuda
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // Atalhos numéricos para navegação rápida
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        const shortcuts = [
          '/dashboard',
          '/dashboard/mensagens',
          '/dashboard/satisfacao',
          '/dashboard/coordenacao',
          '/dashboard/motorista-elogios',
          '/dashboard/configuracoes'
        ];
        const index = parseInt(e.key) - 1;
        if (shortcuts[index]) {
          navigate(shortcuts[index]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <CommandDialog open={showSearch} onOpenChange={setShowSearch}>
      <CommandInput placeholder="Digite um comando ou busque..." />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        <CommandGroup heading="Navegação Rápida">
          <CommandItem onSelect={() => { navigate('/dashboard'); setShowSearch(false); }}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { navigate('/dashboard/mensagens'); setShowSearch(false); }}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Mensagens</span>
            <DropdownMenuShortcut>⌘2</DropdownMenuShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { navigate('/dashboard/satisfacao'); setShowSearch(false); }}>
            <SmilePlus className="mr-2 h-4 w-4" />
            <span>Pesquisa de Satisfação</span>
            <DropdownMenuShortcut>⌘3</DropdownMenuShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { navigate('/dashboard/coordenacao'); setShowSearch(false); }}>
            <ClipboardList className="mr-2 h-4 w-4" />
            <span>Coordenação</span>
            <DropdownMenuShortcut>⌘4</DropdownMenuShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { navigate('/dashboard/motorista-elogios'); setShowSearch(false); }}>
            <SendHorizontal className="mr-2 h-4 w-4" />
            <span>Elogios Motoristas</span>
            <DropdownMenuShortcut>⌘5</DropdownMenuShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { navigate('/dashboard/configuracoes'); setShowSearch(false); }}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Configurações</span>
            <DropdownMenuShortcut>⌘6</DropdownMenuShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ações">
          <CommandItem onSelect={() => { window.location.reload(); setShowSearch(false); }}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Atualizar página</span>
            <DropdownMenuShortcut>F5</DropdownMenuShortcut>
          </CommandItem>
          <CommandItem onSelect={() => { navigate('/'); setShowSearch(false); }}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair do sistema</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Ajuda">
          <CommandItem>
            <Keyboard className="mr-2 h-4 w-4" />
            <span>Atalhos de teclado</span>
            <DropdownMenuShortcut>⌘/</DropdownMenuShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default DashboardLayout;
