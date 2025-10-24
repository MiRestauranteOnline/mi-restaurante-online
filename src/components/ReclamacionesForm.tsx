import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, "El nombre completo es requerido").max(200),
  documentNumber: z.string().min(8, "Número de documento inválido").max(20),
  email: z.string().email("Correo electrónico inválido").max(255),
  phone: z.string().min(9, "Teléfono inválido").max(20),
  contractedItem: z.enum(["producto", "servicio"], {
    required_error: "Selecciona producto o servicio",
  }),
  amount: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseDocument: z.string().max(100).optional(),
  claimType: z.enum(["reclamo", "queja"], {
    required_error: "Selecciona el tipo de solicitud",
  }),
  purchaseChannel: z.string().optional(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(2000),
  consumerRequest: z.string().min(10, "El pedido debe tener al menos 10 caracteres").max(2000),
  dataConsent: z.boolean().refine(val => val === true, {
    message: "Debes autorizar el tratamiento de tus datos",
  }),
});

type FormData = z.infer<typeof formSchema>;

export const ReclamacionesForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      documentNumber: "",
      email: "",
      phone: "",
      amount: "",
      purchaseDate: "",
      purchaseDocument: "",
      purchaseChannel: "",
      description: "",
      consumerRequest: "",
      dataConsent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Generate claim code
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const randomNum = Math.floor(Math.random() * 10000);
      const claimCode = `LRV-${dateStr}-${randomNum}`;

      // Call edge function to send emails
      const { error } = await supabase.functions.invoke("send-reclamacion-email", {
        body: {
          claimCode,
          formData: {
            fullName: data.fullName,
            documentNumber: data.documentNumber,
            email: data.email,
            phone: data.phone,
            contractedItem: data.contractedItem,
            amount: data.amount || "N/A",
            purchaseDate: data.purchaseDate || "N/A",
            purchaseDocument: data.purchaseDocument || "N/A",
            claimType: data.claimType,
            purchaseChannel: data.purchaseChannel || "N/A",
            description: data.description,
            consumerRequest: data.consumerRequest,
          },
        },
      });

      if (error) throw error;

      setSubmittedCode(claimCode);
      toast.success("Reclamo enviado correctamente. Revisa tu correo para la confirmación.");
      form.reset();
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast.error("Error al enviar el reclamo. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedCode) {
    return (
      <div className="bg-primary/10 border-2 border-primary rounded-lg p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-foreground">¡Reclamo Registrado!</h3>
        <div className="space-y-2">
          <p className="text-lg text-foreground">Tu código de reclamo es:</p>
          <p className="text-3xl font-bold text-primary">{submittedCode}</p>
        </div>
        <p className="text-muted-foreground">
          Hemos enviado una copia de tu reclamo a tu correo electrónico. 
          Guarda este código para futuras consultas.
        </p>
        <Button onClick={() => setSubmittedCode(null)} variant="outline" className="mt-4">
          Enviar otro reclamo
        </Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa tu nombre completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DNI / CE / Pasaporte *</FormLabel>
                <FormControl>
                  <Input placeholder="Número de documento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@correo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono *</FormLabel>
                <FormControl>
                  <Input placeholder="+51 999 999 999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Product/Service Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contractedItem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bien contratado *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="producto">Producto</SelectItem>
                    <SelectItem value="servicio">Servicio</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monto (S/)</FormLabel>
                <FormControl>
                  <Input placeholder="Si corresponde" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de compra / servicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseDocument"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento de compra</FormLabel>
                <FormControl>
                  <Input placeholder="Número de factura/boleta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Claim Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="claimType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="reclamo">Reclamo (disconformidad sobre el producto/servicio)</SelectItem>
                    <SelectItem value="queja">Queja (malestar o descontento con la atención)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseChannel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Canal de compra</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="web">Sitio web</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe detalladamente tu reclamo o queja"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consumerRequest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pedido del consumidor *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="¿Qué solicitas que se haga respecto a tu reclamo?"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataConsent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Autorizo el tratamiento de mis datos personales para gestionar mi reclamo, conforme a la Política de Privacidad. *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Reclamo
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Al enviar, recibirás un correo con tu código y la constancia del registro.
          </p>
        </div>
      </form>
    </Form>
  );
};
