
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  School, 
  Settings, 
  LogOut, 
  Menu,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';

interface DashboardLayoutProps {
  user: any;
  profile: any;
  activeSection: string;
  onSectionChange: (section: string) => void;
  children: React.ReactNode;
}

const DashboardLayout = ({ user, profile, activeSection, onSectionChange, children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
      
      navigate('/auth');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  const getMenuItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
    ];

    switch (profile?.role) {
      case 'diretor':
        return [
          ...baseItems,
          { id: 'users', label: 'Usuários', icon: Users },
          { id: 'classes', label: 'Turmas', icon: School },
          { id: 'students', label: 'Estudantes', icon: GraduationCap },
          { id: 'reports', label: 'Relatórios', icon: Settings }
        ];
      case 'coordenador':
        return [
          ...baseItems,
          { id: 'classes', label: 'Turmas', icon: School },
          { id: 'students', label: 'Estudantes', icon: GraduationCap },
          { id: 'schedule', label: 'Horários', icon: Settings }
        ];
      case 'professor':
        return [
          ...baseItems,
          { id: 'classes', label: 'Minhas Turmas', icon: School },
          { id: 'grades', label: 'Notas', icon: GraduationCap },
          { id: 'schedule', label: 'Horários', icon: Settings }
        ];
      case 'aluno':
        return [
          ...baseItems,
          { id: 'grades', label: 'Notas', icon: GraduationCap },
          { id: 'schedule', label: 'Horários', icon: Settings },
          { id: 'subjects', label: 'Disciplinas', icon: School }
        ];
      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <School className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Sistema Escolar</h2>
            <p className="text-sm text-muted-foreground">Gestão Educacional</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${profile?.full_name}`} />
            <AvatarFallback>
              {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-sm">{profile?.full_name}</p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs capitalize">
                {profile?.role}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                onSectionChange(item.id);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <School className="h-6 w-6 text-primary" />
            <span className="font-semibold">Sistema Escolar</span>
          </div>
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
