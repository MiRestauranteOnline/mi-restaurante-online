import { useForm } from "react-hook-form";
import { useEffect } from "react";
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
    monday?: { open?: string; close?: string; closed?: boolean };
    tuesday?: { open?: string; close?: string; closed?: boolean };
    wednesday?: { open?: string; close?: string; closed?: boolean };
    thursday?: { open?: string; close?: string; closed?: boolean };
    friday?: { open?: string; close?: string; closed?: boolean };
    saturday?: { open?: string; close?: string; closed?: boolean };
    sunday?: { open?: string; close?: string; closed?: boolean };
  };
}

const daySchema = z.object({
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean().optional(),
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
  const defaultOpeningHours = {
    monday: { open: "11:00", close: "23:00", closed: false },
    tuesday: { open: "11:00", close: "23:00", closed: false },
    wednesday: { open: "11:00", close: "23:00", closed: false },
    thursday: { open: "11:00", close: "23:00", closed: false },
    friday: { open: "11:00", close: "23:00", closed: false },
    saturday: { open: "11:00", close: "23:00", closed: false },
    sunday: { open: "11:00", close: "23:00", closed: false },
  } as const;

  const mergedOpeningHours = {
    monday: {
      open: initialData?.opening_hours?.monday?.open ?? defaultOpeningHours.monday.open,
      close: initialData?.opening_hours?.monday?.close ?? defaultOpeningHours.monday.close,
      closed: initialData?.opening_hours?.monday?.closed ?? defaultOpeningHours.monday.closed,
    },
    tuesday: {
      open: initialData?.opening_hours?.tuesday?.open ?? defaultOpeningHours.tuesday.open,
      close: initialData?.opening_hours?.tuesday?.close ?? defaultOpeningHours.tuesday.close,
      closed: initialData?.opening_hours?.tuesday?.closed ?? defaultOpeningHours.tuesday.closed,
    },
    wednesday: {
      open: initialData?.opening_hours?.wednesday?.open ?? defaultOpeningHours.wednesday.open,
      close: initialData?.opening_hours?.wednesday?.close ?? defaultOpeningHours.wednesday.close,
      closed: initialData?.opening_hours?.wednesday?.closed ?? defaultOpeningHours.wednesday.closed,
    },
    thursday: {
      open: initialData?.opening_hours?.thursday?.open ?? defaultOpeningHours.thursday.open,
      close: initialData?.opening_hours?.thursday?.close ?? defaultOpeningHours.thursday.close,
      closed: initialData?.opening_hours?.thursday?.closed ?? defaultOpeningHours.thursday.closed,
    },
    friday: {
      open: initialData?.opening_hours?.friday?.open ?? defaultOpeningHours.friday.open,
      close: initialData?.opening_hours?.friday?.close ?? defaultOpeningHours.friday.close,
      closed: initialData?.opening_hours?.friday?.closed ?? defaultOpeningHours.friday.closed,
    },
    saturday: {
      open: initialData?.opening_hours?.saturday?.open ?? defaultOpeningHours.saturday.open,
      close: initialData?.opening_hours?.saturday?.close ?? defaultOpeningHours.saturday.close,
      closed: initialData?.opening_hours?.saturday?.closed ?? defaultOpeningHours.saturday.closed,
    },
    sunday: {
      open: initialData?.opening_hours?.sunday?.open ?? defaultOpeningHours.sunday.open,
      close: initialData?.opening_hours?.sunday?.close ?? defaultOpeningHours.sunday.close,
      closed: initialData?.opening_hours?.sunday?.closed ?? defaultOpeningHours.sunday.closed,
    },
  } as OpeningHoursFormData["opening_hours"];

  const form = useForm<OpeningHoursFormData>({
    resolver: zodResolver(openingHoursSchema),
    defaultValues: {
      opening_hours: mergedOpeningHours,
    },
  });

  // Reset form when initialData changes (after refresh/navigation)
  useEffect(() => {
    const newMergedHours = {
      monday: {
        open: initialData?.opening_hours?.monday?.open ?? defaultOpeningHours.monday.open,
        close: initialData?.opening_hours?.monday?.close ?? defaultOpeningHours.monday.close,
        closed: initialData?.opening_hours?.monday?.closed ?? defaultOpeningHours.monday.closed,
      },
      tuesday: {
        open: initialData?.opening_hours?.tuesday?.open ?? defaultOpeningHours.tuesday.open,
        close: initialData?.opening_hours?.tuesday?.close ?? defaultOpeningHours.tuesday.close,
        closed: initialData?.opening_hours?.tuesday?.closed ?? defaultOpeningHours.tuesday.closed,
      },
      wednesday: {
        open: initialData?.opening_hours?.wednesday?.open ?? defaultOpeningHours.wednesday.open,
        close: initialData?.opening_hours?.wednesday?.close ?? defaultOpeningHours.wednesday.close,
        closed: initialData?.opening_hours?.wednesday?.closed ?? defaultOpeningHours.wednesday.closed,
      },
      thursday: {
        open: initialData?.opening_hours?.thursday?.open ?? defaultOpeningHours.thursday.open,
        close: initialData?.opening_hours?.thursday?.close ?? defaultOpeningHours.thursday.close,
        closed: initialData?.opening_hours?.thursday?.closed ?? defaultOpeningHours.thursday.closed,
      },
      friday: {
        open: initialData?.opening_hours?.friday?.open ?? defaultOpeningHours.friday.open,
        close: initialData?.opening_hours?.friday?.close ?? defaultOpeningHours.friday.close,
        closed: initialData?.opening_hours?.friday?.closed ?? defaultOpeningHours.friday.closed,
      },
      saturday: {
        open: initialData?.opening_hours?.saturday?.open ?? defaultOpeningHours.saturday.open,
        close: initialData?.opening_hours?.saturday?.close ?? defaultOpeningHours.saturday.close,
        closed: initialData?.opening_hours?.saturday?.closed ?? defaultOpeningHours.saturday.closed,
      },
      sunday: {
        open: initialData?.opening_hours?.sunday?.open ?? defaultOpeningHours.sunday.open,
        close: initialData?.opening_hours?.sunday?.close ?? defaultOpeningHours.sunday.close,
        closed: initialData?.opening_hours?.sunday?.closed ?? defaultOpeningHours.sunday.closed,
      },
    };
    form.reset({
      opening_hours: newMergedHours,
    });
  }, [initialData, form]);

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
        <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-24">
                    <FormLabel className="text-sm font-medium">{label}</FormLabel>
                  </div>
                  <div className="flex items-center gap-2">
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
                          <FormLabel className="text-sm text-muted-foreground">
                            {field.value ? 'Cerrado' : 'Abierto'}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  {!form.watch(`opening_hours.${key}.closed`) && (
                    <>
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-sm">Abre:</FormLabel>
                        <FormField
                          control={form.control}
                          name={`opening_hours.${key}.open`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="time"
                                  className="w-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <FormLabel className="text-sm">Cierra:</FormLabel>
                        <FormField
                          control={form.control}
                          name={`opening_hours.${key}.close`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="time"
                                  className="w-32"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>


          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex gap-2">
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>
                Continuar
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};