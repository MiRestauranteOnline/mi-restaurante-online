import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Clock } from "lucide-react";

export interface OpeningHoursData {
  opening_hours: {
    monday?: { open?: string; close?: string; closed: boolean };
    tuesday?: { open?: string; close?: string; closed: boolean };
    wednesday?: { open?: string; close?: string; closed: boolean };
    thursday?: { open?: string; close?: string; closed: boolean };
    friday?: { open?: string; close?: string; closed: boolean };
    saturday?: { open?: string; close?: string; closed: boolean };
    sunday?: { open?: string; close?: string; closed: boolean };
  };
}

const daySchema = z.object({
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean(),
});

const openingHoursSchema = z.object({
  opening_hours: z.object({
    monday: daySchema.optional(),
    tuesday: daySchema.optional(),
    wednesday: daySchema.optional(),
    thursday: daySchema.optional(),
    friday: daySchema.optional(),
    saturday: daySchema.optional(),
    sunday: daySchema.optional(),
  }),
});

type OpeningHoursFormData = z.infer<typeof openingHoursSchema>;

interface SignupStep4OpeningHoursProps {
  onComplete: (data: OpeningHoursData) => void;
  onBack: () => void;
  initialData?: OpeningHoursData;
}

export const SignupStep4OpeningHours = ({ onComplete, onBack, initialData }: SignupStep4OpeningHoursProps) => {
  const form = useForm<OpeningHoursFormData>({
    resolver: zodResolver(openingHoursSchema),
    defaultValues: {
      opening_hours: initialData?.opening_hours || {
        monday: { open: "09:00", close: "23:00", closed: false },
        tuesday: { open: "09:00", close: "23:00", closed: false },
        wednesday: { open: "09:00", close: "23:00", closed: false },
        thursday: { open: "09:00", close: "23:00", closed: false },
        friday: { open: "09:00", close: "23:00", closed: false },
        saturday: { open: "09:00", close: "23:00", closed: false },
        sunday: { open: "09:00", close: "23:00", closed: false },
      },
    },
  });

  const onSubmit = (data: OpeningHoursFormData) => {
    onComplete(data);
  };

  const handleSkip = () => {
    onComplete({ opening_hours: {} });
  };

  const days = [
    { key: 'monday' as const, label: 'Lunes' },
    { key: 'tuesday' as const, label: 'Martes' },
    { key: 'wednesday' as const, label: 'Miércoles' },
    { key: 'thursday' as const, label: 'Jueves' },
    { key: 'friday' as const, label: 'Viernes' },
    { key: 'saturday' as const, label: 'Sábado' },
    { key: 'sunday' as const, label: 'Domingo' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Clock className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-foreground">Horarios de Atención</h2>
        </div>
        <p className="text-muted-foreground">
          Configura los horarios de tu restaurante para que tus clientes sepan cuándo pueden visitarte.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horarios por Día
              </CardTitle>
              <CardDescription>
                Establece los horarios de apertura y cierre para cada día de la semana
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map(({ key, label }) => (
                <Card key={key} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">{label}</h4>
                    <FormField
                      control={form.control}
                      name={`opening_hours.${key}.closed`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={!field.value}
                              onCheckedChange={(checked) => field.onChange(!checked)}
                            />
                          </FormControl>
                          <FormLabel className="text-sm">
                            {field.value ? 'Cerrado' : 'Abierto'}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {!form.watch(`opening_hours.${key}.closed`) && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`opening_hours.${key}.open`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de Apertura</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`opening_hours.${key}.close`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora de Cierre</FormLabel>
                            <FormControl>
                              <Input
                                type="time"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Skip Option */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 text-sm">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">¿Omitir horarios de atención?</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Si omites este paso, tu sitio se publicará sin horarios de atención. 
                    No te preocupes, puedes agregarlos fácilmente después a través de tu panel de control.
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
              Continuar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};