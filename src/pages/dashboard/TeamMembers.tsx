import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImageUpload } from '@/components/ImageUpload';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardContext {
  selectedClientId: string;
  selectedClient: {
    id: string;
    restaurant_name: string;
    subdomain: string;
  };
}

interface TeamMember {
  id: string;
  name: string;
  title: string;
  bio: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const teamMemberSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  title: z.string().min(1, 'El título/cargo es requerido'),
  bio: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean().default(true),
});

type TeamMemberFormData = z.infer<typeof teamMemberSchema>;

function SortableTeamMemberItem({ member, onEdit, onDelete, onToggleStatus, onMoveUp, onMoveDown, isFirst, isLast, isMobile }: {
  member: TeamMember;
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
  isMobile: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: member.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex flex-col gap-1 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveUp(member.id)}
                disabled={isFirst}
                className="h-6 w-6 p-0"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMoveDown(member.id)}
                disabled={isLast}
                className="h-6 w-6 p-0"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              {member.image_url && (
                <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <img 
                    src={member.image_url} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {member.title}
                </p>
                {member.bio && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={member.is_active}
              onCheckedChange={(checked) => onToggleStatus(member.id, checked)}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(member)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(member.id)}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TeamMembers() {
  const { selectedClientId, selectedClient } = useOutletContext<DashboardContext>();
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const isMobile = useIsMobile();

  const desktopSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const sensors = isMobile ? useSensors() : desktopSensors;

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberSchema) as any,
    defaultValues: {
      name: '',
      title: '',
      bio: '',
      image_url: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (selectedClientId) {
      fetchTeamMembers();
    }
  }, [selectedClientId]);

  const fetchTeamMembers = async () => {
    if (!selectedClientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('client_id', selectedClientId)
        .order('display_order', { ascending: true });

      if (error) {
        toast.error('Error al cargar miembros del equipo');
        return;
      }

      setTeamMembers(data || []);
    } catch (error) {
      toast.error('Error al cargar miembros del equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = teamMembers.findIndex(member => member.id === active.id);
    const newIndex = teamMembers.findIndex(member => member.id === over.id);

    const newTeamMembers = arrayMove(teamMembers, oldIndex, newIndex);
    setTeamMembers(newTeamMembers);

    // Update display_order in database
    try {
      const updates = newTeamMembers.map((member, index) => ({
        id: member.id,
        display_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from('team_members')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Orden actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar el orden');
      fetchTeamMembers(); // Reload on error
    }
  };

  const onSubmit = async (data: TeamMemberFormData) => {
    if (!selectedClientId) return;

    try {
      setSaving(true);

      if (editing) {
        // Update existing member
        const { error } = await supabase
          .from('team_members')
          .update({
            name: data.name,
            title: data.title,
            bio: data.bio || null,
            image_url: data.image_url || null,
            is_active: data.is_active,
          })
          .eq('id', editing.id);

        if (error) throw error;
        
        toast.success('Miembro del equipo actualizado correctamente');
      } else {
        // Create new member
        const maxOrder = Math.max(...teamMembers.map(m => m.display_order), -1);
        
        const { error } = await supabase
          .from('team_members')
          .insert({
            client_id: selectedClientId,
            name: data.name,
            title: data.title,
            bio: data.bio || null,
            image_url: data.image_url || null,
            display_order: maxOrder + 1,
            is_active: data.is_active,
          });

        if (error) throw error;
        
        toast.success('Miembro del equipo creado correctamente');
      }

      setShowDialog(false);
      setEditing(null);
      form.reset();
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar miembro del equipo');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditing(member);
    form.reset({
      name: member.name,
      title: member.title,
      bio: member.bio || '',
      image_url: member.image_url || '',
      is_active: member.is_active,
    });
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este miembro del equipo?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Miembro del equipo eliminado correctamente');
      fetchTeamMembers();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar miembro del equipo');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      fetchTeamMembers();
      toast.success(isActive ? 'Miembro activado' : 'Miembro desactivado');
    } catch (error: any) {
      toast.error('Error al cambiar estado del miembro');
    }
  };

  const handleNewMember = () => {
    setEditing(null);
    form.reset({
      name: '',
      title: '',
      bio: '',
      image_url: '',
      is_active: true,
    });
    setShowDialog(true);
  };

  const handleMoveUp = async (memberId: string) => {
    const index = teamMembers.findIndex(m => m.id === memberId);
    if (index > 0) {
      const newMembers = arrayMove(teamMembers, index, index - 1);
      setTeamMembers(newMembers);

      try {
        const updates = newMembers.map((member, idx) => ({
          id: member.id,
          display_order: idx,
        }));

        for (const update of updates) {
          await supabase
            .from('team_members')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast.success('Orden actualizado correctamente');
      } catch (error) {
        toast.error('Error al actualizar el orden');
        fetchTeamMembers();
      }
    }
  };

  const handleMoveDown = async (memberId: string) => {
    const index = teamMembers.findIndex(m => m.id === memberId);
    if (index < teamMembers.length - 1) {
      const newMembers = arrayMove(teamMembers, index, index + 1);
      setTeamMembers(newMembers);

      try {
        const updates = newMembers.map((member, idx) => ({
          id: member.id,
          display_order: idx,
        }));

        for (const update of updates) {
          await supabase
            .from('team_members')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast.success('Orden actualizado correctamente');
      } catch (error) {
        toast.error('Error al actualizar el orden');
        fetchTeamMembers();
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Miembros del Equipo</h2>
            <p className="text-muted-foreground">Gestiona los miembros de tu equipo</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Miembros del Equipo</h2>
          <p className="text-muted-foreground">
            Gestiona los miembros de tu equipo. {isMobile ? 'Usa las flechas para reordenar.' : 'Puedes arrastrar para reordenar.'}
          </p>
        </div>
        
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleNewMember}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md max-h-[85svh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editing ? 'Editar Miembro' : 'Nuevo Miembro del Equipo'}
              </DialogTitle>
              <DialogDescription>
                {editing 
                  ? 'Modifica la información del miembro del equipo'
                  : 'Agrega un nuevo miembro a tu equipo'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título/Cargo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Chef Ejecutivo, Gerente, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografía (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve descripción sobre el miembro del equipo..."
                          className="resize-none"
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen de Perfil</FormLabel>
                      <FormControl>
                        <ImageUpload
                          label=""
                          value={field.value || ''}
                          onChange={(url) => field.onChange(url)}
                          clientId={selectedClientId}
                          context="team-member"
                          description={form.watch('name') || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <FormLabel>Estado Activo</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          El miembro aparecerá en el sitio web
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Guardando...
                      </>
                    ) : (
                      editing ? 'Actualizar' : 'Crear'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {teamMembers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No hay miembros del equipo
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Comienza agregando miembros de tu equipo para mostrar en el sitio web
            </p>
            <Button onClick={handleNewMember}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Primer Miembro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={teamMembers} strategy={verticalListSortingStrategy}>
              {teamMembers.map((member, index) => (
                <SortableTeamMemberItem
                  key={member.id}
                  member={member}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={index === 0}
                  isLast={index === teamMembers.length - 1}
                  isMobile={isMobile}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}