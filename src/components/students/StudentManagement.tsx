
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, User, Edit, Trash2, Search, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  enrollment_number: string;
  class_id?: string;
  class_name?: string;
  created_at: string;
}

interface StudentManagementProps {
  userRole: string;
}

const StudentManagement = ({ userRole }: StudentManagementProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    enrollment_number: '',
    class_id: ''
  });

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    try {
      // Buscar perfis de estudantes
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (profilesError) throw profilesError;

      // Para cada estudante, buscar a turma
      const studentIds = profilesData?.map(p => p.id) || [];
      
      if (studentIds.length === 0) {
        setStudents([]);
        return;
      }

      // Buscar relações estudante-turma
      const { data: studentClassData, error: studentClassError } = await supabase
        .from('student_classes')
        .select('student_id, class_id')
        .in('student_id', studentIds);

      if (studentClassError) {
        console.error('Erro ao buscar turmas dos estudantes:', studentClassError);
      }

      // Buscar nomes das turmas
      const classIds = studentClassData?.map(sc => sc.class_id) || [];
      let classData: any[] = [];
      
      if (classIds.length > 0) {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('id, name')
          .in('id', classIds);

        if (classesError) {
          console.error('Erro ao buscar turmas:', classesError);
        } else {
          classData = classesData || [];
        }
      }

      // Combinar os dados
      const formattedStudents = profilesData?.map(profile => {
        const studentClass = studentClassData?.find(sc => sc.student_id === profile.id);
        const classInfo = classData.find(c => c.id === studentClass?.class_id);
        
        return {
          ...profile,
          enrollment_number: `EST${Date.now()}${Math.random().toString(36).substr(2, 3)}`,
          class_name: classInfo?.name || 'Sem turma',
          class_id: studentClass?.class_id || ''
        };
      }) || [];

      setStudents(formattedStudents);
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os estudantes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, year')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const enrollmentNumber = formData.enrollment_number || `EST${Date.now()}`;
      
      if (editingStudent) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            email: formData.email
          })
          .eq('id', editingStudent.id);

        if (error) throw error;

        if (formData.class_id) {
          await supabase
            .from('student_classes')
            .upsert({
              student_id: editingStudent.id,
              class_id: formData.class_id
            });
        }
        
        toast({
          title: "Sucesso",
          description: "Estudante atualizado com sucesso"
        });
      } else {
        // Criar novo usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: 'temp123456', // Senha temporária
          options: {
            data: {
              full_name: formData.full_name,
              role: 'student'
            }
          }
        });

        if (authError) throw authError;

        if (authData.user && formData.class_id) {
          await supabase
            .from('student_classes')
            .insert({
              student_id: authData.user.id,
              class_id: formData.class_id
            });
        }
        
        toast({
          title: "Sucesso",
          description: "Estudante criado com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingStudent(null);
      setFormData({ full_name: '', email: '', phone: '', enrollment_number: '', class_id: '' });
      fetchStudents();
    } catch (error) {
      console.error('Erro ao salvar estudante:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o estudante",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      full_name: student.full_name,
      email: student.email,
      phone: '',
      enrollment_number: student.enrollment_number,
      class_id: student.class_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este estudante?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(studentId);
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Estudante excluído com sucesso"
      });
      
      fetchStudents();
    } catch (error) {
      console.error('Erro ao excluir estudante:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o estudante",
        variant: "destructive"
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canManageStudents = ['admin', 'coord'].includes(userRole);

  if (loading) {
    return <div className="flex justify-center p-8">Carregando estudantes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Estudantes</h1>
          <p className="text-muted-foreground">
            Gerencie os estudantes da escola
          </p>
        </div>
        
        {canManageStudents && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingStudent(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Estudante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? 'Editar Estudante' : 'Novo Estudante'}
                </DialogTitle>
                <DialogDescription>
                  {editingStudent ? 'Edite as informações do estudante' : 'Preencha os dados para cadastrar um novo estudante'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Nome Completo</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Nome completo do estudante"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="enrollment_number">Matrícula</Label>
                    <Input
                      id="enrollment_number"
                      value={formData.enrollment_number}
                      onChange={(e) => setFormData({...formData, enrollment_number: e.target.value})}
                      placeholder="Número da matrícula"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="class">Turma</Label>
                  <Select value={formData.class_id} onValueChange={(value) => setFormData({...formData, class_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem turma</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - {cls.year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingStudent ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, e-mail ou matrícula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${student.full_name}`} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{student.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Matrícula: {student.enrollment_number}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {student.class_name}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {canManageStudents && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(student)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(student.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Nenhum estudante encontrado' : 'Nenhum estudante cadastrado'}
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm 
                ? `Não encontramos estudantes que correspondam a "${searchTerm}".`
                : canManageStudents 
                  ? "Comece cadastrando seu primeiro estudante clicando no botão 'Novo Estudante'."
                  : "Não há estudantes cadastrados no sistema ainda."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentManagement;
