import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Users } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  imageUrl?: string;
}

export interface TeamData {
  teamMembers: TeamMember[];
}

const teamMemberSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  title: z.string().min(1, "El cargo es requerido"),
  bio: z.string().min(10, "La biografía debe tener al menos 10 caracteres"),
  imageUrl: z.string().optional(),
});

const teamSchema = z.object({
  teamMembers: z.array(teamMemberSchema).min(1, "Agrega al menos un miembro del equipo"),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface SignupStep5Props {
  onComplete: (teamData: TeamData) => void;
  onBack: () => void;
  initialData?: TeamData;
}

export const SignupStep5 = ({ onComplete, onBack, initialData }: SignupStep5Props) => {
  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamMembers: initialData?.teamMembers?.length ? initialData.teamMembers : [{ name: "", title: "", bio: "", imageUrl: "" }],
    },
  });

  const { fields: teamFields, append: appendTeamMember, remove: removeTeamMember } = useFieldArray({
    control: form.control,
    name: "teamMembers"
  });

  const onSubmit = (data: TeamFormData) => {
    onComplete(data);
  };

  const handleSkip = () => {
    onComplete({ teamMembers: [] });
  };

  const addTeamMember = () => {
    appendTeamMember({ name: "", title: "", bio: "", imageUrl: "" });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Users className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-foreground">Equipo del Restaurante</h2>
        </div>
        <p className="text-muted-foreground">
          Presenta a tu equipo para generar confianza y mostrar el lado humano de tu restaurante.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Miembros del Equipo
              </CardTitle>
              <CardDescription>
                Agrega información sobre el chef, gerente, o personas clave del restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {teamFields.map((field, index) => (
                <Card key={field.id} className="p-4 border-dashed">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Miembro #{index + 1}</h4>
                    {teamFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTeamMember(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Carlos Mendoza" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Chef Ejecutivo, Gerente, Sommelier" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`teamMembers.${index}.imageUrl`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Foto del Miembro (Opcional)</FormLabel>
                          <FormControl>
                            <ImageUpload
                              label=""
                              value={field.value || ""}
                              onChange={field.onChange}
                              clientId="signup"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`teamMembers.${index}.bio`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Biografía</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Cuéntanos sobre su experiencia, especialidades, años en el rubro..."
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addTeamMember}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Miembro del Equipo
              </Button>
            </CardContent>
          </Card>

          {/* Skip Option */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 text-sm">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">¿Omitir miembros del equipo?</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Si omites este paso, tu sitio se publicará sin información del equipo. 
                    No te preocupes, puedes agregarla fácilmente después a través de tu panel de control.
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSkip}
                    className="mt-2 text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                  >
                    Omitir por ahora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button type="submit">
              Finalizar Registro
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};