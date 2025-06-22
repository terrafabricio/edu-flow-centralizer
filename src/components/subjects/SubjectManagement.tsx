
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  description?: string;
  workload_hours: number;
  created_at: string;
}

interface SubjectManagementProps {
  userRole?: string;
}

const SubjectManagement = ({ userRole }: SubjectManagementProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workload_hours: 0
  });
  const { toast } = useToast();

  const canManage = userRole === 'diretor' || userRole === 'coordenador';

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar disciplinas: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canManage) {
      toast({
        title: "Erro",
        description: "Você não tem permissão para gerenciar disciplinas",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingSubject) {
        const { error } = await supabase
          .from('subjects')
          .update({
            name: formData.name,
            description: formData.description || null,
            workload_hours: formData.workload_hours
          })
          .eq('id', editingSubject.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Disciplina atualizada com sucesso!"
        });
      } else {
        const { error } = await supabase
          .from('subjects')
          .insert([{
            name: formData.name,
            description: formData.description || null,
            workload_hours: formData.workload_hours
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Disciplina criada com sucesso!"
        });
      }

      setIsModalOpen(false);
      setEditingSubject(null);
      setFormData({ name: '', description: '', workload_hours: 0 });
      fetchSubjects();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao salvar disciplina: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      workload_hours: subject.workload_hours
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canManage) return;

    if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;

    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Disciplina excluída com sucesso!"
      });
      fetchSubjects();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir disciplina: " + error.message,
        variant: "destructive"
      });
    }
  };

  const openNewSubjectModal = () => {
    setEditingSubject(null);
    setFormData({ name: '', description: '', workload_hours: 0 });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Disciplinas</h2>
          <p className="text-muted-foreground">
            Gerencie as disciplinas oferecidas pela escola
          </p>
        </div>
        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewSubjectModal}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Disciplina
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? 'Editar Disciplina' : 'Nova Disciplina'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome da Disciplina</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Matemática, História..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="workload_hours">Carga Horária (horas/semana)</Label>
                  <Input
                    id="workload_hours"
                    type="number"
                    min="1"
                    max="40"
                    value={formData.workload_hours}
                    onChange={(e) => setFormData({ ...formData, workload_hours: parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição da disciplina..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingSubject ? 'Atualizar' : 'Criar'} Disciplina
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Disciplinas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma disciplina cadastrada</p>
              {canManage && (
                <Button onClick={openNewSubjectModal} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar primeira disciplina
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Carga Horária</TableHead>
                    <TableHead>Descrição</TableHead>
                    {canManage && <TableHead className="w-[100px]">Ações</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.workload_hours}h/semana</TableCell>
                      <TableCell>
                        {subject.description ? (
                          <span className="text-sm text-muted-foreground">
                            {subject.description.length > 50 
                              ? `${subject.description.substring(0, 50)}...` 
                              : subject.description
                            }
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">Sem descrição</span>
                        )}
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(subject)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(subject.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubjectManagement;
