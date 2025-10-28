import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X, HelpCircle, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQsData {
  faqs: FAQItem[];
}

const faqItemSchema = z.object({
  question: z.string().min(1, "La pregunta es requerida"),
  answer: z.string().min(1, "La respuesta es requerida"),
});

const faqsSchema = z.object({
  faqs: z.array(faqItemSchema).optional(),
});

type FAQsFormData = z.infer<typeof faqsSchema>;

interface SignupStep6FAQsProps {
  onComplete: (data: FAQsData) => void;
  onBack: () => void;
  initialData?: FAQsData;
  isProcessing?: boolean;
}

export const SignupStep6FAQs = ({ onComplete, onBack, initialData, isProcessing = false }: SignupStep6FAQsProps) => {
  const form = useForm<FAQsFormData>({
    resolver: zodResolver(faqsSchema),
    defaultValues: {
      faqs: initialData?.faqs?.length ? initialData.faqs : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "faqs"
  });

  const onSubmit = (data: FAQsFormData) => {
    const validFaqs = data.faqs?.filter(faq => faq.question.trim() && faq.answer.trim()) || [];
    onComplete({
      faqs: validFaqs,
    });
  };

  const handleSkip = () => {
    onComplete({
      faqs: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <HelpCircle className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-foreground">Preguntas Frecuentes</h2>
        </div>
        <p className="text-muted-foreground">
          Agrega preguntas y respuestas comunes para ayudar a tus clientes a encontrar información rápidamente.
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium">¿Qué son las preguntas frecuentes?</p>
              <p className="mt-1">
                Las FAQs (Frequently Asked Questions) ayudan a tus clientes a encontrar respuestas rápidas sobre horarios, 
                reservas, métodos de pago, políticas, menú especial, alergias, y más. Esto reduce las consultas repetitivas 
                y mejora la experiencia del cliente.
              </p>
              <p className="mt-2 text-xs italic">
                Puedes agregar, editar o eliminar preguntas en cualquier momento desde tu panel de control.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No has agregado ninguna pregunta frecuente aún
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ question: "", answer: "" })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primera Pregunta
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Pregunta #{index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`faqs.${index}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pregunta</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: ¿Aceptan reservas?"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`faqs.${index}.answer`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respuesta</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Ej: Sí, aceptamos reservas. Puedes llamarnos o escribirnos por WhatsApp."
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={() => append({ question: "", answer: "" })}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Otra Pregunta
              </Button>
            </div>
          )}

          {/* Common FAQ suggestions */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-sm">Sugerencias de preguntas comunes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• ¿Aceptan reservas? ¿Cómo puedo hacer una reserva?</li>
                <li>• ¿Cuáles son sus horarios de atención?</li>
                <li>• ¿Qué métodos de pago aceptan?</li>
                <li>• ¿Tienen opciones vegetarianas/veganas?</li>
                <li>• ¿Hacen delivery? ¿Cuál es el área de cobertura?</li>
                <li>• ¿Tienen estacionamiento disponible?</li>
                <li>• ¿Aceptan eventos o grupos grandes?</li>
              </ul>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={handleSkip} disabled={isProcessing}>
                Omitir
              </Button>
              <LoadingButton
                type="submit"
                isLoading={isProcessing}
                statusMessages={[
                  "Guardando información...",
                  "Configurando tu sitio...",
                  "Preparando el dashboard...",
                  "Finalizando registro..."
                ]}
                statusInterval={2000}
              >
                Finalizar Registro
              </LoadingButton>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};