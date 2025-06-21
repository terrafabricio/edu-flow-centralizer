
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardHome from '@/components/dashboard/DashboardHome';
import ClassManagement from '@/components/classes/ClassManagement';
import StudentManagement from '@/components/students/StudentManagement';
import UserManagement from '@/components/users/UserManagement';
import GradeManagement from '@/components/grades/GradeManagement';
import ReportsManagement from '@/components/reports/ReportsManagement';
import ScheduleManagement from '@/components/schedule/ScheduleManagement';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/auth');
          return;
        }

        setUser(session.user);
        
        // Buscar perfil do usuário
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Se o perfil não existir, criar um novo
        if (profileError && profileError.code === 'PGRST116') {
          console.log('Perfil não encontrado, criando novo perfil...');
          
          const newProfile = {
            id: session.user.id,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            role: (session.user.user_metadata?.role as 'diretor' | 'coordenador' | 'professor' | 'aluno') || 'aluno'
          };
          
          const { data: insertedProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();
            
          if (insertError) {
            throw insertError;
          }
          
          profileData = insertedProfile;
          
          toast({
            title: "Perfil criado",
            description: "Seu perfil foi criado com sucesso!"
          });
        } else if (profileError) {
          throw profileError;
        }
        
        setProfile(profileData);
      } catch (error: any) {
        console.error('Erro ao carregar sessão:', error);
        toast({
          title: "Erro",
          description: error.message || "Erro ao carregar dados do usuário",
          variant: "destructive"
        });
        
        // Se houver erro de autenticação, redirecionar para login
        if (error.message?.includes('JWT') || error.message?.includes('auth')) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        
        // Buscar ou criar perfil quando usuário faz login
        try {
          let { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            const newProfile = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as 'diretor' | 'coordenador' | 'professor' | 'aluno') || 'aluno'
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([newProfile])
              .select()
              .single();
              
            if (!insertError) {
              profileData = insertedProfile;
            }
          }
          
          setProfile(profileData);
        } catch (error) {
          console.error('Erro ao carregar perfil após login:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome profile={profile} />;
      case 'users':
        return <UserManagement userRole={profile?.role} />;
      case 'classes':
        return <ClassManagement userRole={profile?.role} />;
      case 'students':
        return <StudentManagement userRole={profile?.role} />;
      case 'grades':
        return <GradeManagement userRole={profile?.role} userId={user?.id} />;
      case 'reports':
        return <ReportsManagement userRole={profile?.role} />;
      case 'schedule':
        return <ScheduleManagement userRole={profile?.role} userId={user?.id} />;
      case 'subjects':
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Disciplinas</h2>
              <p className="text-muted-foreground">
                Esta seção ainda está sendo desenvolvida.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Em Desenvolvimento</h2>
              <p className="text-muted-foreground">
                Esta seção ainda está sendo desenvolvida.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout
      user={user}
      profile={profile}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
