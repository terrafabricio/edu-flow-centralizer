
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, BookOpen, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClassData {
  id: string;
  name: string;
  year: number;
  coord_id?: string;
  coord_name?: string;
  student_count: number;
  created_at: string;
}

interface ClassManagementProps {
  userRole: string;
}

const ClassManagement = ({ userRole }: ClassManagementProps) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    coord_id: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchCoordinators();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          *,
          coord:profiles!classes_coord_id_fkey(full_name)
        `);

      if (error) throw error;

      // Count students for each class
      const classesWithCounts = await Promise.all(
        (data || []).map(async (cls) => {
          const { count } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return {
            ...cls,
            coord_name: cls.coord?.full_name || 'Sem coordenador',
            student_count: count || 0
          };
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordinators = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'coord');

      if (error) throw error;
      setCoordinators(data || []);
    } catch (error) {
      console.error('Erro ao carregar coordenadores:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingClass) {
        const { error } = await supabase
          .from('classes')
          .update(formData)
          .eq('id', editingClass.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Turma atualizada com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('classes')
          .insert([formData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Turma criada com sucesso"
        });
      }

      setIsDialogOpen(false);
      setEditingClass(null);
      setFormData({ name: '', year: new Date().getFullYear(), coord_id: '' });
      fetchClasses();
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a turma",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (classData: ClassData) => {
    setEditingClass(classData);
    setFormData({
      name: classData.name,
      year: classData.year,
      coord_id: classData.coord_id || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (classId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Turma excluída com sucesso"
      });
      
      fetchClasses();
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a turma",
        variant: "destructive"
      });
    }
  };

  const canManageClasses = ['admin', 'coord'].includes(userRole);

  if (loading) {
    return <div className="flex justify-center p-8">Carregando turmas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie as turmas da escola
          </p>
        </div>
        
        {canManageClasses && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingClass(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Turma
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingClass ? 'Editar Turma' : 'Nova Turma'}
                </DialogTitle>
                <DialogDescription>
                  {editingClass ? 'Edite as informações da turma' : 'Preencha os dados para criar uma nova turma'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Turma</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: 8º Ano A"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="year">Ano Letivo</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    min="2020"
                    max="2030"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="coord">Coordenador Responsável</Label>
                  <Select value={formData.coord_id} onValueChange={(value) => setFormData({...formData, coord_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um coordenador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem coordenador</SelectItem>
                      {coordinators.map((coord) => (
                        <SelectItem key={coord.id} value={coord.id}>
                          {coord.full_name}
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
                    {editingClass ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((classData) => (
          <Card key={classData.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{classData.name}</CardTitle>
                  <CardDescription>{classData.year}</CardDescription>
                </div>
                {canManageClasses && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(classData)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(classData.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-2" />
                  {classData.coord_name}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-2" />
                    {classData.student_count} alunos
                  </div>
                  <Badge variant="secondary">
                    {classData.year}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {classes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma turma encontrada</h3>
            <p className="text-muted-foreground text-center">
              {canManageClasses 
                ? "Comece criando sua primeira turma clicando no botão 'Nova Turma'."
                : "Não há turmas cadastradas no sistema ainda."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClassManagement;
