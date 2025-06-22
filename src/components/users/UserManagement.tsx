
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = 'student' | 'teacher' | 'coord' | 'admin';

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

interface UserManagementProps {
  userRole: string;
}

const UserManagement = ({ userRole }: UserManagementProps) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'student' as UserRole,
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role
          })
          .eq('id', editingUser.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso"
        });
      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              role: formData.role
            }
          }
        });

        if (authError) throw authError;
        
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({ full_name: '', email: '', role: 'student', password: '' });
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o usuário",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (user: UserData) => {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso"
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'all') return true;
    return user.role === activeTab;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'coord': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'coord': return 'Coordenador';
      case 'teacher': return 'Professor';
      case 'student': return 'Aluno';
      default: return role;
    }
  };

  const canManageUsers = userRole === 'admin';

  if (!canManageUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar usuários.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center p-8">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie professores, coordenadores, alunos e administradores
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingUser(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
              <DialogDescription>
                {editingUser ? 'Edite as informações do usuário' : 'Preencha os dados para criar um novo usuário'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!!editingUser}
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="role">Perfil</Label>
                <Select value={formData.role} onValueChange={(value: UserRole) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Aluno</SelectItem>
                    <SelectItem value="teacher">Professor</SelectItem>
                    <SelectItem value="coord">Coordenador</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingUser ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="admin">Administradores</TabsTrigger>
          <TabsTrigger value="coord">Coordenadores</TabsTrigger>
          <TabsTrigger value="teacher">Professores</TabsTrigger>
          <TabsTrigger value="student">Alunos</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === 'all' 
                    ? "Comece criando o primeiro usuário clicando no botão 'Novo Usuário'."
                    : `Não há ${getRoleLabel(activeTab)}s cadastrados ainda.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
