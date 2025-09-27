import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, X, Utensils, FolderPlus } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";

export interface MenuCategory {
  name: string;
}

export interface MenuItem {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl?: string;
}

export interface MenuData {
  categories: MenuCategory[];
  items: MenuItem[];
}

const menuCategorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es requerido"),
});

const menuItemSchema = z.object({
  name: z.string().min(1, "El nombre del plato es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.string().min(1, "El precio es requerido"),
  category: z.string().min(1, "Selecciona una categoría"),
  imageUrl: z.string().optional(),
});

const menuSchema = z.object({
  categories: z.array(menuCategorySchema).min(1, "Agrega al menos una categoría"),
  items: z.array(menuItemSchema).min(4, "Necesitas agregar al menos 4 elementos de menú"),
});

type MenuFormData = z.infer<typeof menuSchema>;

interface SignupStep3Props {
  onComplete: (menuData: MenuData) => void;
  onBack: () => void;
  initialData?: MenuData;
}

export const SignupStep3 = ({ onComplete, onBack, initialData }: SignupStep3Props) => {
  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      categories: initialData?.categories?.length ? initialData.categories : [{ name: "" }],
      items: initialData?.items?.length ? initialData.items : [{ name: "", description: "", price: "", category: "", imageUrl: "" }],
    },
  });

  const { fields: categoryFields, append: appendCategory, remove: removeCategory } = useFieldArray({
    control: form.control,
    name: "categories"
  });

  const { fields: itemFields, append: appendItem, remove: removeItem } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const categories = form.watch("categories");

  const onSubmit = (data: MenuFormData) => {
    onComplete(data);
  };

  const handleSkip = () => {
    onComplete({ categories: [], items: [] });
  };

  const addCategory = () => {
    appendCategory({ name: "" });
  };

  const addItem = () => {
    appendItem({ name: "", description: "", price: "", category: "", imageUrl: "" });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Utensils className="h-6 w-6" />
          <h2 className="text-2xl font-bold text-foreground">Menú del Restaurante</h2>
        </div>
        <p className="text-muted-foreground">
          Agrega las categorías y platos de tu menú. Puedes agregar más después.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Categories Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Categorías del Menú
              </CardTitle>
              <CardDescription>
                Organiza tu menú en categorías (ej: Entradas, Platos Principales, Postres)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`categories.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            placeholder="Ej: Platos Principales, Entradas, Bebidas..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {categoryFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCategory(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addCategory}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Categoría
              </Button>
            </CardContent>
          </Card>

          {/* Menu Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Platos del Menú
              </CardTitle>
              <CardDescription>
                Agrega los platos de tu menú con descripción y precio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {itemFields.map((field, index) => (
                <Card key={field.id} className="p-4 border-dashed">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Plato #{index + 1}</h4>
                    {itemFields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`items.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Plato</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Ceviche de Pescado" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Precio</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 25.90" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.category`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría</FormLabel>
                          <FormControl>
                            <select 
                              {...field} 
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="">Selecciona una categoría</option>
                              {categories.map((cat, catIndex) => (
                                cat.name && (
                                  <option key={catIndex} value={cat.name}>
                                    {cat.name}
                                  </option>
                                )
                              ))}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`items.${index}.imageUrl`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imagen (Opcional)</FormLabel>
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
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe los ingredientes y preparación del plato..."
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
                onClick={addItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Plato
              </Button>
            </CardContent>
          </Card>

          {/* Skip Option */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 text-sm">⚠️</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">¿Omitir elementos del menú?</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Si omites este paso, tu sitio se publicará sin elementos del menú. 
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