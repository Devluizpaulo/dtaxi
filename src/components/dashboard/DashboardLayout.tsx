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
import { Link, Outlet, useLocation } from 'react-router-dom';
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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/dashboard/ModeToggle';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const DashboardLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

const DashboardSidebar = () => {
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
    },
    {
      title: 'Pesq. Satisfação',
      icon: SmilePlus,
      path: '/dashboard/satisfacao',
    },
    {
      title: 'Mensagens',
      icon: MessageSquare,
      path: '/dashboard/mensagens',
    },
    {
      title: 'Coordenação',
      icon: ClipboardList,
      path: '/dashboard/coordenacao',
    },
    {
      title: 'Elogios Motoristas',
      icon: SendHorizontal,
      path: '/dashboard/motorista-elogios',
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/dashboard/configuracoes',
    },
  ];

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <div className="flex items-center pl-4 gap-2 py-4">
          <img
            src="/lovable-uploads/edee2f14-becc-4974-8b85-8255bf4a9484.png"
            alt="D-TAXI Logo"
            className="h-10"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    className={isActive(item.path) ? "bg-accent text-accent-foreground" : ""}
                    asChild
                  >
                    <Link
                      to={item.path}
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (isMobile) setOpenMobile(false);
                      }}
                    >
                      <item.icon size={20} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-4 py-4">
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-2">
            <LogOut size={20} />
            <span>Sair</span>
          </Link>
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

const DashboardHeader = () => {
  const { user, loading } = useAuth();
  const [nome, setNome] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchNome = async () => {
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
    fetchNome();
  }, [user]);
  return (
    <header className="border-b bg-background h-14 flex items-center justify-between px-6">
      <SidebarTrigger />
      <div className="flex items-center gap-4">
        <span className="font-medium">
          {loading ? 'Carregando...' : nome || user?.email || 'Usuário'}
        </span>
        <Avatar>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={nome || 'User'} />
          ) : (
            <AvatarImage src="https://github.com/shadcn.png" alt={nome || 'User'} />
          )}
          <AvatarFallback>{(nome || user?.email || 'U').slice(0,2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default DashboardLayout;
