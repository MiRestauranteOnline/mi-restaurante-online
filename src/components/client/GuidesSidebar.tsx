import { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, FileText, Globe, Mail, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface GuideItem {
  id: string;
  title: string;
  icon: any;
}

interface GuideCategory {
  title: string;
  items: GuideItem[];
}

// Map guide categories to URL-friendly slugs
const categoryToSlug: Record<string, string> = {
  "Primeros Pasos": "primeros-pasos",
  "Panel Principal": "panel-principal",
  "Configuración de Dominio": "configuracion-dominio",
  "Configuración de Email": "configuracion-email",
  "Reservas": "reservas",
};

const guideCategories: GuideCategory[] = [
  {
    title: "Primeros Pasos",
    items: [
      { id: "introduccion", title: "Introducción", icon: FileText },
    ],
  },
  {
    title: "Panel Principal",
    items: [
      { id: "informacion-general", title: "Información General", icon: FileText },
      { id: "horarios-apertura", title: "Horarios de Apertura", icon: FileText },
      { id: "redes-sociales", title: "Redes Sociales", icon: FileText },
      { id: "informacion-delivery", title: "Información de Delivery", icon: FileText },
      { id: "marca-personalizacion", title: "Marca y Personalización", icon: FileText },
      { id: "contenido-sitio", title: "Contenido del Sitio", icon: FileText },
      { id: "preguntas-frecuentes", title: "Preguntas Frecuentes", icon: FileText },
      { id: "carrusel-imagenes", title: "Carrusel de Imágenes", icon: FileText },
      { id: "categorias-menu", title: "Categorías del Menú", icon: FileText },
      { id: "elementos-menu", title: "Elementos del Menú", icon: FileText },
      { id: "equipo", title: "Equipo", icon: FileText },
      { id: "resenas", title: "Reseñas", icon: FileText },
    ],
  },
  {
    title: "Configuración de Dominio",
    items: [
      { id: "dominio-personalizado", title: "Dominio Personalizado", icon: Globe },
    ],
  },
  {
    title: "Configuración de Email",
    items: [
      { id: "configuracion-email", title: "Correo Electrónico", icon: Mail },
    ],
  },
  {
    title: "Reservas",
    items: [
      { id: "horarios-reserva", title: "Horarios de Reserva", icon: FileText },
      { id: "configuracion-mesas", title: "Configuración de Mesas", icon: FileText },
      { id: "disponibilidad-reservas", title: "Disponibilidad", icon: FileText },
      { id: "lista-reservas", title: "Lista de Reservas", icon: FileText },
      { id: "calendario-reservas", title: "Calendario", icon: FileText },
    ],
  },
];

interface GuidesSidebarProps {
  activeGuide: string;
}

export function GuidesSidebar({ activeGuide }: GuidesSidebarProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(["Primeros Pasos", "Panel Principal", "Configuración de Dominio", "Configuración de Email", "Reservas"]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const SidebarContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-lg font-semibold">Guías</h2>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <nav className="space-y-2">
        {guideCategories.map((category) => (
          <div key={category.title}>
            <button
              onClick={() => toggleCategory(category.title)}
              className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors"
            >
              <span>{category.title}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  openCategories.includes(category.title) && "rotate-180"
                )}
              />
            </button>
            
            {openCategories.includes(category.title) && (
              <div className="ml-2 mt-1 space-y-1">
                {category.items.map((item) => {
                  const categorySlug = categoryToSlug[category.title];
                  const guidePath = `/client/guias/${categorySlug}/${item.id}`;
                  
                  return (
                    <NavLink
                      key={item.id}
                      to={guidePath}
                      onClick={() => isMobile && setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 w-full px-4 py-2 text-sm rounded-md transition-colors",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="mb-4"
        >
          <Menu className="h-4 w-4 mr-2" />
          Ver Guías
        </Button>
        
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-72 bg-background border-r shadow-lg overflow-y-auto">
              <SidebarContent />
            </div>
            <div
              className="fixed inset-0 -z-10"
              onClick={() => setMobileOpen(false)}
            />
          </div>
        )}
      </>
    );
  }

  return (
    <aside className="w-64 border-r bg-card overflow-y-auto">
      <SidebarContent />
    </aside>
  );
}
