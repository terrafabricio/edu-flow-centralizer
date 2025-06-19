
import React, { useState } from 'react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  Settings, 
  LogOut,
  School,
  UserCheck,
  ClipboardList
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  user: any;
  profile: any;
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardLayout = ({ user, profile, children, activeSection, onSectionChange }: DashboardLayoutProps) => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ];

    const roleSpecificItems = {
      diretor: [
        { id: 'users', label: 'Usuários', icon: UserCheck },
        { id: 'classes', label: 'Turmas', icon: School },
        { id: 'students', label: 'Estudantes', icon: GraduationCap },
        { id: 'teachers', label: 'Professores', icon: Users },
        { id: 'subjects', label: 'Disciplinas', icon: BookOpen },
        { id: 'reports', label: 'Relatórios', icon: FileText },
      ],
      coordenador: [
        { id: 'classes', label: 'Turmas', icon: School },
        { id: 'students', label: 'Estudantes', icon: GraduationCap },
        { id: 'teachers', label: 'Professores', icon: Users },
        { id: 'subjects', label: 'Disciplinas', icon: BookOpen },
        { id: 'schedule', label: 'Horários', icon: Calendar },
      ],
      professor: [
        { id: 'classes', label: 'Minhas Turmas', icon: School },
        { id: 'students', label: 'Meus Alunos', icon: GraduationCap },
        { id: 'grades', label: 'Notas', icon: ClipboardList },
        { id: 'schedule', label: 'Horários', icon: Calendar },
      ],
      aluno: [
        { id: 'grades', label: 'Minhas Notas', icon: ClipboardList },
        { id: 'subjects', label: 'Disciplinas', icon: BookOpen },
        { id: 'schedule', label: 'Horários', icon: Calendar },
      ],
    };

    return [
      ...baseItems,
      ...(roleSpecificItems[profile?.role as keyof typeof roleSpecificItems] || []),
      { id: 'settings', label: 'Configurações', icon: Settings }
    ];
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <School className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Sistema Escolar</h2>
                <p className="text-xs text-muted-foreground capitalize">
                  {profile?.role || 'Usuário'}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {getMenuItems().map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex flex-1 items-center justify-end space-x-4">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${profile?.full_name}`} />
                  <AvatarFallback>
                    {profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
