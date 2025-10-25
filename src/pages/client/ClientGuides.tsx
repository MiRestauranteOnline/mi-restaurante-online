import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Check, ExternalLink, FileText, Globe, Mail, Save, Palette, DollarSign, AlertCircle, CheckCircle, Info, Truck, Clock, MapPin, Link2, Image, Type, Sliders, Moon, Sun, Layout, Eye, EyeOff, ImagePlus, FileEdit, HelpCircle, ArrowUpDown, Lightbulb, Edit, Trash2, Home, Power, GripVertical, ChevronDown, ChevronRight, ChevronLeft, Users, ArrowUp, ArrowDown, PowerOff, Star, MessageSquare, CalendarIcon, Pencil, Search, Filter, Download, CheckCircle2, XCircle, RefreshCw, Sparkles, MessageCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GuidesSidebar } from "@/components/client/GuidesSidebar";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SmartSupportLink } from "@/components/SmartSupportLink";
import namecheapStep1 from "@/assets/namecheap-step-1.webp";
import namecheapStep2 from "@/assets/namecheap-step-2.webp";
import namecheapStep3 from "@/assets/namecheap-step-3.webp";
import namecheapStep4 from "@/assets/namecheap-step-4.webp";

// SEO metadata for each guide
const guideMetadata: Record<string, { title: string; description: string; category: string }> = {
  "introduccion": {
    title: "Introducción - Guías de Mi Restaurante Online",
    description: "Aprende a gestionar tu restaurante online con nuestras guías completas. Descubre cómo configurar tu sitio web, menú digital, reservas y más.",
    category: "Primeros Pasos"
  },
  "informacion-general": {
    title: "Información General del Restaurante - Guía Completa",
    description: "Configura la información básica de tu restaurante: nombre, descripción, ubicación y datos de contacto. Guía paso a paso.",
    category: "Panel Principal"
  },
  "horarios-apertura": {
    title: "Configurar Horarios de Apertura - Guía de Restaurantes",
    description: "Aprende a establecer los horarios de apertura de tu restaurante para que tus clientes sepan cuándo visitarte.",
    category: "Panel Principal"
  },
  "redes-sociales": {
    title: "Integrar Redes Sociales en tu Restaurante Online",
    description: "Conecta tus perfiles de redes sociales a tu sitio web de restaurante para aumentar tu presencia digital.",
    category: "Panel Principal"
  },
  "informacion-delivery": {
    title: "Configurar Información de Delivery - Guía para Restaurantes",
    description: "Gestiona la información de delivery de tu restaurante: zonas de entrega, costos y tiempos estimados.",
    category: "Panel Principal"
  },
  "marca-personalizacion": {
    title: "Personalizar la Marca de tu Restaurante Online",
    description: "Personaliza los colores, logo y estilo de tu sitio web para reflejar la identidad única de tu restaurante.",
    category: "Panel Principal"
  },
  "navegacion-visibilidad": {
    title: "Controlar Navegación y Visibilidad de Secciones",
    description: "Gestiona qué secciones se muestran u ocultan en tu sitio web de restaurante.",
    category: "Panel Principal"
  },
  "contenido-sitio": {
    title: "Gestionar el Contenido de tu Sitio Web de Restaurante",
    description: "Edita y actualiza el contenido de tu sitio web: textos, imágenes y secciones principales.",
    category: "Panel Principal"
  },
  "preguntas-frecuentes": {
    title: "Configurar Preguntas Frecuentes (FAQs) - Guía para Restaurantes",
    description: "Crea una sección de preguntas frecuentes para responder las dudas más comunes de tus clientes.",
    category: "Panel Principal"
  },
  "carrusel-imagenes": {
    title: "Gestionar el Carrusel de Imágenes de tu Restaurante",
    description: "Sube y organiza las imágenes del carrusel principal de tu sitio web de restaurante.",
    category: "Panel Principal"
  },
  "categorias-menu": {
    title: "Crear Categorías del Menú Digital - Guía Restaurantes",
    description: "Organiza tu menú digital creando categorías como Entrantes, Platos Principales, Postres y Bebidas.",
    category: "Panel Principal"
  },
  "elementos-menu": {
    title: "Agregar Elementos al Menú Digital de tu Restaurante",
    description: "Añade platos, bebidas y productos a tu menú digital con precios, descripciones y fotos.",
    category: "Panel Principal"
  },
  "equipo": {
    title: "Presentar el Equipo de tu Restaurante Online",
    description: "Muestra a tu equipo de trabajo en el sitio web: chefs, gerentes y personal destacado.",
    category: "Panel Principal"
  },
  "resenas": {
    title: "Gestionar Reseñas y Testimonios de Clientes",
    description: "Administra las reseñas y testimonios de tus clientes para construir confianza y credibilidad.",
    category: "Panel Principal"
  },
  "dominio-personalizado": {
    title: "Configurar Dominio Personalizado para tu Restaurante",
    description: "Guía paso a paso para conectar tu dominio personalizado (ej: turestaurante.com) con NameCheap y Cloudflare.",
    category: "Configuración de Dominio"
  },
  "configuracion-email": {
    title: "Configurar Correo Electrónico Profesional para Restaurantes",
    description: "Configura un correo electrónico profesional con tu dominio personalizado para tu restaurante.",
    category: "Configuración de Email"
  },
  "horarios-reserva": {
    title: "Configurar Horarios de Reservas Online",
    description: "Establece los horarios en los que tu restaurante acepta reservas online de clientes.",
    category: "Reservas"
  },
  "configuracion-mesas": {
    title: "Configurar Mesas para Sistema de Reservas",
    description: "Gestiona la configuración de mesas de tu restaurante para optimizar las reservas online.",
    category: "Reservas"
  },
  "disponibilidad-reservas": {
    title: "Gestionar Disponibilidad de Reservas en tu Restaurante",
    description: "Controla la disponibilidad de reservas por día y horario para tu restaurante.",
    category: "Reservas"
  },
  "lista-reservas": {
    title: "Ver y Gestionar Lista de Reservas del Restaurante",
    description: "Accede a la lista completa de reservas de tu restaurante y gestiona cada solicitud.",
    category: "Reservas"
  },
  "calendario-reservas": {
    title: "Calendario de Reservas para Restaurantes",
    description: "Visualiza todas las reservas de tu restaurante en un calendario interactivo y organizado.",
    category: "Reservas"
  },
  "introduccion-analiticas": {
    title: "Introducción a las Analíticas de Restaurantes Online",
    description: "Descubre cómo usar las analíticas para mejorar el rendimiento de tu restaurante online.",
    category: "Analíticas"
  },
  "metricas": {
    title: "Entender las Métricas de tu Restaurante Online",
    description: "Aprende a interpretar las métricas clave de tu sitio web: visitas, conversiones y más.",
    category: "Analíticas"
  },
  "estadisticas-uso": {
    title: "Estadísticas de Uso de tu Restaurante Online",
    description: "Consulta las estadísticas detalladas de uso de tu sitio web y plataforma de gestión.",
    category: "Analíticas"
  },
  "configurar-google-analytics": {
    title: "Configurar Google Analytics para tu Restaurante",
    description: "Guía completa para conectar Google Analytics 4 (GA4) y rastrear visitantes de tu sitio web de restaurante.",
    category: "Analíticas"
  },
  "configurar-google-search-console": {
    title: "Configurar Google Search Console - Guía Restaurantes",
    description: "Aprende a verificar tu sitio web con Google Search Console para mejorar tu posicionamiento SEO.",
    category: "Analíticas"
  },
  "como-obtener-soporte": {
    title: "Cómo Obtener Soporte Técnico para tu Restaurante Online",
    description: "Conoce los canales de soporte disponibles y cómo contactarnos para resolver tus dudas.",
    category: "Soporte"
  },
  "crear-tickets": {
    title: "Crear Tickets de Soporte - Guía Restaurantes",
    description: "Aprende a crear tickets de soporte para resolver problemas técnicos de tu restaurante online.",
    category: "Soporte"
  },
  "historial-tickets": {
    title: "Consultar Historial de Tickets de Soporte",
    description: "Accede al historial completo de tus tickets de soporte y seguimiento de solicitudes.",
    category: "Soporte"
  },
  "gestionar-suscripcion": {
    title: "Gestionar tu Suscripción de Restaurante Online",
    description: "Administra tu suscripción: cambia de plan, actualiza métodos de pago y más.",
    category: "Suscripción"
  },
  "metodos-pago": {
    title: "Configurar Métodos de Pago para tu Suscripción",
    description: "Añade y gestiona los métodos de pago para tu suscripción de restaurante online.",
    category: "Suscripción"
  },
  "cambios-plan": {
    title: "Cambiar de Plan de Suscripción - Guía Restaurantes",
    description: "Aprende cómo cambiar tu plan de suscripción para acceder a más funcionalidades.",
    category: "Suscripción"
  },
  "informacion-facturacion": {
    title: "Información de Facturación y Pagos - Restaurantes",
    description: "Consulta tu información de facturación, historial de pagos y descarga facturas.",
    category: "Suscripción"
  },
  "libro-reclamaciones": {
    title: "Libro de Reclamaciones - Configuración para Restaurantes",
    description: "Configura el Libro de Reclamaciones virtual de tu restaurante para cumplir con las normativas legales.",
    category: "Políticas"
  },
  "paginas-politicas": {
    title: "Páginas de Políticas - Privacidad, Cookies y Términos",
    description: "Configura y personaliza las páginas de Política de Privacidad, Política de Cookies y Términos de Servicio de tu restaurante.",
    category: "Políticas"
  }
};

// Guide categories structure
const guideCategories = [
  {
    title: "Primeros Pasos",
    slug: "primeros-pasos",
    items: [{ id: "introduccion", title: "Introducción", icon: FileText }],
  },
  {
    title: "Panel Principal",
    slug: "panel-principal",
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
    slug: "configuracion-dominio",
    items: [{ id: "dominio-personalizado", title: "Dominio Personalizado", icon: Globe }],
  },
  {
    title: "Configuración de Email",
    slug: "configuracion-email",
    items: [{ id: "configuracion-email", title: "Correo Electrónico", icon: Mail }],
  },
  {
    title: "Reservas",
    slug: "reservas",
    items: [
      { id: "horarios-reserva", title: "Horarios de Reserva", icon: FileText },
      { id: "configuracion-mesas", title: "Configuración de Mesas", icon: FileText },
      { id: "disponibilidad-reservas", title: "Disponibilidad", icon: FileText },
      { id: "lista-reservas", title: "Lista de Reservas", icon: FileText },
      { id: "calendario-reservas", title: "Calendario", icon: FileText },
    ],
  },
  {
    title: "Analíticas",
    slug: "analiticas",
    items: [
      { id: "introduccion-analiticas", title: "Introducción a Analíticas", icon: FileText },
      { id: "metricas", title: "Entendiendo las Métricas", icon: FileText },
      { id: "estadisticas-uso", title: "Estadísticas de Uso", icon: FileText },
      { id: "configurar-google-analytics", title: "Configurar Google Analytics", icon: FileText },
      { id: "configurar-google-search-console", title: "Configurar Google Search Console", icon: FileText },
    ],
  },
  {
    title: "Soporte",
    slug: "soporte",
    items: [
      { id: "como-obtener-soporte", title: "Cómo Obtener Soporte", icon: FileText },
      { id: "crear-tickets", title: "Crear Tickets", icon: FileText },
      { id: "historial-tickets", title: "Historial de Tickets", icon: FileText },
    ],
  },
  {
    title: "Suscripción",
    slug: "suscripcion",
    items: [
      { id: "gestionar-suscripcion", title: "Gestionar Suscripción", icon: FileText },
      { id: "metodos-pago", title: "Métodos de Pago", icon: FileText },
      { id: "cambios-plan", title: "Cambios de Plan", icon: FileText },
      { id: "informacion-facturacion", title: "Información de Facturación", icon: FileText },
    ],
  },
  {
    title: "Políticas",
    slug: "politicas",
    items: [
      { id: "libro-reclamaciones", title: "Libro de Reclamaciones", icon: FileText },
      { id: "paginas-politicas", title: "Páginas de Políticas", icon: FileText },
    ],
  },
];

export default function ClientGuides() {
  const { toast } = useToast();
  const { category, guide } = useParams<{ category?: string; guide?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedNS1, setCopiedNS1] = useState(false);
  const [copiedNS2, setCopiedNS2] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  
  // Check if we're on the public route
  const isPublicRoute = location.pathname.startsWith('/guias');
  
  // Redirect to introduction if no guide is specified
  if (!category || !guide) {
    return <Navigate to="/guias/primeros-pasos/introduccion" replace />;
  }
  
  // Map URL params to guide IDs
  const getGuideIdFromUrl = () => {
    return guide;
  };
  
  const activeGuide = getGuideIdFromUrl();
  
  // Get current guide metadata
  const currentMetadata = guideMetadata[activeGuide] || {
    title: "Guías - Mi Restaurante Online",
    description: "Guías completas para gestionar tu restaurante online.",
    category: "Guías"
  };

  // Get breadcrumb path
  const getBreadcrumbPath = () => {
    const items = [];
    items.push({ name: "Inicio", url: "/" });
    items.push({ name: "Guías", url: "/guias/primeros-pasos/introduccion" });
    if (category && guide) {
      const cat = guideCategories.find(c => c.slug === category);
      if (cat) {
        items.push({ name: cat.title, url: `/guias/${category}/${guide}` });
        const item = cat.items.find(i => i.id === guide);
        if (item && guide !== "introduccion") {
          items.push({ name: item.title, url: `/guias/${category}/${guide}` });
        }
      }
    }
    return items;
  };

  const breadcrumbPath = getBreadcrumbPath();

  useEffect(() => {
    const fetchClientId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_clients")
          .select("client_id")
          .eq("user_id", user.id)
          .single();
        if (data) {
          setClientId(data.client_id);
        }
      }
    };
    fetchClientId();
  }, []);

  const nameserver1 = "craig.ns.cloudflare.com";
  const nameserver2 = "uma.ns.cloudflare.com";

  const copyToClipboard = (text: string, nsNumber: number) => {
    navigator.clipboard.writeText(text);
    if (nsNumber === 1) {
      setCopiedNS1(true);
      setTimeout(() => setCopiedNS1(false), 2000);
    } else {
      setCopiedNS2(true);
      setTimeout(() => setCopiedNS2(false), 2000);
    }
    toast({
      title: "Copiado",
      description: "Nameserver copiado al portapapeles",
    });
  };

  const renderGuideContent = () => {
    switch (activeGuide) {
      case "introduccion":
        return (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Bienvenido a las Guías de Mi Restaurante Online</CardTitle>
                <CardDescription className="text-base">
                  Todo lo que necesitas saber para gestionar tu restaurante online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  En esta sección encontrarás guías detalladas para configurar y gestionar todos los aspectos de tu restaurante online. 
                  Explora las diferentes categorías a continuación para encontrar la información que necesitas.
                </p>
              </CardContent>
            </Card>

            {guideCategories
              .filter(cat => !(cat.slug === "primeros-pasos" && activeGuide === "introduccion"))
              .map((cat) => {
              const CategoryIcon = cat.items[0]?.icon;
              return (
                <Card key={cat.slug}>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2">
                      {CategoryIcon && <CategoryIcon className="h-5 w-5" />}
                      {cat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {cat.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.id}
                            to={`/guias/${cat.slug}/${item.id}`}
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted transition-colors group"
                          >
                            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                              {item.title}
                            </span>
                            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      
      case "dominio-personalizado":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cómo Configurar tu Dominio Personalizado con NameCheap</CardTitle>
              <CardDescription>
                Sigue estos pasos para conectar tu dominio personalizado a tu restaurante online
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Video Tutorial Placeholder */}
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Video Tutorial Próximamente</p>
                  <p className="text-sm text-muted-foreground">
                    Aquí aparecerá un video tutorial completo del proceso
                  </p>
                </div>
              </div>

              {/* Step 1: Buy a Domain */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Comprar un Dominio en NameCheap</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Si aún no tienes un dominio, necesitas comprarlo primero:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>
                          Ve a{" "}
                          <a
                            href="https://www.namecheap.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            namecheap.com
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                        <li>En la barra de búsqueda de la página principal, escribe el nombre de dominio que deseas (ej: mirestaurante.com)</li>
                        <li>Haz clic en el botón "Search" para verificar la disponibilidad</li>
                      </ol>
                      
                      <div className="border rounded-lg overflow-hidden my-4">
                        <img src={namecheapStep1} alt="Barra de búsqueda de NameCheap" className="w-full" />
                      </div>

                      <ol start={4} className="list-decimal list-inside space-y-2 ml-4">
                        <li>Si el dominio está disponible, verás un botón "Add to Cart" (Agregar al carrito). Si muestra "TAKEN" (Ocupado), el dominio no está disponible y debes buscar otro nombre</li>
                      </ol>

                      <div className="border rounded-lg overflow-hidden my-4">
                        <img src={namecheapStep2} alt="Dominio ocupado (TAKEN)" className="w-full" />
                      </div>

                      <ol start={5} className="list-decimal list-inside space-y-2 ml-4">
                        <li>Cuando encuentres un dominio disponible, selecciona la extensión que prefieras (.com, .pe, .restaurant, etc.) y haz clic en "Add to cart"</li>
                        <li>Completa el proceso de compra siguiendo las instrucciones en pantalla</li>
                      </ol>

                      <div className="border rounded-lg overflow-hidden my-4">
                        <img src={namecheapStep3} alt="Dominio disponible con botón Add to cart" className="w-full" />
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          💡 <strong>Consejo:</strong> Si es la primera vez que compras un dominio con NameCheap, es posible que veas un código de descuento disponible (como se muestra en la imagen). Los dominios .com son los más populares, pero puedes elegir otras extensiones según tu preferencia y disponibilidad.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Check Domain Availability */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Verificar Disponibilidad del Dominio</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Antes de comprar, verifica que el dominio esté disponible:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Usa el buscador de NameCheap en la página principal</li>
                        <li>Si el dominio está tomado, verás alternativas sugeridas</li>
                        <li>Puedes probar diferentes extensiones (.com, .net, .pe, etc.)</li>
                        <li>También puedes agregar palabras como "restaurant", "cocina", "bistro", etc. a tu nombre</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Configure Nameservers */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Configurar los Nameservers</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Una vez que hayas completado la compra de tu dominio, debes configurar los nameservers para apuntar a Cloudflare:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Después de confirmar tu compra, desplázate hacia abajo hasta la sección "Domain Registration" y haz clic en el botón rojo grande que dice "Manage" (Administrar)</li>
                        <li>En la página de gestión del dominio, desplázate hasta encontrar la sección "Nameservers"</li>
                        <li>En el menú desplegable (que por defecto está configurado como "Namecheap BasicDNS"), selecciona "Custom DNS"</li>
                        <li>Copia los siguientes nameservers de esta página y pégalos en los campos correspondientes de NameCheap:</li>
                      </ol>

                      <div className="space-y-3 mt-4">
                        <div className="bg-primary rounded-lg p-4 space-y-3">
                          <div>
                            <label className="text-sm font-medium block mb-2 text-white">Nameserver 1:</label>
                            <div className="flex gap-2">
                              <code className="flex-1 bg-background border rounded px-3 py-2 font-mono text-sm">
                                {nameserver1}
                              </code>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(nameserver1, 1)}
                              >
                                {copiedNS1 ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium block mb-2 text-white">Nameserver 2:</label>
                            <div className="flex gap-2">
                              <code className="flex-1 bg-background border rounded px-3 py-2 font-mono text-sm">
                                {nameserver2}
                              </code>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(nameserver2, 2)}
                              >
                                {copiedNS2 ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mt-4">
                        La imagen a continuación muestra dónde debes pegar los nameservers en tu cuenta de NameCheap:
                      </p>

                      <div className="border rounded-lg overflow-hidden my-4">
                        <img src={namecheapStep4} alt="Configuración de nameservers en NameCheap" className="w-full" />
                      </div>

                      <ol start={5} className="list-decimal list-inside space-y-2 ml-4 mt-4">
                        <li>Haz clic en el botón verde de confirmación (✓) que aparece al lado derecho para guardar los cambios</li>
                        <li>NameCheap mostrará un mensaje de confirmación indicando que los nameservers han sido actualizados</li>
                      </ol>

                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          ⏱️ <strong>Tiempo de Propagación:</strong> Los cambios de nameservers pueden tardar entre 5 minutos y 48 horas en propagarse completamente, aunque normalmente toma entre 30 minutos y 2 horas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Verification */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Verificación y Activación</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Después de configurar los nameservers:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Espera entre 30 minutos y 2 horas para que los DNS se propaguen</li>
                        <li>Nuestro sistema verificará automáticamente la configuración</li>
                        <li>Una vez verificado, se generará automáticamente un certificado SSL gratuito</li>
                        <li>Tu dominio personalizado estará activo y seguro con HTTPS</li>
                      </ol>

                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✅ <strong>¡Listo!</strong> Una vez completados estos pasos, tu restaurante estará accesible desde tu dominio personalizado con conexión segura HTTPS.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Help */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">¿Necesitas Ayuda?</h3>
                <p className="text-muted-foreground mb-4">
                  Si tienes problemas con la configuración de tu dominio, nuestro equipo de soporte está aquí para ayudarte.
                </p>
                <Button variant="outline" asChild>
                  <a href="/client/support" target="_blank" rel="noopener noreferrer">
                    Contactar Soporte
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      
      case "informacion-general":
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Información General del Restaurante</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Configura los datos básicos de tu restaurante que aparecerán en todo el sitio web
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Navigation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-primary">📍</span>
                  ¿Dónde encuentro esta configuración?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                  <p className="font-medium">
                    Panel Principal → Pestaña <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-sm">General</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Esta es la primera pestaña que verás al entrar a tu panel de control
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fields Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Campos Disponibles</CardTitle>
                <CardDescription>
                  Estos son todos los campos que puedes configurar en la sección de información general
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Required Field */}
                <div className="p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                  <div className="flex items-start gap-3">
                    <Badge variant="destructive" className="shrink-0 mt-0.5">Obligatorio</Badge>
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-2">Nombre del Restaurante</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        El nombre oficial de tu restaurante que aparecerá en todo el sitio web, incluyendo el título de la página, encabezado y pie de página. Este campo es obligatorio y debe ser único.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Fields Group */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">Información de Contacto</h4>
                  
                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📧 Email
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Correo electrónico de contacto oficial para tu restaurante. Este email aparecerá en la sección de contacto y será visible para tus clientes. Debe ser un email válido y preferiblemente profesional.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      🏢 Razón Social
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Nombre legal o razón social de tu empresa o restaurante. Este nombre se utilizará para la facturación y documentos oficiales. Es importante mantenerlo actualizado para cumplir con requisitos fiscales.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📄 RUC
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Registro Único de Contribuyentes (RUC) de tu restaurante. Este número es requerido para la emisión de comprobantes electrónicos y facturación. Ingresa solo los dígitos, sin guiones ni espacios.
                    </p>
                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                      <strong>Formato Perú:</strong> 11 dígitos (ejemplo: 20123456789)
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📞 Teléfono
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Número de teléfono principal de contacto. Usa el selector desplegable para elegir el código de país (+51 para Perú) y luego ingresa solo los dígitos del número. Ejemplo: 987 654 321
                    </p>
                    <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                      <strong>Formato:</strong> Código de país + número local (sin espacios ni guiones)
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      💬 WhatsApp
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Número de WhatsApp para que los clientes puedan contactarte directamente desde tu sitio web. Usa el selector de código de país y escribe los dígitos del número. Este número se usará para enlaces directos de WhatsApp.
                    </p>
                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded text-xs text-green-800 dark:text-green-200">
                      <strong>💡 Consejo:</strong> Asegúrate de que este número tenga WhatsApp activo
                    </div>
                  </div>
                </div>

                {/* Location Fields Group */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">Ubicación</h4>
                  
                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📍 Dirección
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Dirección completa y detallada de tu restaurante. Esta dirección se mostrará en la página de contacto y será utilizada para generar el mapa. Puedes usar múltiples líneas para mayor claridad (calle, número, distrito, ciudad).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      🎯 Usar Coordenadas Específicas
                      <Badge variant="outline">Switch</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Activa este interruptor para usar coordenadas GPS exactas en lugar de la dirección automática para los mapas. Útil cuando:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                      <li>• La dirección no se encuentra correctamente en Google Maps</li>
                      <li>• Quieres señalar una entrada específica del local</li>
                      <li>• Tu restaurante está en una zona con direcciones poco precisas</li>
                    </ul>
                  </div>
                </div>

                {/* Regional Settings Group */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">Configuración Regional</h4>
                  
                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      🌍 País
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Selecciona el país donde se ubica tu restaurante (ejemplo: 🇵🇪 Perú). Esta configuración es importante para:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                      <li>• Optimización SEO en motores de búsqueda locales</li>
                      <li>• Formato correcto de fechas y números</li>
                      <li>• Configuración regional del sitio web</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      🕐 Zona Horaria
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Selecciona la zona horaria correcta de tu ubicación (ejemplo: America/Lima UTC-5). Esta configuración asegura que:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                      <li>• Las reservas se muestren en el horario local correcto</li>
                      <li>• Los horarios de apertura sean precisos para tus clientes</li>
                      <li>• Las notificaciones lleguen en el momento adecuado</li>
                    </ul>
                    <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-xs text-amber-800 dark:text-amber-200">
                      <strong>⚠️ Importante:</strong> Si usas el sistema de reservas, esta configuración es crítica
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      💱 Moneda
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Símbolo de moneda que se mostrará junto a los precios en el menú de tu sitio web. Ejemplos comunes: S/ (Sol Peruano), $ (Dólar), € (Euro), MX$ (Peso Mexicano).
                    </p>
                  </div>
                </div>

                {/* Custom CTA Button Configuration */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">Botón CTA Personalizado</h4>
                  
                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-gradient-to-br from-primary/5 to-transparent">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      ⭐ Texto del Botón CTA Personalizado
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      Personaliza el texto de un botón adicional de llamada a la acción en la barra de navegación superior. Ejemplos efectivos:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-background rounded border">🎯 "Reservar Mesa"</div>
                      <div className="p-2 bg-background rounded border">🎁 "Ver Promociones"</div>
                      <div className="p-2 bg-background rounded border">🚚 "Pedir Delivery"</div>
                      <div className="p-2 bg-background rounded border">📋 "Ver Carta"</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Si se deja vacío, el botón no aparecerá en el sitio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-gradient-to-br from-primary/5 to-transparent">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      🔗 Enlace del Botón CTA Personalizado
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      URL completa a la que dirigirá el botón CTA personalizado cuando los usuarios hagan clic. Puede ser:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                      <li>• Enlace directo de WhatsApp: <code className="text-xs bg-muted px-1 py-0.5 rounded">https://wa.me/51987654321</code></li>
                      <li>• Formulario de reservas externo</li>
                      <li>• Página de promociones especiales</li>
                      <li>• Plataforma de delivery (Rappi, PedidosYa, etc.)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices Card */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span>💡</span> Mejores Prácticas y Consejos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">Mantén todos los datos de contacto <strong>actualizados y verificados</strong> regularmente</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">Usa números con el <strong>código de país correcto</strong> para evitar problemas de comunicación</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">Verifica que tu <strong>número de WhatsApp esté activo</strong> antes de publicarlo</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">Si tu dirección no aparece bien en mapas, <strong>activa coordenadas específicas</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">La <strong>zona horaria correcta</strong> es esencial si usas reservas online</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">El botón CTA personalizado es ideal para <strong>destacar tu acción principal</strong> (reservas, promociones)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">Prueba diferentes textos de CTA para ver cuál <strong>genera más conversiones</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">Siempre haz clic en <strong>"Guardar"</strong> después de realizar cambios (observa el indicador de estado)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Save Reminder Card */}
            <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                      Recuerda Guardar tus Cambios
                    </h4>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Después de editar cualquier información, asegúrate de hacer clic en el botón <strong>"Guardar"</strong> en la parte superior derecha. Verás un indicador de estado que cambia de "Sin guardar" (punto rojo) a "Guardado" (punto verde) cuando los cambios se hayan aplicado exitosamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "horarios-apertura":
        return (
          <div className="space-y-6">
            {/* Header Section */}
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Horarios de Apertura</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Configura los horarios de atención de tu restaurante para cada día de la semana
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Navigation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-primary">📍</span>
                  ¿Dónde encuentro esta configuración?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-lg border-l-4 border-primary">
                  <p className="font-medium">
                    Panel Principal → Pestaña <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono text-sm">Horarios</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Esta pestaña te permite configurar los horarios de apertura y cierre para cada día de la semana
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* How it Works Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cómo Configurar los Horarios</CardTitle>
                <CardDescription>
                  Sigue estos pasos para establecer los horarios de atención de tu restaurante
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Step by Step */}
                  <div className="p-4 border-2 border-primary/30 rounded-lg bg-primary/5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span className="text-primary">📝</span>
                      Para cada día de la semana
                    </h4>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          1
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Activa o desactiva el día</p>
                          <p className="text-sm text-muted-foreground">
                            Usa el <Badge variant="outline">Switch</Badge> para indicar si el restaurante está <strong>Abierto</strong> (switch activado) o <strong>Cerrado</strong> (switch desactivado) ese día
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          2
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Selecciona hora de apertura</p>
                          <p className="text-sm text-muted-foreground">
                            Si el día está abierto, elige la hora en que abres usando el <strong>primer campo de tiempo</strong>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          3
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Selecciona hora de cierre</p>
                          <p className="text-sm text-muted-foreground">
                            Establece la hora de cierre en el <strong>segundo campo de tiempo</strong>. Los horarios se muestran en <strong>formato AM/PM</strong> (12 horas)
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                          4
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Guarda los cambios</p>
                          <p className="text-sm text-muted-foreground">
                            Haz clic en el botón <strong>"Guardar"</strong> en la parte superior derecha cuando termines
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Example */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold mb-3 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <span>📌</span> Ejemplo Visual
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-background rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">🗓️ Lunes</span>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Abierto</Badge>
                        </div>
                        <div className="flex gap-2 text-sm">
                          <div className="flex-1 p-2 bg-muted rounded">
                            <span className="text-muted-foreground">Apertura:</span> <strong>9:00 AM</strong>
                          </div>
                          <div className="flex-1 p-2 bg-muted rounded">
                            <span className="text-muted-foreground">Cierre:</span> <strong>10:00 PM</strong>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-background rounded border opacity-60">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">🗓️ Domingo</span>
                          <Badge variant="secondary">Cerrado</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Los campos de hora están deshabilitados cuando el día está marcado como cerrado
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Days of the Week Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Días Disponibles para Configurar</CardTitle>
                <CardDescription>
                  Puedes configurar horarios individuales para cada uno de estos días
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { day: 'Lunes', emoji: '📅' },
                    { day: 'Martes', emoji: '📅' },
                    { day: 'Miércoles', emoji: '📅' },
                    { day: 'Jueves', emoji: '📅' },
                    { day: 'Viernes', emoji: '📅' },
                    { day: 'Sábado', emoji: '📅' },
                    { day: 'Domingo', emoji: '📅' },
                  ].map((item) => (
                    <div key={item.day} className="p-3 border rounded-lg text-center hover:border-primary/50 transition-colors">
                      <div className="text-2xl mb-1">{item.emoji}</div>
                      <div className="font-medium text-sm">{item.day}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Important Notes Card */}
            <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-100">
                  <span>⚠️</span> Notas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-amber-600 dark:text-amber-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Formato AM/PM:</strong> Los horarios se muestran en formato de 12 horas con AM/PM (ejemplo: 2:00 PM para las 14:00 horas, 9:00 AM para las 09:00 horas)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-600 dark:text-amber-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Horario continuo:</strong> Si tu restaurante tiene horarios de almuerzo y cena separados, usa el horario más amplio (desde que abres hasta que cierras definitivamente)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-600 dark:text-amber-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Actualización automática:</strong> Los horarios configurados aparecerán automáticamente en todas las páginas relevantes de tu sitio web
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-amber-600 dark:text-amber-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Días festivos:</strong> Recuerda actualizar los horarios temporalmente para días festivos o eventos especiales
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Best Practices Card */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span>💡</span> Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Sé preciso:</strong> Usa horarios exactos para evitar confusión con tus clientes
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Mantén actualizado:</strong> Revisa y actualiza tus horarios regularmente, especialmente en temporadas altas o bajas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Coherencia:</strong> Asegúrate de que los horarios en tu sitio web coincidan con los de tus redes sociales y Google My Business
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Comunicación:</strong> Si cierras temporalmente por mantenimiento o vacaciones, actualiza los horarios o añade un mensaje en la página de contacto
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Sistema de reservas:</strong> Si usas reservas online, asegúrate de que los horarios reflejen correctamente cuándo aceptas reservas
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Save Reminder Card */}
            <Card className="border-2 border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💾</div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">
                      No Olvides Guardar
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Después de configurar los horarios de todos los días, haz clic en <strong>"Guardar"</strong> en la parte superior derecha. El indicador de estado cambiará de <span className="text-destructive font-medium">"Sin guardar"</span> (punto rojo) a <span className="text-green-600 dark:text-green-400 font-medium">"Guardado"</span> (punto verde) cuando se apliquen los cambios exitosamente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "redes-sociales":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">Configuración de Redes Sociales</h2>
              <p className="text-lg text-muted-foreground">
                Conecta las redes sociales de tu restaurante para que tus clientes puedan encontrarte y seguirte fácilmente.
              </p>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Ubicación de la Configuración
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">Navega a:</p>
                <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm">
                  Panel Principal → Sección "Redes Sociales"
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Redes Sociales Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Puedes configurar enlaces a las siguientes plataformas:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2">📘 Facebook</div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded">
                        https://facebook.com/turestaurante
                      </code>
                    </CardContent>
                  </Card>

                  <Card className="border-pink-200 bg-pink-50/50 dark:bg-pink-950/20">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2">📷 Instagram</div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded">
                        https://instagram.com/turestaurante
                      </code>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-gray-50/50 dark:bg-gray-950/20">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2">✖️ X (Twitter)</div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded">
                        https://x.com/turestaurante
                      </code>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-950/20">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2">🎵 TikTok</div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded">
                        https://tiktok.com/@turestaurante
                      </code>
                    </CardContent>
                  </Card>

                  <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2">🎬 YouTube</div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded">
                        https://youtube.com/@turestaurante
                      </code>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-300 bg-blue-100/50 dark:bg-blue-900/20">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2">💼 LinkedIn</div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded">
                        https://linkedin.com/company/turestaurante
                      </code>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-green-900 dark:text-green-100">💡 Mejores Prácticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-green-900 dark:text-green-100">
                <div className="flex gap-2">
                  <span>✅</span>
                  <div>
                    <strong>Usa URLs completas:</strong> Siempre incluye "https://" al inicio de cada enlace
                  </div>
                </div>
                <div className="flex gap-2">
                  <span>✅</span>
                  <div>
                    <strong>Verifica los enlaces:</strong> Asegúrate de que cada URL lleve al perfil correcto antes de guardar
                  </div>
                </div>
                <div className="flex gap-2">
                  <span>✅</span>
                  <div>
                    <strong>Solo completa las que uses:</strong> Deja en blanco las redes sociales que no utilizas
                  </div>
                </div>
                <div className="flex gap-2">
                  <span>✅</span>
                  <div>
                    <strong>Mantén actualizado:</strong> Si cambias de usuario o perfil, actualiza el enlace aquí
                  </div>
                </div>
                <div className="flex gap-2">
                  <span>✅</span>
                  <div>
                    <strong>Aparición automática:</strong> Los iconos de redes sociales aparecerán automáticamente en el footer de tu sitio
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Guardar Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Después de completar los campos que necesites, haz clic en el botón <strong>Guardar</strong> en la parte superior derecha de la pantalla. Los iconos de redes sociales aparecerán automáticamente en tu sitio web.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "informacion-delivery":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold mb-4">Enlaces de Plataformas de Delivery</h2>
              <p className="text-lg text-muted-foreground">
                Conecta tu restaurante con plataformas de delivery para que tus clientes puedan ordenar fácilmente.
              </p>
            </div>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Ubicación de la Configuración
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">Navega a:</p>
                <div className="bg-muted/50 p-3 rounded-lg font-mono text-sm">
                  Panel Principal → Pestaña <Badge variant="outline">Contacto</Badge> → Sección "Información de Delivery"
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  ¿Qué Son Estos Enlaces?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  En esta sección puedes agregar los enlaces directos a las páginas de tu restaurante en plataformas 
                  de delivery. Cuando los clientes visiten tu sitio web, podrán hacer clic en estos enlaces para 
                  hacer pedidos a través de estas plataformas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Cómo Agregar Enlaces
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ol className="space-y-3 list-decimal list-inside">
                  <li className="text-muted-foreground">
                    <strong className="text-foreground">Copia el enlace completo</strong> de tu perfil en cada plataforma de delivery
                  </li>
                  <li className="text-muted-foreground">
                    <strong className="text-foreground">Pégalo en el campo correspondiente</strong> en la sección de Información de Delivery
                  </li>
                  <li className="text-muted-foreground">
                    <strong className="text-foreground">Guarda los cambios</strong> haciendo clic en el botón de guardar
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🚀 Plataformas Disponibles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-3">
                  Puedes agregar enlaces a las siguientes plataformas:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Card className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2 text-orange-600 dark:text-orange-400 flex items-center gap-2">
                        🛵 Rappi
                      </div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded block">
                        rappi.com/restaurantes/...
                      </code>
                    </CardContent>
                  </Card>

                  <Card className="bg-red-50/50 dark:bg-red-950/20 border-red-200">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2 text-red-600 dark:text-red-400 flex items-center gap-2">
                        🍔 PedidosYa
                      </div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded block">
                        pedidosya.com.mx/...
                      </code>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="font-semibold mb-2 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        🚗 DiDi Food
                      </div>
                      <code className="text-xs bg-background/80 px-2 py-1 rounded block">
                        didifood.com/es-MX/...
                      </code>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span>💡</span> Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Usa URLs completas:</strong> Incluye "https://" al inicio de cada enlace
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Verifica los enlaces:</strong> Prueba cada enlace en una ventana privada para asegurarte de que funciona correctamente
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Solo lo que uses:</strong> Deja vacíos los campos de plataformas donde no estés activo
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Mantén actualizado:</strong> Si cambias tu URL en alguna plataforma, actualízala también aquí
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Guardar Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Después de agregar tus enlaces, no olvides hacer clic en el botón <strong>Guardar</strong> en la parte superior derecha. Los enlaces aparecerán automáticamente en tu sitio web para que tus clientes puedan acceder a ellos.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "marca-personalizacion":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Marca y Personalización</h1>
              <p className="text-muted-foreground">
                Navega a: Panel Principal → Pestaña <Badge variant="secondary" className="mx-1">Configuración</Badge> → Sección "Personalización"
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  ¿Qué Puedes Personalizar?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta sección te permite personalizar completamente el diseño visual de tu sitio web: 
                  colores, logos, fuentes, tema y más.
                </p>
              </CardContent>
            </Card>

            {/* Color Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Color Principal de tu Marca
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  El color principal define la identidad visual de tu sitio web. Este color se aplicará en:
                </p>
                
                <div className="grid gap-2">
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Botones principales (reservar, ver menú, contactar)</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Enlaces y elementos interactivos</span>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Elementos destacados y llamadas a la acción</span>
                  </div>
                </div>

                <div className="mt-4 p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Palette className="h-4 w-4 text-primary" />
                    Cómo Seleccionar tu Color
                  </h4>
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="font-bold text-primary">1.</span>
                      <span>Haz clic en el <strong>selector de color</strong></span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-primary">2.</span>
                      <span>Elige tu color visualmente usando el selector</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-primary">3.</span>
                      <span>O ingresa un código hexadecimal (ej: <code className="bg-background px-2 py-0.5 rounded">#22c55e</code>)</span>
                    </li>
                  </ol>
                </div>

                <Alert className="border-amber-500/50 bg-amber-500/10">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-amber-700 dark:text-amber-400">Confirmación de Cambio</AlertTitle>
                  <AlertDescription className="text-foreground/80 text-sm">
                    Al cambiar el color principal aparecerá un popup de confirmación porque el cambio afecta 
                    toda la identidad visual de tu sitio web instantáneamente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Configuración de Tema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Configuración de Tema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Tema (Claro u Oscuro)
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Controla el tema visual general de tu sitio web. Puedes elegir entre tema claro u oscuro.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <Sun className="h-5 w-5 mb-2" />
                      <p className="font-medium text-sm">Tema Claro</p>
                      <p className="text-xs text-muted-foreground">Fondos blancos, profesional</p>
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <Moon className="h-5 w-5 mb-2" />
                      <p className="font-medium text-sm">Tema Oscuro</p>
                      <p className="text-xs text-muted-foreground">Fondos oscuros, moderno</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    Opacidad de Superposición del Hero
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Controla qué tan oscura es la capa sobre la imagen de fondo del hero (sección principal). 
                    Un valor más alto (ej: 80%) hace que el texto sea más legible, pero oscurece más la imagen.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Plantilla del Sitio */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Plantilla del Sitio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Layout className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Modern Restaurant (Plantilla Actual)</p>
                    <p className="text-sm text-muted-foreground">
                      La plantilla controla el diseño y estructura general de tu sitio web, 
                      incluyendo la disposición de las secciones y el estilo visual.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Logo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Configuración de Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
                      Logo del Header
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Logo que aparece en la parte superior de tu sitio (barra de navegación).
                    </p>
                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline">Subir Imagen</Badge>
                      <span className="text-muted-foreground">o</span>
                      <Badge variant="outline">URL</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
                      Logo del Footer
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Logo que aparece en el pie de página de tu sitio.
                    </p>
                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline">Subir Imagen</Badge>
                      <span className="text-muted-foreground">o</span>
                      <Badge variant="outline">URL</Badge>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Image className="h-4 w-4 text-primary" />
                      Favicon
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Icono pequeño que aparece en la pestaña del navegador junto al título de tu página. 
                      Se recomienda formato PNG o ICO, con tamaño de 32x32px o 512x512px.
                    </p>
                    <div className="flex gap-2 text-sm">
                      <Badge variant="outline">Subir Imagen</Badge>
                      <span className="text-muted-foreground">o</span>
                      <Badge variant="outline">URL</Badge>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Formatos de Imagen</AlertTitle>
                  <AlertDescription className="text-sm">
                    Para mejores resultados, usa imágenes PNG con fondo transparente para los logos. 
                    El favicon debe ser cuadrado (32x32 o 512x512 píxeles).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Tipografía */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Tipografía
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Personaliza las fuentes que se usan en tu sitio web para darle un estilo único.
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" />
                      Fuente de Títulos
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tipografía utilizada para todos los títulos de tu sitio (H1, H2, H3, etc.)
                    </p>
                    <p className="text-sm">
                      <Badge variant="secondary">Ejemplo: Merriweather</Badge>
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-primary" />
                      Peso de Fuente de Títulos
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Grosor de la fuente para los títulos. Valores más altos = texto más grueso.
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-background rounded text-center">
                        <p className="font-light text-lg">Aa</p>
                        <p className="text-muted-foreground">300 - Light</p>
                      </div>
                      <div className="p-2 bg-background rounded text-center">
                        <p className="font-normal text-lg">Aa</p>
                        <p className="text-muted-foreground">400 - Normal</p>
                      </div>
                      <div className="p-2 bg-background rounded text-center">
                        <p className="font-bold text-lg">Aa</p>
                        <p className="text-muted-foreground">700 - Bold</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" />
                      Fuente del Cuerpo
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tipografía para el texto del cuerpo de tu sitio (párrafos, descripciones, etc.)
                    </p>
                    <p className="text-sm">
                      <Badge variant="secondary">Ejemplo: Montserrat</Badge>
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-primary" />
                      Escala de Tamaño de Títulos
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Ajusta el tamaño de todos los títulos proporcionalmente. Opciones: 25% más pequeño, 
                      tamaño normal, o 25% más grande.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span>💡</span> Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Coherencia de marca:</strong> Usa colores y fuentes que ya uses en otros materiales de tu restaurante
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Legibilidad primero:</strong> Asegúrate de que el texto sea fácil de leer en todos los dispositivos
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Logos de alta calidad:</strong> Usa imágenes PNG con fondo transparente para mejor apariencia
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Prueba en diferentes dispositivos:</strong> Revisa cómo se ve tu sitio en móvil, tablet y desktop
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Evita cambios frecuentes:</strong> Mantén tu identidad visual consistente para que tus clientes te reconozcan
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Guardar Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Después de realizar tus personalizaciones, haz clic en el botón <strong>"Guardar Configuración"</strong>. 
                  Los cambios se aplicarán inmediatamente en tu sitio web. Te recomendamos visitar tu sitio en una 
                  ventana privada para ver cómo se ve con los nuevos cambios.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "navegacion-visibilidad":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Navegación y Visibilidad</h1>
              <p className="text-muted-foreground">
                Navega a: Panel Principal → Pestaña <Badge variant="secondary" className="mx-1">Configuración</Badge> → Pestaña <Badge variant="secondary" className="mx-1">Navegación y Visibilidad</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  ¿Qué Controla Esta Sección?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta sección te permite controlar la navegación de tu sitio web: botones del menú, 
                  popups de WhatsApp, y qué secciones son visibles en cada página.
                </p>
              </CardContent>
            </Card>

            {/* Controles de Navegación y Botones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Controles de Navegación y Botones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Configura la visibilidad y comportamiento de los botones en el menú de navegación.
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Ocultar Botón de WhatsApp del Menú
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Controla si el botón de WhatsApp aparece en el menú de navegación superior.
                    </p>
                    <Badge variant="outline">Switch: Visible / Oculto</Badge>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Ocultar Botón de Teléfono del Menú
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Controla si el botón de teléfono aparece en el menú de navegación superior.
                    </p>
                    <Badge variant="outline">Switch: Visible / Oculto</Badge>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Mostrar Popup de WhatsApp
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Habilita un popup flotante de WhatsApp que aparece en todas las páginas del sitio.
                    </p>
                    <Badge variant="outline">Switch: Habilitado / Deshabilitado</Badge>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Type className="h-4 w-4 text-primary" />
                      Texto del Botón CTA Personalizado
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Personaliza el texto del botón de llamada a la acción en el menú de navegación.
                    </p>
                    <div className="mt-2">
                      <code className="text-sm bg-background px-3 py-1.5 rounded border">
                        Ejemplo: "Contactar", "Reservar", "Ordenar Ahora"
                      </code>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      Enlace del Botón CTA Personalizado
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Define a dónde lleva el botón CTA cuando los usuarios hacen clic.
                    </p>
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs font-medium mb-1">Ejemplos de enlaces:</p>
                        <div className="space-y-1">
                          <code className="text-xs bg-background px-2 py-1 rounded border block">
                            #contacto (sección en la misma página)
                          </code>
                          <code className="text-xs bg-background px-2 py-1 rounded border block">
                            /menu (página del menú)
                          </code>
                          <code className="text-xs bg-background px-2 py-1 rounded border block">
                            https://ejemplo.com (enlace externo)
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Sobre los Botones del Menú</AlertTitle>
                  <AlertDescription className="text-sm">
                    Los botones de WhatsApp y teléfono ayudan a que los clientes te contacten fácilmente. 
                    Solo ocúltalos si no usas esos canales de comunicación. El botón CTA personalizado 
                    es ideal para destacar tu acción principal (reservar, ver menú, etc.).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Controles de Visibilidad */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Controles de Visibilidad de Secciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Usa los switches (interruptores) para mostrar u ocultar secciones completas de tu sitio web.
                </p>

                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      Página de Inicio
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Acerca de Nosotros</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Estadísticas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Menú</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Servicios</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Reservaciones</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Reseñas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Contacto</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Mapa</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Delivery</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>FAQs</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      Página "Acerca de"
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Sección Acerca de</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Estadísticas en texto</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Sección de Estadísticas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Sección de Equipo</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-500" />
                      Página de Contacto
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Formulario de Contacto</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        <span>Mapa</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Sobre Mostrar/Ocultar Secciones</AlertTitle>
                  <AlertDescription className="text-sm">
                    Ocultar una sección la elimina completamente del sitio. Los visitantes no podrán verla ni acceder a ella. 
                    Úsalo para simplificar tu sitio o remover secciones que no necesites.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>


            {/* Best Practices */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span>💡</span> Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Mantén lo esencial visible:</strong> No ocultes secciones críticas como Menú o Contacto
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Simplifica tu sitio:</strong> Si una sección no aporta valor, es mejor ocultarla
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Piensa en el usuario:</strong> Oculta solo lo que realmente no necesitan ver
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Prueba después de cambios:</strong> Visita tu sitio como visitante para verificar que todo funciona bien
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Considera el mapa:</strong> Si tienes ubicación física, mantén el mapa visible
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Guardar Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Después de configurar la visibilidad de las secciones, haz clic en el botón <strong>"Guardar"</strong>. 
                  Los cambios se aplicarán inmediatamente. Te recomendamos revisar todas las páginas de tu sitio 
                  después de guardar para confirmar que todo se ve como esperas.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "contenido-sitio":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Contenido del Sitio Web</h1>
              <p className="text-muted-foreground">
                Navega a: Panel Principal → Pestaña <Badge variant="secondary" className="mx-1">Configuración</Badge> → Pestaña <Badge variant="secondary" className="mx-1">Contenido</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5 text-primary" />
                  ¿Qué Puedes Editar?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Esta sección te permite personalizar todos los textos, imágenes y la visibilidad de las secciones 
                  de tu sitio web. Controla completamente qué información muestras a tus visitantes.
                </p>
              </CardContent>
            </Card>

            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700 dark:text-amber-400">Confirmación Requerida</AlertTitle>
              <AlertDescription className="text-foreground/80 text-sm space-y-2">
                <p>
                  Al entrar a la pestaña "Contenido" aparecerá un popup de confirmación porque los cambios aquí 
                  afectan directamente cómo los visitantes ven tu restaurante.
                </p>
                <p className="text-xs">
                  <strong>Tip:</strong> Revisa cuidadosamente cada cambio antes de guardarlo y verifica tu sitio después.
                </p>
              </AlertDescription>
            </Alert>

            {/* Seleccionar Página */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Seleccionar Página para Editar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  En la parte superior de la pestaña "Contenido" encontrarás un menú desplegable llamado <strong>"Seleccionar Página"</strong>. 
                  Este te permite elegir qué página del sitio quieres editar.
                </p>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm mb-3">Páginas Disponibles:</h4>
                  
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">🏠 Página Principal</p>
                      <p className="text-xs text-muted-foreground">
                        La página principal de tu sitio. Aquí puedes editar todas las secciones principales como Hero, Acerca de, Menú, Servicios, Reservaciones, Reseñas, y Contacto.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">📖 Página Acerca de</p>
                      <p className="text-xs text-muted-foreground">
                        Página dedicada con información detallada sobre tu restaurante. Incluye la sección principal "Acerca de", estadísticas, y sección de equipo.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">📋 Página Menú</p>
                      <p className="text-xs text-muted-foreground">
                        Página dedicada para mostrar tu menú completo. Personaliza los títulos, descripciones y cómo se presenta tu menú a los visitantes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">📞 Página Contacto</p>
                      <p className="text-xs text-muted-foreground">
                        Página dedicada para que los visitantes se comuniquen contigo. Incluye el formulario de contacto y el mapa de ubicación.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">⭐ Página de Reseñas</p>
                      <p className="text-xs text-muted-foreground">
                        Página dedicada para mostrar todas las reseñas y testimonios de tus clientes. Edita títulos, descripciones y cómo se presentan las reseñas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">🍕 Contenido de Servicios</p>
                      <p className="text-xs text-muted-foreground">
                        Personaliza el contenido de tus servicios adicionales como delivery, catering, eventos privados, etc. Edita títulos, descripciones e íconos de cada servicio.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">📊 Contenido de Estadísticas</p>
                      <p className="text-xs text-muted-foreground">
                        Edita las estadísticas que aparecen en tu sitio, como años de experiencia, platos en el menú, clientes satisfechos, premios ganados, etc.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">📄 Footer</p>
                      <p className="text-xs text-muted-foreground">
                        Personaliza el contenido del pie de página de tu sitio. Incluye información de contacto, enlaces a redes sociales, horarios y derechos de autor.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">💬 Mensajes de WhatsApp</p>
                      <p className="text-xs text-muted-foreground">
                        Configura los mensajes automáticos que se envían cuando alguien hace clic en el botón de WhatsApp. Personaliza el saludo y mensaje inicial.
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Cómo Usar el Selector de Página</AlertTitle>
                  <AlertDescription className="text-sm">
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      <li>Haz clic en el menú desplegable "Seleccionar Página"</li>
                      <li>Elige la página que deseas editar</li>
                      <li>El contenido cambiará para mostrar las secciones de esa página</li>
                      <li>Edita el contenido que necesites</li>
                      <li>Recuerda guardar los cambios antes de salir o cambiar a otra página</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Sección Hero */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Sección Hero (Portada)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  La primera sección que ven los visitantes al entrar a tu sitio. Es la más importante para causar una buena primera impresión.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <Type className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Primera y Segunda Línea del Título</p>
                      <p className="text-xs text-muted-foreground">El texto principal que destaca en grande</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <FileText className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Descripción</p>
                      <p className="text-xs text-muted-foreground">Texto descriptivo debajo del título</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <ImagePlus className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Imagen de Fondo</p>
                      <p className="text-xs text-muted-foreground">La imagen principal de tu portada</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Botón de Acción</p>
                      <p className="text-xs text-muted-foreground">Texto y enlace del botón (ej: "Ver Menú", "Reservar Mesa")</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SEO Warning */}
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-700 dark:text-amber-400">⚠️ Importante para SEO</AlertTitle>
              <AlertDescription className="text-foreground/80 text-sm">
                Cambiar los textos de tu sitio puede afectar tu posicionamiento en Google. 
                Los títulos y descripciones están optimizados para aparecer en búsquedas relevantes. 
                Si haces cambios, asegúrate de mantener las palabras clave importantes relacionadas 
                con tu negocio y ubicación (ej: "restaurante", tu tipo de cocina, tu ciudad).
              </AlertDescription>
            </Alert>

            {/* Cómo Hacer Cambios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Cómo Hacer Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                    <span className="text-sm">Navega a la pestaña <Badge variant="outline">Contenido</Badge> y acepta el popup de advertencia</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                    <span className="text-sm">Desplázate a la sección que deseas modificar</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                    <span className="text-sm">Haz clic en los campos de texto para editar títulos y descripciones</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">4.</span>
                    <span className="text-sm">Usa los switches para mostrar/ocultar secciones completas</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">5.</span>
                    <span className="text-sm">Sube nuevas imágenes haciendo clic en <Badge variant="outline">Subir Imagen</Badge></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">6.</span>
                    <span className="text-sm">Haz clic en <strong>"Guardar Cambios"</strong> al final de la página</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">7.</span>
                    <span className="text-sm">Verifica tu sitio web para ver los cambios aplicados</span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            {/* Best Practices */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span>💡</span> Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Textos concisos:</strong> Los visitantes prefieren mensajes breves y claros
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Imágenes de calidad:</strong> Usa fotos profesionales que representen bien tu restaurante
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>No ocultes lo importante:</strong> Mantén visibles secciones clave como Menú y Contacto
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Revisa ortografía:</strong> Errores de escritura afectan tu profesionalismo
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Guarda frecuentemente:</strong> No pierdas tu trabajo, guarda cada vez que hagas cambios importantes
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Prueba en móvil:</strong> Verifica cómo se ve en teléfonos, la mayoría de visitantes usa móvil
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Actualiza regularmente:</strong> Mantén tu contenido fresco y actualizado
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Guardar Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Después de editar el contenido, haz clic en el botón <strong>"Guardar Cambios"</strong> al final de la página. 
                  Los cambios se aplicarán inmediatamente en tu sitio web. Te recomendamos tomar una captura de pantalla 
                  antes de hacer cambios grandes, por si necesitas recordar cómo estaba antes.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "preguntas-frecuentes":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Preguntas Frecuentes (FAQs)</h1>
              <p className="text-muted-foreground">
                Navega a: Panel Principal → Pestaña <Badge variant="secondary" className="mx-1">FAQs</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  ¿Qué son las FAQs?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Las Preguntas Frecuentes (FAQs) te permiten responder de manera anticipada las dudas más comunes de tus clientes sobre tu restaurante, menú, horarios, reservas, etc. Esto reduce consultas repetitivas y mejora la experiencia del usuario.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Crear una Nueva FAQ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                    <span className="text-sm">Haz clic en el botón <Badge variant="outline">Agregar FAQ</Badge></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                    <span className="text-sm">En el campo <strong>"Pregunta"</strong>, escribe la pregunta que tus clientes suelen hacer</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                    <span className="text-sm">En el campo <strong>"Respuesta"</strong>, proporciona una respuesta clara y completa</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">4.</span>
                    <span className="text-sm">Haz clic en <Badge variant="outline">Guardar</Badge></span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Gestionar FAQs Existentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-primary" />
                    Reordenar
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cambia el orden en que aparecen las preguntas usando los botones de flechas arriba/abajo.
                  </p>
                  <Alert className="border-primary/30 bg-primary/5 mt-3">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      <strong>Consejo:</strong> Coloca las preguntas más importantes o frecuentes al principio.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Edit className="h-4 w-4 text-primary" />
                    Editar
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Haz clic en el botón de editar (ícono de lápiz) para modificar tanto la pregunta como la respuesta de una FAQ existente.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-primary" />
                    Eliminar
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Usa el botón de eliminar (ícono de basurero) para quitar una FAQ que ya no sea relevante.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Ejemplos de Buenas FAQs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm mb-1">❓ ¿Aceptan reservas?</p>
                  <p className="text-sm text-muted-foreground">
                    ✅ Sí, aceptamos reservas por teléfono al [tu número] o a través de nuestro formulario en línea. Recomendamos reservar con al menos 24 horas de anticipación.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm mb-1">❓ ¿Tienen opciones vegetarianas/veganas?</p>
                  <p className="text-sm text-muted-foreground">
                    ✅ Sí, ofrecemos varias opciones vegetarianas y veganas en nuestro menú. Consulta la sección "Vegetariano" en nuestro menú o pregunta a tu mesero.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm mb-1">❓ ¿Cuál es el horario de atención?</p>
                  <p className="text-sm text-muted-foreground">
                    ✅ Abrimos de lunes a sábado de 12:00 PM a 11:00 PM. Los domingos abrimos de 12:00 PM a 9:00 PM. Cerrados los martes.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium text-sm mb-1">❓ ¿Tienen estacionamiento?</p>
                  <p className="text-sm text-muted-foreground">
                    ✅ Sí, contamos con estacionamiento gratuito para nuestros clientes en la parte trasera del restaurante.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Controlar Visibilidad de FAQs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Puedes mostrar u ocultar la sección de FAQs desde: 
                  Panel Principal → Pestaña <Badge variant="outline" className="mx-1">Navegación</Badge> → 
                  Switch <strong>"Mostrar sección de FAQ"</strong>
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Preguntas cortas:</strong> Máximo 1-2 líneas por pregunta
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Respuestas claras:</strong> Completas pero concisas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Actualiza regularmente:</strong> Basándote en las preguntas que recibes frecuentemente
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Información práctica:</strong> Incluye horarios, métodos de pago, políticas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Lenguaje simple:</strong> Evita jerga o términos técnicos
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Cantidad ideal:</strong> Entre 5-10 FAQs (ni muy pocas ni demasiadas)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Limpia periódicamente:</strong> Elimina preguntas que ya no sean frecuentes
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case "carrusel-imagenes":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Carrusel de Imágenes</CardTitle>
              <CardDescription>
                Gestiona el carrusel de imágenes rotatorio en tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro esta configuración?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Panel Principal</strong> → pestaña <strong>"Carousel"</strong> o <strong>"Carrusel de Imágenes"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué es el Carrusel?</h3>
                <p className="text-muted-foreground">
                  El carrusel es una sección que muestra múltiples imágenes rotando automáticamente en tu página de inicio. Es ideal para destacar platos especiales, el ambiente de tu restaurante, eventos especiales, o promociones.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración del Carrusel</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔄 Activar/Desactivar el Carrusel</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Usa el switch <strong>"Habilitar Carousel"</strong> para mostrar u ocultar completamente el carrusel de tu sitio.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Nota:</strong> Cuando está desactivado, el carrusel no aparece en ninguna parte del sitio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📍 Orden de Visualización</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      El campo <strong>"Display Order"</strong> controla en qué posición aparece el carrusel en tu página de inicio.
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Número más bajo = aparece más arriba en la página</li>
                      <li>Por ejemplo: 1 = primera sección, 2 = segunda sección, etc.</li>
                      <li>Puedes colocarlo después del hero, antes del menú, etc.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Agregar Imágenes al Carrusel</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Busca el área de <strong>"Subir Imagen"</strong> o <strong>"Agregar Imagen al Carousel"</strong></li>
                  <li>Haz clic en el botón de carga o arrastra una imagen</li>
                  <li>Selecciona una imagen de alta calidad desde tu computadora</li>
                  <li>Espera a que la imagen se suba correctamente</li>
                  <li>La imagen aparecerá automáticamente en la lista de imágenes del carrusel</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Gestionar Imágenes del Carrusel</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">👀 Vista Previa</h4>
                    <p className="text-sm text-muted-foreground">
                      Todas las imágenes subidas se muestran en miniatura para que puedas ver qué hay en tu carrusel.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🗑️ Eliminar Imágenes</h4>
                    <p className="text-sm text-muted-foreground">
                      Cada imagen tiene un botón de eliminar (ícono de basurero o "X"). Haz clic para quitar la imagen del carrusel.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔄 Rotación Automática</h4>
                    <p className="text-sm text-muted-foreground">
                      Las imágenes rotan automáticamente cada pocos segundos. Los visitantes también pueden navegar manualmente con flechas o puntos indicadores.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recomendaciones de Imágenes</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium mb-2">📐 Dimensiones</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li><strong>Ancho recomendado:</strong> 1920px</li>
                      <li><strong>Alto recomendado:</strong> 800-1080px</li>
                      <li><strong>Proporción:</strong> 16:9 o similar (horizontal)</li>
                      <li>Todas las imágenes deberían tener dimensiones similares para evitar saltos visuales</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium mb-2">📸 Calidad</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Usa imágenes de alta resolución y bien iluminadas</li>
                      <li>Evita imágenes borrosas o pixeladas</li>
                      <li>Comprime las imágenes antes de subirlas (no más de 500KB por imagen)</li>
                      <li>Formato recomendado: JPG para fotos, PNG para gráficos</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium mb-2">🎨 Contenido Visual</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Muestra tus mejores platos con buena presentación</li>
                      <li>Incluye imágenes del ambiente y decoración del restaurante</li>
                      <li>Fotografías de eventos especiales o celebraciones</li>
                      <li>Imágenes del equipo o chef en acción</li>
                      <li>Evita imágenes con mucho texto superpuesto</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Cuántas Imágenes Subir?</h3>
                <div className="p-4 border rounded-lg">
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li><strong>Mínimo recomendado:</strong> 3-4 imágenes para tener variedad</li>
                    <li><strong>Ideal:</strong> 5-8 imágenes para un carrusel dinámico</li>
                    <li><strong>Máximo sugerido:</strong> 10 imágenes (más puede ralentizar el sitio)</li>
                    <li>Menos es más: elige calidad sobre cantidad</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">💡 Consejos</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Actualiza las imágenes del carrusel regularmente (cada 2-3 meses)</li>
                  <li>Usa imágenes que cuenten una historia sobre tu restaurante</li>
                  <li>Mantén un estilo visual coherente entre todas las imágenes</li>
                  <li>Evita imágenes muy oscuras que no se vean bien en pantallas móviles</li>
                  <li>Prueba el carrusel en tu teléfono después de agregar imágenes</li>
                  <li>Considera la temporada: actualiza para fechas especiales (Navidad, etc.)</li>
                  <li>No sobrecargues el carrusel - 5-7 imágenes es perfecto</li>
                  <li>Si desactivas el carrusel, considera activar otra sección destacada</li>
                  <li>Guarda tus mejores imágenes para el carrusel - es lo primero que ven</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "categorias-menu":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Categorías del Menú</h1>
              <p className="text-muted-foreground">
                Navega a: Panel Principal → Pestaña <Badge variant="secondary" className="mx-1">Menú</Badge> → Sección <Badge variant="secondary" className="mx-1">Categorías</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  ¿Qué son las Categorías?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Las categorías te permiten organizar los elementos de tu menú en grupos lógicos 
                  como "Entradas", "Platos Principales", "Bebidas", "Postres", etc. Esto hace que 
                  tu menú sea más fácil de navegar para tus clientes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Crear una Nueva Categoría
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                    <span className="text-sm">Haz clic en el botón <Badge variant="outline">Nueva Categoría</Badge></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                    <span className="text-sm">Ingresa el nombre de la categoría (ej: "Platos Principales")</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                    <span className="text-sm">Usa el switch para marcar si la categoría está activa</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">4.</span>
                    <span className="text-sm">Haz clic en <Badge variant="outline">Crear</Badge></span>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Gestionar Categorías Existentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-primary" />
                    Reordenar
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Arrastra y suelta las categorías usando el ícono de líneas verticales para cambiar 
                    el orden en que aparecen en tu sitio web. El orden es importante porque afecta cómo 
                    los clientes navegan tu menú.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Edit className="h-4 w-4 text-primary" />
                    Editar
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Haz clic en el botón de editar (ícono de lápiz) para modificar el nombre de la categoría.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    Activar/Desactivar
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Usa el switch para activar o desactivar categorías sin eliminarlas. Las categorías 
                    inactivas no aparecen en el sitio web pero conservan sus elementos.
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-primary" />
                    Eliminar
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Haz clic en el botón de eliminar (ícono de basura). Se te pedirá confirmación antes 
                    de eliminar la categoría.
                  </p>
                  <Alert className="border-amber-500/50 bg-amber-500/10 mt-3">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-sm">
                      <strong>Advertencia:</strong> Al eliminar una categoría, también se eliminan todos 
                      los elementos del menú asociados a ella.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Ejemplos de Categorías Comunes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="p-3 border rounded-lg bg-muted/50 text-center">
                    <p className="font-medium text-sm">🥗 Entradas</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/50 text-center">
                    <p className="font-medium text-sm">🍲 Sopas</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/50 text-center">
                    <p className="font-medium text-sm">🍝 Pastas</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/50 text-center">
                    <p className="font-medium text-sm">🥩 Platos Principales</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/50 text-center">
                    <p className="font-medium text-sm">🍹 Bebidas</p>
                  </div>
                  <div className="p-3 border rounded-lg bg-muted/50 text-center">
                    <p className="font-medium text-sm">🍰 Postres</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Crea categorías primero:</strong> Antes de agregar elementos del menú
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Nombres descriptivos:</strong> Usa nombres claros que los clientes entiendan fácilmente
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Orden lógico:</strong> Ordena las categorías como quieres que aparezcan (ej: Entradas → Principales → Postres)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Solo activas:</strong> Mantén activas solo las categorías que estés usando actualmente
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Revisa periódicamente:</strong> Actualiza las categorías según las temporadas o cambios en tu menú
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case "elementos-menu":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Elementos del Menú</h1>
              <p className="text-muted-foreground">
                Navega a: Panel Principal → Pestaña <Badge variant="secondary" className="mx-1">Menú</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  ¿Qué son los Elementos del Menú?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Los elementos del menú son los platos, bebidas y productos que ofreces en tu restaurante. Cada elemento pertenece a una categoría y puede tener imagen, descripción, precio y opciones de visualización personalizadas.
                </p>
                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    <strong>Organización por Categorías:</strong> Los elementos del menú están organizados dentro de las categorías que creaste. Primero debes crear categorías (Entrantes, Platos Principales, etc.) y luego agregar elementos dentro de cada una.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Agregar un Nuevo Elemento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Los elementos se agregan dentro de cada categoría. Hay dos formas de hacerlo:
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">1️⃣</span>
                      Desde el Encabezado de la Categoría
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      En cada categoría colapsable, haz clic en el botón <strong>"Agregar Plato"</strong> ubicado en la parte superior derecha del encabezado.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">2️⃣</span>
                      Desde una Categoría Vacía
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Si una categoría no tiene elementos, verás un botón <strong>"Agregar primer plato"</strong> en el centro de la sección colapsada.
                    </p>
                  </div>
                </div>

                <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-sm">
                    <strong>Categorías Primero:</strong> Si no ves ninguna categoría disponible, primero debes crear al menos una categoría antes de poder agregar elementos del menú.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Campos del Formulario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 p-3 border-b">
                      <h4 className="font-semibold">Información Básica (Obligatoria)</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Nombre del Plato *</h5>
                        <p className="text-xs text-muted-foreground">
                          Nombre del plato o bebida (ej: "Lomo Saltado", "Pisco Sour"). <strong>Campo obligatorio.</strong>
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Precio *</h5>
                        <p className="text-xs text-muted-foreground">
                          Precio en soles (S/). Solo números con máximo 2 decimales (ej: 25.50). <strong>Campo obligatorio.</strong>
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Categoría *</h5>
                        <p className="text-xs text-muted-foreground">
                          Se pre-selecciona automáticamente según desde qué categoría agregaste el elemento. Puedes cambiarla si es necesario. <strong>Campo obligatorio.</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-3 border-b">
                      <h4 className="font-semibold">Información Adicional (Opcional)</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Descripción</h5>
                        <p className="text-xs text-muted-foreground">
                          Describe el plato: ingredientes, preparación, origen, acompañamientos, etc. Esto ayuda a tus clientes a decidir qué ordenar. <strong>Opcional pero muy recomendado.</strong>
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <Image className="h-3 w-3" />
                          Imagen del Plato
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          Sube una foto apetitosa del plato. Se optimizará automáticamente para web. Formatos: JPG, PNG, WEBP. <strong>Opcional pero muy recomendado.</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 border-b border-green-200 dark:border-green-800">
                      <h4 className="font-semibold">Opciones de Visualización</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <Power className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-sm mb-1">Elemento Activo</h5>
                          <p className="text-xs text-muted-foreground">
                            Switch para activar/desactivar el elemento. Los elementos inactivos NO aparecen en tu sitio web. Útil para platos temporalmente no disponibles sin eliminarlos.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Home className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-sm mb-1">Mostrar en Página de Inicio</h5>
                          <p className="text-xs text-muted-foreground">
                            Marca este elemento para que aparezca en la sección de platos destacados de tu página principal. <strong>Máximo 8 elementos destacados.</strong> Usa esto para tus mejores platos.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Eye className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-sm mb-1">Mostrar Imagen en Menú</h5>
                          <p className="text-xs text-muted-foreground">
                            Si está activado, la imagen del plato aparece en la página del menú completo. Desactívalo si prefieres un menú solo con texto y precios.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Eye className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-sm mb-1">Mostrar Imagen en Inicio</h5>
                          <p className="text-xs text-muted-foreground">
                            Si está activado, la imagen aparece cuando el plato se muestra en la sección destacada de la página de inicio (si "Mostrar en Página de Inicio" está activo).
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Entender las Tarjetas de Elementos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cada elemento del menú se muestra como una tarjeta visual con información clave y controles rápidos:
                </p>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 p-3 border-b">
                    <h4 className="font-semibold text-sm">Estructura de la Tarjeta</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">1.</span>
                      <div>
                        <p className="font-medium text-sm">Imagen del Plato</p>
                        <p className="text-xs text-muted-foreground">Ocupa la parte superior. Si no hay imagen, se muestra un ícono de placeholder.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">2.</span>
                      <div>
                        <p className="font-medium text-sm">Badges en la Imagen</p>
                        <p className="text-xs text-muted-foreground">
                          <Badge variant="secondary" className="mr-1 text-xs"><Home className="h-2 w-2 mr-1 inline" />Inicio</Badge> indica que el elemento está destacado en la página principal.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">3.</span>
                      <div>
                        <p className="font-medium text-sm">Nombre y Precio</p>
                        <p className="text-xs text-muted-foreground">En la parte superior del contenido. El precio se muestra en formato S/ XX.XX</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">4.</span>
                      <div>
                        <p className="font-medium text-sm">Switch de Estado + Badge</p>
                        <p className="text-xs text-muted-foreground">
                          Switch para activar/desactivar rápidamente + badge <Badge variant="default" className="text-xs">Activo</Badge> o <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">5.</span>
                      <div>
                        <p className="font-medium text-sm">Descripción</p>
                        <p className="text-xs text-muted-foreground">Muestra las primeras 2 líneas de la descripción (si existe).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">6.</span>
                      <div>
                        <p className="font-medium text-sm">Badges de Visualización</p>
                        <p className="text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs mr-1"><Eye className="h-2 w-2 mr-1 inline" />IMG-Inicio</Badge>
                          <Badge variant="outline" className="text-xs"><Eye className="h-2 w-2 mr-1 inline" />IMG-Menú</Badge> indican dónde se muestra la imagen.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">7.</span>
                      <div>
                        <p className="font-medium text-sm">Botones de Acción</p>
                        <p className="text-xs text-muted-foreground">
                          <Edit className="h-3 w-3 inline mr-1" /> Editar y <Trash2 className="h-3 w-3 inline mr-1" /> Eliminar en la esquina inferior derecha.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="border-primary/30 bg-primary/5">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong>Consejo:</strong> El switch de activación/desactivación te permite ocultar platos temporalmente sin perder su información. Muy útil para platos estacionales o cuando se te acaba un ingrediente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Reordenar Elementos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  El orden de los elementos determina cómo aparecen en tu sitio web. El sistema ofrece diferentes métodos según el dispositivo:
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 border-b border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        💻 En Computadora
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm mb-1">Arrastrar y Soltar</p>
                          <p className="text-xs text-muted-foreground">
                            Verás un ícono de agarre (⋮⋮) en la esquina superior izquierda de cada tarjeta. Haz clic y arrastra para reordenar.
                          </p>
                        </div>
                      </div>
                      <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 mt-3">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-xs">
                          Los cambios se guardan automáticamente al soltar el elemento.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-3 border-b border-orange-200 dark:border-orange-800">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        📱 En Móvil/Tablet
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm mb-1">Botones de Flecha</p>
                          <p className="text-xs text-muted-foreground">
                            En dispositivos móviles, el drag-and-drop no está disponible. Los elementos mantienen su orden actual (por fecha de creación).
                          </p>
                        </div>
                      </div>
                      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 mt-3">
                        <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-xs">
                          <strong>Recomendación:</strong> Ordena los elementos desde una computadora para tener control total del ordenamiento.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Editar y Eliminar Elementos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Edit className="h-4 w-4 text-primary" />
                      Editar un Elemento
                    </h4>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>Haz clic en el botón de editar <Edit className="h-3 w-3 inline" /> en la tarjeta del elemento</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>Se abre el mismo formulario con los datos actuales pre-cargados</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>Modifica lo que necesites y haz clic en <strong>"Guardar"</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">4.</span>
                        <span>Los cambios se reflejan inmediatamente en tu sitio web</span>
                      </li>
                    </ol>
                  </div>

                  <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Eliminar un Elemento
                    </h4>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>Haz clic en el botón de eliminar <Trash2 className="h-3 w-3 inline" /> en la tarjeta del elemento</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>Aparece un diálogo de confirmación para prevenir eliminaciones accidentales</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>Confirma la eliminación haciendo clic en <strong>"Eliminar"</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">4.</span>
                        <span>El elemento desaparece permanentemente del sistema</span>
                      </li>
                    </ol>
                    <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 mt-3">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <AlertDescription className="text-xs">
                        <strong>Precaución:</strong> La eliminación es permanente. Si solo quieres ocultar temporalmente un plato, usa el switch de activación/desactivación en lugar de eliminarlo.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                  Navegación por Categorías
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Los elementos están organizados dentro de categorías colapsables para facilitar la navegación:
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <ChevronDown className="h-4 w-4" />
                      Expandir/Colapsar Categorías
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el encabezado de cualquier categoría para expandirla y ver sus elementos, o colapsarla para ocultarlos. El ícono <ChevronRight className="h-3 w-3 inline" /> indica colapsado y <ChevronDown className="h-3 w-3 inline" /> indica expandido.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">Vista de Grid Responsiva</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Los elementos se muestran en una cuadrícula que se adapta automáticamente:
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground pl-4">
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong>Móvil:</strong> 1 columna (tarjetas apiladas)</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong>Tablet:</strong> 2 columnas</span>
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        <span><strong>Desktop:</strong> 3 columnas</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">Contador de Elementos</h4>
                    <p className="text-sm text-muted-foreground">
                      Cada categoría muestra un badge <Badge variant="outline" className="text-xs">X platos</Badge> indicando cuántos elementos contiene, facilitando la gestión de inventario.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Fotos de calidad:</strong> Usa fotos bien iluminadas y apetitosas para tus platos principales. Una buena foto puede aumentar las ventas hasta un 30%
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Descripciones atractivas:</strong> No solo listes ingredientes, describe sabores, texturas y experiencias. Ejemplo: "Jugoso lomo saltado con trozos de carne tierna salteados al wok"
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Selecciona 8 platos destacados:</strong> Escoge tus mejores platos para mostrar en la página de inicio. Estos son los que más venderás
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Usa inactivo en lugar de eliminar:</strong> Para platos de temporada o temporalmente no disponibles, desactívalos en lugar de eliminarlos para conservar su información
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Precios actualizados:</strong> Revisa y actualiza los precios regularmente. Los precios desactualizados generan mala experiencia al cliente
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Orden estratégico:</strong> Ordena los elementos poniendo primero los más populares o rentables de cada categoría
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Agrupa correctamente:</strong> Asegúrate de que cada elemento esté en la categoría correcta para facilitar la navegación del cliente
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Ordena desde desktop:</strong> Si necesitas reordenar elementos, hazlo desde una computadora para tener acceso a la funcionalidad de arrastrar y soltar
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <HelpCircle className="h-5 w-5" />
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Cuántos elementos puedo agregar?</h4>
                    <p className="text-xs text-muted-foreground">
                      No hay límite. Puedes agregar tantos elementos como necesites en cada categoría.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Puedo cambiar un elemento de categoría?</h4>
                    <p className="text-xs text-muted-foreground">
                      Sí, al editar un elemento puedes seleccionar una categoría diferente en el desplegable de categorías.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Qué pasa si elimino un elemento destacado en inicio?</h4>
                    <p className="text-xs text-muted-foreground">
                      Se elimina completamente, incluyendo su aparición en la página de inicio. Si solo quieres quitarlo del inicio, edítalo y desactiva "Mostrar en Página de Inicio".
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Las imágenes se optimizan automáticamente?</h4>
                    <p className="text-xs text-muted-foreground">
                      Sí, el sistema optimiza automáticamente todas las imágenes que subes para mejorar la velocidad de carga del sitio.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Puedo no mostrar imágenes en el menú?</h4>
                    <p className="text-xs text-muted-foreground">
                      Sí, desactiva "Mostrar Imagen en Menú" al crear o editar el elemento. Esto creará un menú estilo tradicional solo con texto y precios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "equipo":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestión del Equipo</h1>
              <p className="text-muted-foreground">
                Navega a: Panel Principal → Pestaña <Badge variant="secondary" className="mx-1">Equipo</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  ¿Qué es la Sección de Equipo?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  La sección de equipo te permite presentar a las personas clave detrás de tu restaurante. Mostrar tu equipo humaniza tu marca, genera confianza con los clientes y destaca la experiencia profesional que respalda tu negocio.
                </p>
                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    <strong>Credibilidad y Confianza:</strong> Los clientes valoran saber quién prepara su comida. Presentar a tu chef ejecutivo, sommelier o gerente puede aumentar significativamente la confianza en tu restaurante.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Agregar un Miembro del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Para agregar un nuevo miembro a tu equipo:
                </p>

                <div className="p-4 border rounded-lg bg-primary/5">
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">1.</span>
                      <span className="text-muted-foreground">
                        Haz clic en el botón <strong>"Agregar Miembro"</strong> ubicado en la esquina superior derecha
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">2.</span>
                      <span className="text-muted-foreground">
                        Se abre un diálogo modal con el formulario de nuevo miembro
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">3.</span>
                      <span className="text-muted-foreground">
                        Completa los campos requeridos: nombre y cargo
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">4.</span>
                      <span className="text-muted-foreground">
                        Opcionalmente añade biografía y foto del miembro
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">5.</span>
                      <span className="text-muted-foreground">
                        Haz clic en <strong>"Guardar"</strong> para crear el miembro
                      </span>
                    </li>
                  </ol>
                </div>

                <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm">
                    <strong>Auto-guardado:</strong> Los miembros nuevos aparecen inmediatamente al final de la lista y están activos por defecto.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Campos del Formulario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 p-3 border-b">
                      <h4 className="font-semibold">Información Básica (Obligatoria)</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Nombre *</h5>
                        <p className="text-xs text-muted-foreground">
                          Nombre completo del miembro del equipo (ej: "María García López"). <strong>Campo obligatorio.</strong>
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1">Cargo/Título *</h5>
                        <p className="text-xs text-muted-foreground">
                          Posición o rol en el restaurante. Ejemplos: "Chef Ejecutivo", "Sommelier", "Gerente General", "Pastelero", "Maître". <strong>Campo obligatorio.</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-3 border-b">
                      <h4 className="font-semibold">Información Adicional (Opcional)</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Biografía</h5>
                        <p className="text-xs text-muted-foreground mb-2">
                          Breve descripción del miembro: experiencia, especialidades, logros, formación o filosofía culinaria. <strong>Opcional pero muy recomendado.</strong>
                        </p>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                          <strong>Ejemplo:</strong> "Con más de 15 años de experiencia en cocina peruana contemporánea, Carlos se especializa en fusionar técnicas tradicionales con presentaciones modernas."
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <Image className="h-3 w-3" />
                          Foto del Miembro
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          Foto profesional del miembro. Se mostrará como un avatar circular en la tarjeta. Formatos: JPG, PNG, WEBP. <strong>Opcional pero muy recomendado.</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 border-b border-green-200 dark:border-green-800">
                      <h4 className="font-semibold">Estado de Visibilidad</h4>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Power className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-sm mb-1">Miembro Activo</h5>
                          <p className="text-xs text-muted-foreground">
                            Switch para activar/desactivar la visibilidad del miembro. Los miembros inactivos NO aparecen en tu sitio web. Útil para miembros temporalmente ausentes o que dejaron el equipo sin eliminar su registro.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Entender las Tarjetas de Miembros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cada miembro del equipo se muestra como una tarjeta horizontal con diseño limpio y controles integrados:
                </p>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 p-3 border-b">
                    <h4 className="font-semibold text-sm">Estructura de la Tarjeta</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">1.</span>
                      <div>
                        <p className="font-medium text-sm">Control de Orden (Izquierda)</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Desktop:</strong> Ícono de agarre <GripVertical className="h-3 w-3 inline" /> para arrastrar y soltar
                          <br />
                          <strong>Móvil:</strong> Flechas <ArrowUp className="h-3 w-3 inline" /> <ArrowDown className="h-3 w-3 inline" /> para mover arriba/abajo
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">2.</span>
                      <div>
                        <p className="font-medium text-sm">Avatar Circular</p>
                        <p className="text-xs text-muted-foreground">
                          Foto del miembro en formato circular (si fue subida). Si no hay foto, se omite esta sección.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">3.</span>
                      <div>
                        <p className="font-medium text-sm">Información del Miembro</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Nombre</strong> en texto grande y destacado
                          <br />
                          <strong>Cargo</strong> en texto más pequeño debajo del nombre
                          <br />
                          <strong>Biografía</strong> (si existe) en texto gris más pequeño
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">4.</span>
                      <div>
                        <p className="font-medium text-sm">Controles Rápidos (Derecha)</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Switch:</strong> Activar/desactivar visibilidad rápidamente
                          <br />
                          <strong>Botón Editar:</strong> <Edit className="h-3 w-3 inline" /> Abre el formulario de edición
                          <br />
                          <strong>Botón Eliminar:</strong> <Trash2 className="h-3 w-3 inline" /> Elimina el miembro (con confirmación)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="border-primary/30 bg-primary/5">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong>Diseño Responsivo:</strong> Las tarjetas se adaptan automáticamente a móviles y tablets, manteniendo toda la funcionalidad pero reorganizando los controles para facilitar el uso táctil.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Reordenar Miembros del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  El orden de los miembros determina cómo aparecen en tu sitio web. Generalmente se recomienda poner primero a las personas de mayor jerarquía (Chef Ejecutivo, Gerente) y luego al resto del equipo.
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 border-b border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        💻 En Computadora
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm mb-1">Arrastrar y Soltar</p>
                          <p className="text-xs text-muted-foreground">
                            Haz clic y mantén presionado en el ícono de agarre (⋮⋮) en la parte izquierda de la tarjeta. Arrastra el miembro a la nueva posición y suelta.
                          </p>
                        </div>
                      </div>
                      <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 mt-3">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-xs">
                          Los cambios se guardan automáticamente al soltar el elemento.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-3 border-b border-orange-200 dark:border-orange-800">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        📱 En Móvil/Tablet
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm mb-1">Botones de Flecha</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Usa los botones de flecha <ArrowUp className="h-3 w-3 inline" /> (mover arriba) y <ArrowDown className="h-3 w-3 inline" /> (mover abajo) ubicados en la parte izquierda de cada tarjeta.
                          </p>
                          <ul className="space-y-1 text-xs text-muted-foreground pl-3">
                            <li>• El primer miembro tiene la flecha arriba deshabilitada</li>
                            <li>• El último miembro tiene la flecha abajo deshabilitada</li>
                          </ul>
                        </div>
                      </div>
                      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 mt-3">
                        <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-xs">
                          Cada clic mueve el miembro una posición. Los cambios se guardan automáticamente.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Editar y Eliminar Miembros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Edit className="h-4 w-4 text-primary" />
                      Editar un Miembro
                    </h4>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>Haz clic en el botón de editar <Edit className="h-3 w-3 inline" /> en la tarjeta del miembro</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>Se abre el mismo diálogo modal con los datos actuales pre-cargados</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>Modifica los campos que necesites (nombre, cargo, biografía, foto, estado)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">4.</span>
                        <span>Haz clic en <strong>"Guardar"</strong> para aplicar los cambios</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">5.</span>
                        <span>Los cambios se reflejan inmediatamente en la lista y en tu sitio web</span>
                      </li>
                    </ol>
                  </div>

                  <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Eliminar un Miembro
                    </h4>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>Haz clic en el botón de eliminar <Trash2 className="h-3 w-3 inline" /> en la tarjeta del miembro</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>Aparece un diálogo de confirmación: "¿Estás seguro de que quieres eliminar este miembro del equipo?"</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>Confirma la eliminación haciendo clic en <strong>"Aceptar"</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">4.</span>
                        <span>El miembro desaparece permanentemente del sistema</span>
                      </li>
                    </ol>
                    <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 mt-3">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <AlertDescription className="text-xs">
                        <strong>Precaución:</strong> La eliminación es permanente y no se puede deshacer. Si solo quieres ocultar temporalmente a un miembro (ej: vacaciones, licencia), usa el switch de activación/desactivación en lugar de eliminarlo.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                  Control de Visibilidad con Switch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Cada miembro tiene un switch de activación/desactivación que te permite controlar rápidamente su visibilidad en el sitio web sin eliminar su información:
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Power className="h-4 w-4 text-green-600" />
                      Miembro Activo
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        Aparece en la sección de equipo de tu sitio web
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        Visible para todos los visitantes
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        Se muestra con foto, nombre, cargo y biografía
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                      Miembro Inactivo
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex gap-2">
                        <span>•</span>
                        NO aparece en tu sitio web
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        La información se conserva en el sistema
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        Puedes reactivarlo en cualquier momento
                      </li>
                    </ul>
                  </div>
                </div>

                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    <strong>Casos de Uso:</strong> Ideal para miembros temporalmente ausentes (vacaciones, licencia médica), rotación de personal, o cuando quieres mantener el historial de equipo sin mostrarlo públicamente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Fotos profesionales:</strong> Usa fotos con buena iluminación, fondo neutro o uniforme, y expresión amigable. Las fotos de perfil profesional generan más confianza que fotos casuales
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Personal clave solamente:</strong> No es necesario mostrar todo el personal. Enfócate en posiciones de liderazgo: Chef Ejecutivo, Sommelier, Pastelero, Gerente, Maître. Esto mantiene la sección más impactante
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Biografías concisas:</strong> 2-3 oraciones son suficientes. Destaca experiencia relevante, especialidades y logros significativos sin extenderte demasiado
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Orden jerárquico:</strong> Ordena los miembros por jerarquía o importancia: primero el Chef Ejecutivo, luego el Sommelier, después el Gerente, etc.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Mantén actualizado:</strong> Actualiza la sección cuando haya cambios en el equipo. Información desactualizada puede generar confusión o mala impresión
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Tono profesional pero cercano:</strong> Escribe biografías en tercera persona con tono profesional, pero sin ser demasiado formal. Humaniza a tu equipo
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Destaca credenciales relevantes:</strong> Menciona formación en escuelas culinarias reconocidas, experiencia internacional, premios o reconocimientos
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Usa inactivo en lugar de eliminar:</strong> Si un miembro deja el equipo pero quieres conservar su historial, desactívalo en lugar de eliminarlo
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <HelpCircle className="h-5 w-5" />
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Cuántos miembros debo mostrar?</h4>
                    <p className="text-xs text-muted-foreground">
                      No hay un número fijo, pero generalmente entre 3-8 miembros clave es ideal. Más de 10 puede ser abrumador para los visitantes. Enfócate en calidad sobre cantidad.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Es obligatorio subir fotos?</h4>
                    <p className="text-xs text-muted-foreground">
                      No es obligatorio técnicamente, pero es muy recomendado. Las fotos humanizan tu marca y generan mayor confianza. Los perfiles sin foto tienen menos impacto.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Qué hago si un miembro temporal se va de vacaciones?</h4>
                    <p className="text-xs text-muted-foreground">
                      Usa el switch para desactivarlo temporalmente. Cuando regrese, simplemente reactívalo sin tener que volver a ingresar toda su información.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Las fotos se optimizan automáticamente?</h4>
                    <p className="text-xs text-muted-foreground">
                      Sí, el sistema optimiza automáticamente todas las fotos que subes para mejorar la velocidad de carga sin sacrificar calidad visual.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Puedo reordenar en dispositivos móviles?</h4>
                    <p className="text-xs text-muted-foreground">
                      Sí, en móviles usa los botones de flechas arriba/abajo para mover miembros una posición a la vez. Es igual de funcional que el arrastrar y soltar de desktop.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Dónde aparece esta sección en mi sitio web?</h4>
                    <p className="text-xs text-muted-foreground">
                      La sección de equipo típicamente aparece en la página "Acerca de" o "Sobre Nosotros" de tu sitio web, dependiendo de tu configuración de navegación.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "resenas":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Reseñas de Clientes</h1>
              <p className="text-muted-foreground">
                Navega a: Panel Principal → Pestaña <Badge variant="secondary" className="mx-1">Reseñas</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary fill-primary" />
                  ¿Qué son las Reseñas?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Las reseñas son testimonios de clientes satisfechos que aparecen en tu sitio web. Son una de las herramientas de marketing más poderosas: el 93% de los consumidores lee reseñas antes de elegir un restaurante. Mostrar reseñas positivas genera confianza y puede aumentar significativamente tus reservas.
                </p>
                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    <strong>Social Proof Importante:</strong> Las reseñas actúan como "prueba social". Los clientes potenciales confían más en las opiniones de otros clientes que en tu propia publicidad.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Agregar una Reseña
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Para agregar una nueva reseña a tu sitio web:
                </p>

                <div className="p-4 border rounded-lg bg-primary/5">
                  <ol className="space-y-2 text-sm">
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">1.</span>
                      <span className="text-muted-foreground">
                        Haz clic en el botón <strong>"Agregar Reseña"</strong> ubicado en la esquina superior derecha
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">2.</span>
                      <span className="text-muted-foreground">
                        Se abre un diálogo modal con el formulario de nueva reseña
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">3.</span>
                      <span className="text-muted-foreground">
                        Completa los campos requeridos: nombre del cliente, texto de la reseña y calificación
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">4.</span>
                      <span className="text-muted-foreground">
                        Opcionalmente añade una fecha específica para la reseña
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-primary flex-shrink-0">5.</span>
                      <span className="text-muted-foreground">
                        Haz clic en <strong>"Guardar"</strong> para publicar la reseña
                      </span>
                    </li>
                  </ol>
                </div>

                <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm">
                    <strong>Auto-guardado:</strong> Las reseñas nuevas aparecen inmediatamente al final de la lista y están activas por defecto.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Campos del Formulario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 p-3 border-b">
                      <h4 className="font-semibold">Información Básica (Obligatoria)</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <h5 className="font-medium text-sm mb-1">Nombre del Cliente *</h5>
                        <p className="text-xs text-muted-foreground">
                          Nombre de la persona que dejó la reseña (ej: "Carlos Rodríguez", "María S."). <strong>Campo obligatorio.</strong>
                        </p>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs mt-2">
                          <strong>Tip:</strong> Puedes usar solo nombre y apellido inicial si prefieres proteger la privacidad (ej: "Ana M.")
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          Calificación (Estrellas) *
                        </h5>
                        <p className="text-xs text-muted-foreground mb-2">
                          Calificación en estrellas de 0.5 a 5.0. Permite medias estrellas para mayor precisión. <strong>Campo obligatorio.</strong>
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2 bg-muted/30 rounded">
                            <strong>Opciones disponibles:</strong>
                            <div className="mt-1 space-y-0.5 text-muted-foreground">
                              <div>0.5★, 1★, 1.5★, 2★, 2.5★</div>
                              <div>3★, 3.5★, 4★, 4.5★, 5★</div>
                            </div>
                          </div>
                          <div className="p-2 bg-green-50 dark:bg-green-950/20 rounded">
                            <strong>Recomendación:</strong>
                            <div className="mt-1 text-muted-foreground">
                              Muestra principalmente reseñas de 4★ o más para generar mejor impresión
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-sm mb-1 flex items-center gap-2">
                          <MessageSquare className="h-3 w-3" />
                          Texto de la Reseña *
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          El comentario o testimonio completo del cliente. Puede incluir menciones específicas sobre platos, servicio, ambiente, etc. <strong>Campo obligatorio.</strong>
                        </p>
                        <div className="p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs mt-2">
                          <strong>Ejemplo:</strong> "Excelente experiencia. El lomo saltado estaba delicioso y el servicio fue muy atento. Sin duda volveremos."
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-3 border-b">
                      <h4 className="font-semibold">Información Adicional (Opcional)</h4>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-sm mb-1">Fecha de la Reseña</h5>
                          <p className="text-xs text-muted-foreground mb-2">
                            Fecha específica en que se recibió la reseña. Si no especificas una fecha, se usará la fecha de creación automáticamente. <strong>Opcional.</strong>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Útil si estás importando reseñas antiguas de Google, TripAdvisor u otras plataformas y quieres mantener la fecha original.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 border-b border-green-200 dark:border-green-800">
                      <h4 className="font-semibold">Estado de Visibilidad</h4>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <Power className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-medium text-sm mb-1">Reseña Activa</h5>
                          <p className="text-xs text-muted-foreground">
                            Switch para activar/desactivar la visibilidad de la reseña. Las reseñas inactivas NO aparecen en tu sitio web. Útil para reseñas que quieres mantener archivadas sin mostrarlas públicamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Entender las Tarjetas de Reseñas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cada reseña se muestra como una tarjeta horizontal elegante con toda la información y controles integrados:
                </p>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/30 p-3 border-b">
                    <h4 className="font-semibold text-sm">Estructura de la Tarjeta</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">1.</span>
                      <div>
                        <p className="font-medium text-sm">Control de Orden (Izquierda)</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Desktop:</strong> Ícono de agarre <GripVertical className="h-3 w-3 inline" /> para arrastrar y soltar
                          <br />
                          <strong>Móvil:</strong> Flechas <ArrowUp className="h-3 w-3 inline" /> <ArrowDown className="h-3 w-3 inline" /> apiladas para mover arriba/abajo
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">2.</span>
                      <div>
                        <p className="font-medium text-sm">Encabezado de la Reseña</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Nombre del cliente</strong> a la izquierda en texto grande
                          <br />
                          <strong>Calificación de estrellas</strong> a la derecha con estrellas visuales (★★★★★) y número
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">3.</span>
                      <div>
                        <p className="font-medium text-sm">Texto de la Reseña</p>
                        <p className="text-xs text-muted-foreground">
                          El comentario completo entre comillas ("...") en texto gris con espaciado cómodo para lectura
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-primary font-bold">4.</span>
                      <div>
                        <p className="font-medium text-sm">Controles Rápidos (Derecha)</p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Switch:</strong> Activar/desactivar visibilidad rápidamente
                          <br />
                          <strong>Botón Editar:</strong> <Edit className="h-3 w-3 inline" /> Abre el formulario de edición
                          <br />
                          <strong>Botón Eliminar:</strong> <Trash2 className="h-3 w-3 inline" /> Elimina la reseña (con confirmación)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="border-primary/30 bg-primary/5">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong>Visualización de Estrellas:</strong> El sistema muestra estrellas completas (★), medias estrellas (½★) y estrellas vacías (☆) automáticamente según la calificación. Por ejemplo: 4.5 estrellas = ★★★★½
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Reordenar Reseñas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  El orden de las reseñas determina cómo aparecen en tu sitio web. Es estratégico poner primero tus mejores reseñas (5 estrellas con comentarios detallados).
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 border-b border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        💻 En Computadora
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm mb-1">Arrastrar y Soltar</p>
                          <p className="text-xs text-muted-foreground">
                            Haz clic y mantén presionado en el ícono de agarre (⋮⋮) en el lado izquierdo de la tarjeta. Arrastra la reseña a la nueva posición y suelta.
                          </p>
                        </div>
                      </div>
                      <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20 mt-3">
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-xs">
                          Los cambios se guardan automáticamente al soltar el elemento.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-3 border-b border-orange-200 dark:border-orange-800">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        📱 En Móvil/Tablet
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm mb-1">Botones de Flecha</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Usa los botones de flecha <ArrowUp className="h-3 w-3 inline" /> (mover arriba) y <ArrowDown className="h-3 w-3 inline" /> (mover abajo) apilados en el lado izquierdo de cada tarjeta.
                          </p>
                          <ul className="space-y-1 text-xs text-muted-foreground pl-3">
                            <li>• La primera reseña tiene la flecha arriba deshabilitada</li>
                            <li>• La última reseña tiene la flecha abajo deshabilitada</li>
                          </ul>
                        </div>
                      </div>
                      <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 mt-3">
                        <Info className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                        <AlertDescription className="text-xs">
                          Cada clic mueve la reseña una posición. Los cambios se guardan automáticamente.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Editar y Eliminar Reseñas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Edit className="h-4 w-4 text-primary" />
                      Editar una Reseña
                    </h4>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>Haz clic en el botón de editar <Edit className="h-3 w-3 inline" /> en la tarjeta de la reseña</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>Se abre el mismo diálogo modal con los datos actuales pre-cargados</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>Modifica los campos que necesites (nombre, calificación, texto, fecha, estado)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">4.</span>
                        <span>Haz clic en <strong>"Guardar"</strong> para aplicar los cambios</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">5.</span>
                        <span>Los cambios se reflejan inmediatamente en la lista y en tu sitio web</span>
                      </li>
                    </ol>
                    <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded text-xs">
                      <strong>Caso de Uso:</strong> Editar es útil para corregir errores tipográficos, actualizar calificaciones o ajustar el texto de reseñas existentes.
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      Eliminar una Reseña
                    </h4>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-bold">1.</span>
                        <span>Haz clic en el botón de eliminar <Trash2 className="h-3 w-3 inline" /> en la tarjeta de la reseña</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">2.</span>
                        <span>Aparece un diálogo de confirmación: "¿Estás seguro de que quieres eliminar esta reseña?"</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">3.</span>
                        <span>Confirma la eliminación haciendo clic en <strong>"Aceptar"</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold">4.</span>
                        <span>La reseña desaparece permanentemente del sistema</span>
                      </li>
                    </ol>
                    <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 mt-3">
                      <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      <AlertDescription className="text-xs">
                        <strong>Precaución:</strong> La eliminación es permanente y no se puede deshacer. Si solo quieres ocultar temporalmente una reseña, usa el switch de activación/desactivación en lugar de eliminarla.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                  Control de Visibilidad con Switch
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Cada reseña tiene un switch de activación/desactivación que te permite controlar rápidamente su visibilidad en el sitio web:
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Power className="h-4 w-4 text-green-600" />
                      Reseña Activa
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        Aparece en la sección de reseñas de tu sitio web
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        Visible para todos los visitantes
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        Se muestra con nombre, calificación y texto completo
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                      Reseña Inactiva
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li className="flex gap-2">
                        <span>•</span>
                        NO aparece en tu sitio web
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        La información se conserva en el sistema
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        Puedes reactivarla en cualquier momento
                      </li>
                    </ul>
                  </div>
                </div>

                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    <strong>Casos de Uso:</strong> Ideal para rotar reseñas periódicamente, ocultar temporalmente reseñas antiguas, o mantener un archivo de todas las reseñas sin mostrarlas todas públicamente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Solicita permiso siempre:</strong> Antes de publicar la reseña de un cliente, pídele permiso explícito. Es una buena práctica legal y ética
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Importa de plataformas:</strong> Puedes copiar reseñas de Google My Business, TripAdvisor, Facebook o Instagram (con permiso). Mantén la fecha original usando el campo de fecha opcional
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Enfócate en 4-5 estrellas:</strong> Muestra principalmente reseñas excelentes. No publiques reseñas negativas en tu sitio (aunque deben ser respondidas en las plataformas donde aparecen)
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Reseñas específicas y detalladas:</strong> Prioriza reseñas que mencionan platos específicos, el servicio, el ambiente o experiencias concretas. Son más creíbles que comentarios genéricos
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Cantidad ideal: 5-10 reseñas:</strong> Mostrar entre 5 y 10 reseñas es el punto óptimo. Menos de 5 puede parecer poco convincente, más de 10 puede saturar a los visitantes
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Actualiza regularmente:</strong> Rota las reseñas cada 2-3 meses agregando nuevas reseñas recientes y desactivando (no eliminando) las más antiguas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Variedad de clientes:</strong> Intenta mostrar reseñas de diferentes tipos de clientes: familias, parejas, grupos de amigos, comensales de negocios, etc.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Orden estratégico:</strong> Coloca tus mejores reseñas (5 estrellas con comentarios detallados) al principio. Los primeros 2-3 testimonios tienen el mayor impacto
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Autenticidad ante todo:</strong> Nunca inventes reseñas falsas. Los clientes detectan rápidamente testimonios falsos y dañará tu reputación gravemente
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <HelpCircle className="h-5 w-5" />
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Puedo usar reseñas de Google o TripAdvisor?</h4>
                    <p className="text-xs text-muted-foreground">
                      Sí, pero solicita permiso al cliente primero. Las reseñas públicas pueden copiarse legalmente citando la fuente, pero es mejor práctica pedir autorización. Usa el campo de fecha para mantener la fecha original.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Debo mostrar reseñas de 3 estrellas o menos?</h4>
                    <p className="text-xs text-muted-foreground">
                      No es recomendable. Tu sitio web es tu espacio de marketing, no una plataforma de reseñas. Enfócate en mostrar tu mejor versión con reseñas de 4-5 estrellas.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Cuántas reseñas necesito para empezar?</h4>
                    <p className="text-xs text-muted-foreground">
                      Mínimo 3-5 reseñas para que sea creíble. Si estás empezando y no tienes suficientes, solicita activamente feedback a tus primeros clientes satisfechos.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Puedo editar el texto de una reseña del cliente?</h4>
                    <p className="text-xs text-muted-foreground">
                      Puedes hacer correcciones menores (errores tipográficos), pero no cambies el significado. Si necesitas acortar una reseña muy larga, hazlo con "..." y pide permiso al cliente. La autenticidad es crucial.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Dónde aparecen las reseñas en mi sitio web?</h4>
                    <p className="text-xs text-muted-foreground">
                      Las reseñas típicamente aparecen en una sección dedicada de tu página principal y/o en una página "Reseñas" o "Testimonios", dependiendo de tu configuración de navegación.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">¿Las medias estrellas se ven en el sitio web?</h4>
                    <p className="text-xs text-muted-foreground">
                      Sí, el sistema renderiza automáticamente medias estrellas visualmente. Una calificación de 4.5 mostrará 4 estrellas completas y media estrella, no 5 estrellas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "configuracion-email":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cómo Configurar tu Correo Electrónico Profesional</CardTitle>
              <CardDescription>
                Aprende a configurar correos electrónicos profesionales para tu dominio con NameCheap y Cloudflare
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Video Tutorial Placeholder */}
              <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Video Tutorial Próximamente</p>
                  <p className="text-sm text-muted-foreground">
                    Aquí aparecerá un video tutorial completo del proceso
                  </p>
                </div>
              </div>

              {/* Step 1: Buy Email Service */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Comprar Servicio de Email en NameCheap</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>NameCheap ofrece correo electrónico profesional desde $0.99 USD al mes (facturado anualmente):</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>
                          Ve a{" "}
                          <a
                            href="https://www.namecheap.com/hosting/email/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline inline-flex items-center gap-1"
                          >
                            NameCheap Email Hosting
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                        <li>Selecciona el plan "Starter" que cuesta $0.99/mes (facturado anualmente a $11.88/año). También puedes elegir otros planes si necesitas más buzones y/o almacenamiento</li>
                        <li>
                          <strong>Consejo:</strong> Si eres nuevo en NameCheap, puedes usar el código de descuento que aparece en la tabla de precios
                        </li>
                        <li>Ingresa el nombre de dominio para el cual quieres crear cuentas de correo. Si compraste el dominio con NameCheap, haz clic en "Use a domain I own with Namecheap" y selecciona tu dominio de la lista</li>
                        <li>Haz clic en "Add to Cart" y completa el proceso de compra</li>
                        <li>Después de la compra, recibirás un correo de confirmación con instrucciones de acceso</li>
                      </ol>

                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                          💡 <strong>Consejo:</strong> El plan Starter incluye 3 buzones de correo con 5GB de almacenamiento cada uno. Si necesitas más buzones, puedes actualizar a planes superiores.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Create Email Accounts */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Crear Cuentas de Correo</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Una vez que hayas comprado el servicio:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Inicia sesión en tu cuenta de NameCheap</li>
                        <li>Ve a "Products" {">"} "Private Email"</li>
                        <li>Haz clic en "Manage" para tu dominio</li>
                        <li>Haz clic en "Create New Mailbox" (Crear nuevo buzón)</li>
                        <li>Ingresa el nombre de usuario (ej: info, contacto, ventas)</li>
                        <li>Crea una contraseña segura para el buzón</li>
                        <li>Haz clic en "Create Mailbox"</li>
                      </ol>

                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✅ <strong>Ejemplos comunes:</strong> info@tudominio.com, contacto@tudominio.com, ventas@tudominio.com, reservas@tudominio.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Get DNS Records */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Obtener el Registro DKIM de NameCheap</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Para la configuración automática, solo necesitas el valor DKIM:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>En el panel de Private Email de NameCheap, haz clic en "Settings" (Configuración)</li>
                        <li>Ve a la sección "DNS Records" o "Mail Settings"</li>
                        <li>Busca el registro DKIM (empieza con "v=DKIM1;")</li>
                        <li>Copia el valor completo del registro DKIM</li>
                      </ol>

                      <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          📋 <strong>Importante:</strong> Solo necesitas copiar el valor DKIM. Los registros MX y SPF se configurarán automáticamente.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Verify Configuration */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Verificar Configuración</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>Para confirmar que tu correo está funcionando correctamente:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-4">
                        <li>Ve al panel de Private Email en NameCheap</li>
                        <li>Verifica que aparezca un check verde o mensaje de "DNS Verified"</li>
                        <li>Envía un correo de prueba desde tu nueva dirección de correo</li>
                        <li>Envía un correo a tu nueva dirección para verificar la recepción</li>
                      </ol>

                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✅ <strong>¡Configuración Completa!</strong> Ahora puedes acceder a tu correo desde el webmail de NameCheap en privateemail.com o configurarlo en tu aplicación de correo favorita (Gmail, Outlook, etc.).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5: Access Your Email */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    5
                  </div>
                  <div className="space-y-3 flex-1">
                    <h3 className="text-xl font-semibold">Acceder a tu Correo</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="font-medium mb-2">Opciones para acceder a tu correo:</p>
                      
                      <div className="space-y-3">
                        <div className="bg-teal-600 text-white rounded-lg p-4">
                          <p className="font-medium mb-2">Opción 1: Webmail de NameCheap</p>
                          <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                            <li>
                              Ve a{" "}
                              <a
                                href="https://privateemail.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white underline hover:text-teal-100 inline-flex items-center gap-1"
                              >
                                privateemail.com
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </li>
                            <li>Ingresa tu dirección de correo completa</li>
                            <li>Ingresa la contraseña que creaste</li>
                          </ul>
                        </div>

                        <div className="bg-teal-600 text-white rounded-lg p-4">
                          <p className="font-medium mb-2">Opción 2: Configurar en tu aplicación de correo</p>
                          <p className="text-sm mb-2">Configuración IMAP (recomendado):</p>
                          <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                            <li>Servidor entrante (IMAP): mail.privateemail.com</li>
                            <li>Puerto IMAP: 993 (SSL)</li>
                            <li>Servidor saliente (SMTP): mail.privateemail.com</li>
                            <li>Puerto SMTP: 465 (SSL) o 587 (TLS)</li>
                            <li>Usuario: tu dirección de correo completa</li>
                            <li>Contraseña: la contraseña que creaste</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Help */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">¿Necesitas Ayuda?</h3>
                <p className="text-muted-foreground mb-4">
                  Si tienes problemas con la configuración de tu correo electrónico, nuestro equipo de soporte está aquí para ayudarte.
                </p>
                <Button variant="outline" asChild>
                  <a href="/client/support" target="_blank" rel="noopener noreferrer">
                    Contactar Soporte
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "horarios-reserva":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Horarios de Reserva</CardTitle>
                <CardDescription className="text-base">
                  Configura las franjas horarias en las que tu restaurante acepta reservas online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>¿Qué son los Horarios de Reserva?</AlertTitle>
                  <AlertDescription>
                    Los horarios de reserva definen cuándo tu restaurante acepta reservas online. Puedes crear diferentes franjas horarias para cada día de la semana, establecer capacidades específicas y configurar reglas especiales para grupos grandes.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">1. Crear un Nuevo Horario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Para agregar un nuevo horario de reserva, sigue estos pasos:
                </p>
                
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>Haz clic en el botón <strong className="text-foreground">"Agregar Horario"</strong> en la parte superior</li>
                  <li>Selecciona el <strong className="text-foreground">día de la semana</strong> (Lunes a Domingo)</li>
                  <li>Establece la <strong className="text-foreground">hora de inicio</strong> del turno (formato 24h, ej: 13:00)</li>
                  <li>Define la <strong className="text-foreground">hora de fin</strong> del turno (formato 24h, ej: 16:00)</li>
                  <li>Indica la <strong className="text-foreground">capacidad máxima</strong> de comensales para ese horario</li>
                  <li>Haz clic en <strong className="text-foreground">"Guardar"</strong> para crear el horario</li>
                </ol>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-900 dark:text-blue-100">Consejo</AlertTitle>
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    Puedes crear múltiples horarios para el mismo día. Por ejemplo, un turno de almuerzo (13:00-16:00) y uno de cena (20:00-23:00).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">2. Campos del Formulario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Día de la Semana</h4>
                        <p className="text-sm text-muted-foreground">
                          Selecciona el día para el cual aplica este horario. Cada día puede tener múltiples horarios.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Hora de Inicio y Fin</h4>
                        <p className="text-sm text-muted-foreground">
                          Define la franja horaria del turno en formato 24 horas. Ejemplo: 13:00 a 16:00 para almuerzo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Capacidad Máxima</h4>
                        <p className="text-sm text-muted-foreground">
                          Número máximo de comensales que pueden reservar en este horario. El sistema bloqueará nuevas reservas cuando se alcance este límite.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Power className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold mb-1">Estado (Activo/Inactivo)</h4>
                        <p className="text-sm text-muted-foreground">
                          Un horario inactivo no aparecerá como opción de reserva para los clientes. Útil para desactivar temporalmente un horario sin eliminarlo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">3. Configuración de Mesas Personalizada (Opcional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Además de la capacidad global, puedes definir tipos de mesa específicos para cada horario. Esto te da control detallado sobre qué mesas están disponibles en qué momentos.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold">Campos de Configuración de Mesas:</h4>
                  
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm"><strong>Nombre:</strong> Identificador del tipo de mesa (ej: "Mesa 2 pax", "Mesa VIP")</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm"><strong>Asientos:</strong> Número de sillas disponibles en este tipo de mesa</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm"><strong>Cantidad:</strong> Cuántas mesas de este tipo tienes disponibles</p>
                  </div>
                  
                  <div className="p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm"><strong>Min/Max Comensales:</strong> Rango de personas que puede acomodar (ej: una mesa de 4 puede aceptar 2-4 personas)</p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Si no configuras mesas personalizadas para un horario, el sistema utilizará las mesas globales configuradas en la pestaña "Configuración de Mesas".
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">4. Grupos Especiales (Más de 8 Personas)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Puedes activar configuraciones especiales para grupos grandes que requieren atención personalizada.
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2">¿Cuándo usar Grupos Especiales?</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>Reservas de más de 8 comensales</li>
                      <li>Eventos corporativos o celebraciones</li>
                      <li>Situaciones que requieren confirmación previa</li>
                      <li>Grupos con necesidades especiales (menú personalizado, espacio privado, etc.)</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2">Configuración</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Al activar "Grupos Especiales", puedes personalizar:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>El mensaje que verán los clientes al hacer reservas grandes</li>
                      <li>Requisitos especiales de confirmación</li>
                      <li>Información adicional que deben proporcionar</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">5. Gestionar Horarios Existentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Una vez creados los horarios, puedes gestionarlos fácilmente:
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Edit className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Editar</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el icono de lápiz para modificar cualquier campo del horario.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Copy className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Duplicar</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Crea una copia del horario para aplicarlo rápidamente a otro día de la semana.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Power className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Activar/Desactivar</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Alterna el estado del horario con un solo clic. Los horarios inactivos no aparecen en el sistema de reservas.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <h4 className="font-semibold">Eliminar</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Elimina permanentemente un horario. Esta acción requiere confirmación.
                    </p>
                  </div>
                </div>

                <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Importante:</strong> Los cambios en horarios no afectan las reservas ya confirmadas, solo las nuevas reservas que se realicen.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">6. Mejores Prácticas y Consejos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Separa Turnos Claramente</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Crea horarios separados para almuerzo y cena. Esto te permite tener diferentes capacidades y configuraciones para cada turno.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Ajusta Según la Demanda</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Revisa regularmente tus horarios y ajusta las capacidades según la demanda real. Los fines de semana suelen requerir mayor capacidad.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Usa la Función Duplicar</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Si tienes el mismo horario en varios días, duplica el primero en lugar de crear cada uno desde cero. Ahorra tiempo y evita errores.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Desactiva en lugar de Eliminar</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Para cambios temporales (vacaciones, eventos especiales), desactiva los horarios en lugar de eliminarlos. Así puedes reactivarlos fácilmente después.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Puedo tener diferentes capacidades para el mismo día?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      Sí, puedes crear múltiples horarios para el mismo día con diferentes capacidades. Por ejemplo, 40 personas para almuerzo y 60 para cena.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Qué pasa si no configuro mesas personalizadas?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      El sistema utilizará automáticamente las mesas globales configuradas en "Configuración de Mesas". Solo necesitas mesas personalizadas si quieres diferente disponibilidad por horario.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Los cambios afectan las reservas existentes?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      No, los cambios en horarios solo afectan las nuevas reservas. Las reservas ya confirmadas se mantienen sin cambios.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Puedo tener horarios que se solapen?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      Sí, puedes crear horarios solapados si lo necesitas (ej: 13:00-16:00 y 14:00-17:00). El sistema calculará la disponibilidad correctamente considerando todos los horarios activos.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">¿Necesitas Ayuda?</h4>
                    <p className="text-sm text-muted-foreground">
                      Si tienes dudas sobre cómo configurar tus horarios de reserva o necesitas ayuda personalizada, nuestro equipo de soporte está disponible para asistirte.
                    </p>
                    <Button asChild variant="outline" className="mt-2">
                      <a href="/client/support" target="_blank" rel="noopener noreferrer">
                        Contactar Soporte
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "configuracion-mesas":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Configuración Global de Mesas</CardTitle>
                <CardDescription className="text-base">
                  Navega a: Reservas → Configuración de Mesas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-900 dark:text-blue-100">¿Qué es la Configuración Global de Mesas?</AlertTitle>
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    Esta es tu configuración <strong>predeterminada de mesas</strong> que se aplica a todos los horarios de reserva. Aquí defines los tipos de mesa que tiene tu restaurante físicamente (ej: mesas de 2, 4, 6 personas) y esta información se usa para calcular automáticamente la disponibilidad de reservas.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-900 dark:text-green-100">Indicadores Visuales en el Sistema</AlertTitle>
                  <AlertDescription className="text-green-800 dark:text-green-200 space-y-2">
                    <p>En la sección "Horarios de Reserva" verás indicadores que te muestran qué configuración usa cada horario:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>🌐 Global:</strong> El horario usa las mesas configuradas aquí (configuración global)</li>
                      <li><strong>🎯 Personalizada:</strong> El horario tiene su propia configuración de mesas específica</li>
                    </ul>
                    <p className="mt-2">Puedes pasar el cursor sobre estos indicadores para ver más información.</p>
                  </AlertDescription>
                </Alert>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>¿Cuándo usar Configuración Personalizada?</AlertTitle>
                  <AlertDescription>
                    Si en ciertos horarios (ej: cenas de viernes y sábado) tienes una distribución diferente de mesas disponibles para reservas, puedes sobrescribir esta configuración global en la sección "Horarios de Reserva". Simplemente edita el horario específico y activa la opción de personalizar mesas.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">1. Crear una Nueva Configuración de Mesa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Para agregar un tipo de mesa, sigue estos pasos:
                </p>
                
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>Haz clic en el botón <strong className="text-foreground">"Agregar Configuración"</strong></li>
                  <li>Completa los campos del formulario</li>
                  <li>Haz clic en <strong className="text-foreground">"Crear"</strong> para guardar</li>
                </ol>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Después de crear tus configuraciones, verás un resumen con el <strong>total de mesas</strong> y la <strong>capacidad total</strong> de tu restaurante.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">2. Campos del Formulario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Cada tipo de mesa requiere la siguiente información:
                </p>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Type className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Nombre</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Un identificador descriptivo para este tipo de mesa.
                        </p>
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <strong>Ejemplos:</strong> "Mesa para 2", "Mesa familiar", "Mesa VIP", "Mesa terraza 4 pax"
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Layout className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Asientos</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Número exacto de sillas/asientos que tiene cada mesa de este tipo.
                        </p>
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <strong>Ejemplo:</strong> Una mesa de 4 asientos = 4
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Copy className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Cantidad de Mesas</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Cuántas mesas de este tipo existen físicamente en tu restaurante.
                        </p>
                        <div className="bg-muted/50 p-2 rounded text-xs">
                          <strong>Ejemplo:</strong> Si tienes 5 mesas de 2 personas = 5
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Mínimo y Máximo de Personas</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Rango de comensales que puede acomodar este tipo de mesa. Permite cierta flexibilidad.
                        </p>
                        <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
                          <p><strong>Ejemplo 1:</strong> Mesa de 4 asientos → Min: 3, Max: 5 (permite flexibilidad)</p>
                          <p><strong>Ejemplo 2:</strong> Mesa de 2 asientos → Min: 1, Max: 2 (reservas individuales o parejas)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Duración Predeterminada (minutos)</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Tiempo estimado que un grupo permanece en la mesa. Ayuda a calcular cuántas rotaciones de mesas son posibles.
                        </p>
                        <div className="bg-muted/50 p-2 rounded text-xs space-y-1">
                          <p><strong>Mínimo:</strong> 30 minutos (incrementos de 30 min)</p>
                          <p><strong>Sugerido almuerzo:</strong> 90-120 minutos</p>
                          <p><strong>Sugerido cena:</strong> 120-180 minutos</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          💡 Esta duración se puede sobrescribir en horarios específicos si es necesario.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle className="text-amber-900 dark:text-amber-100">Validaciones Automáticas</AlertTitle>
                  <AlertDescription className="text-amber-800 dark:text-amber-200 space-y-1">
                    <p>• El mínimo de personas no puede ser mayor que el máximo</p>
                    <p>• El máximo de personas no puede exceder el número de asientos</p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">3. Gestionar Configuraciones Existentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Una vez creadas las configuraciones, tienes varias opciones de gestión:
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Pencil className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Editar</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Modifica cualquier campo de una configuración existente haciendo clic en el icono de lápiz.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Power className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Activar/Desactivar</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Usa el switch para activar o desactivar tipos de mesa temporalmente sin eliminarlos.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <h4 className="font-semibold">Eliminar</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Elimina permanentemente una configuración. Las reservas existentes no se verán afectadas.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">Resumen de Capacidad</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Visualiza el total de mesas activas y la capacidad total de tu restaurante.
                    </p>
                  </div>
                </div>

                <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Mesas Inactivas:</strong> Las mesas marcadas como inactivas no se considerarán en el cálculo de disponibilidad. Úsalas para quitar temporalmente mesas del sistema (ej: mantenimiento, evento privado).
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">4. Vista de la Interfaz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  La interfaz se adapta automáticamente al dispositivo que estés usando:
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Layout className="h-4 w-4 text-primary" />
                      Vista de Escritorio
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Muestra una tabla completa con todas las configuraciones y sus detalles en columnas organizadas.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Layout className="h-4 w-4 text-primary" />
                      Vista Móvil
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Presenta cada configuración en tarjetas individuales para facilitar la lectura y gestión en pantallas pequeñas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">5. Ejemplo Práctico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Configuración típica para un restaurante mediano:
                </p>

                <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-lg border-2 border-primary/20">
                  <h4 className="font-bold text-lg mb-4 text-primary">Restaurante "La Estrella"</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-background p-3 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Mesa para 2</span>
                        <Badge>Activa</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Asientos: <strong>2</strong></div>
                        <div>Cantidad: <strong>4 mesas</strong></div>
                        <div>Personas: <strong>1-2</strong></div>
                        <div>Duración: <strong>90 min</strong></div>
                      </div>
                    </div>

                    <div className="bg-background p-3 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Mesa para 4</span>
                        <Badge>Activa</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Asientos: <strong>4</strong></div>
                        <div>Cantidad: <strong>6 mesas</strong></div>
                        <div>Personas: <strong>3-5</strong></div>
                        <div>Duración: <strong>120 min</strong></div>
                      </div>
                    </div>

                    <div className="bg-background p-3 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Mesa para 6</span>
                        <Badge>Activa</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Asientos: <strong>6</strong></div>
                        <div>Cantidad: <strong>2 mesas</strong></div>
                        <div>Personas: <strong>5-7</strong></div>
                        <div>Duración: <strong>150 min</strong></div>
                      </div>
                    </div>

                    <div className="bg-background p-3 rounded-lg border">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">Mesa VIP</span>
                        <Badge>Activa</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Asientos: <strong>8</strong></div>
                        <div>Cantidad: <strong>1 mesa</strong></div>
                        <div>Personas: <strong>6-8</strong></div>
                        <div>Duración: <strong>180 min</strong></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-primary/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="font-semibold">
                        Total de mesas: <span className="text-primary">13 mesas</span>
                      </div>
                      <div className="font-semibold">
                        Capacidad total: <span className="text-primary">56 personas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">6. Mejores Prácticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Permite Flexibilidad</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Configura rangos de personas ligeramente flexibles. Por ejemplo, una mesa de 4 puede aceptar 3-5 personas, dándote más opciones para acomodar reservas.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Duraciones Realistas</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Establece duraciones basadas en tu experiencia real. Mesas más pequeñas suelen tener rotación más rápida. Grupos grandes necesitan más tiempo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Nombres Descriptivos</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Usa nombres claros que te ayuden a identificar rápidamente el tipo de mesa. Incluye la ubicación si es relevante (ej: "Mesa terraza 4 pax").
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Revisa Regularmente</h4>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          Ajusta tu configuración según la demanda real y los cambios en tu restaurante (nueva distribución, mesas adicionales, etc.).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Preguntas Frecuentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Cuál es la diferencia entre configuración global y personalizada?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      La configuración <strong>global</strong> (esta sección) define todas tus mesas y se aplica por defecto a todos los horarios. La configuración <strong>personalizada</strong> (en Horarios de Reserva) te permite definir mesas específicas solo para ciertos horarios, sobrescribiendo la configuración global.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Qué pasa si desactivo una mesa?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      Las mesas inactivas no se consideran en el cálculo de disponibilidad de nuevas reservas. Las reservas existentes no se verán afectadas. Es útil para quitar temporalmente mesas sin eliminar su configuración.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Puedo tener mesas del mismo tamaño con diferentes duraciones?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      Sí, puedes crear múltiples configuraciones con el mismo número de asientos pero diferentes duraciones. Por ejemplo, "Mesa 4 rápida" (90 min) y "Mesa 4 standard" (120 min).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Cómo afecta la duración al sistema de reservas?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      El sistema usa la duración para calcular cuántas veces puede rotarse una mesa en un turno. Por ejemplo, si un horario dura 3 horas y las mesas tienen duración de 90 minutos, el sistema puede aceptar 2 reservas en la misma mesa.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      ¿Es obligatorio configurar mesas?
                    </h4>
                    <p className="text-sm text-muted-foreground pl-6">
                      Sí, necesitas al menos una configuración de mesa para que el sistema pueda calcular la disponibilidad. Sin mesas configuradas, no se podrán aceptar reservas.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-lg">¿Necesitas Ayuda?</h4>
                    <p className="text-sm text-muted-foreground">
                      Si tienes dudas sobre cómo configurar tus mesas o necesitas asesoramiento para optimizar tu capacidad de reservas, nuestro equipo está aquí para ayudarte.
                    </p>
                    <Button asChild variant="outline" className="mt-2">
                      <a href="/client/support" target="_blank" rel="noopener noreferrer">
                        Contactar Soporte
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "disponibilidad-reservas":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Disponibilidad de Reservas</CardTitle>
                <CardDescription className="text-base">
                  Navega a: Reservas → Disponibilidad
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>¿Qué es la Vista de Disponibilidad?</AlertTitle>
                  <AlertDescription>
                    Esta vista te muestra en tiempo real la disponibilidad completa de mesas para los próximos 28 días, calculada automáticamente según tus horarios, configuración de mesas y reservas existentes. También te permite crear reservas manuales directamente.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>💡 Ayuda contextual:</strong> En la esquina superior derecha verás un ícono de ayuda (<HelpCircle className="h-3 w-3 inline" />). Haz clic para ver información sobre cómo se calcula la disponibilidad en tiempo real.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Cálculo Automático */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Cálculo Automático Inteligente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  El sistema calcula automáticamente la disponibilidad cada 30 minutos para los próximos 28 días, considerando múltiples factores:
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <CalendarIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Horarios de Reserva Activos</h4>
                        <p className="text-sm text-muted-foreground">
                          Solo se muestran intervalos dentro de tus horarios configurados. Si no has configurado horarios para un día, ese día no aparecerá.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Layout className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Configuración de Mesas</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Usa las mesas configuradas (globales o personalizadas por horario). Si un horario tiene configuración personalizada, se usa esa; si no, se usan las mesas globales.
                        </p>
                        <div className="bg-muted/30 p-2 rounded text-xs">
                          <strong>Ejemplo:</strong> Si tu configuración global tiene 5 mesas de 4 personas, pero un horario de cena tiene configuración personalizada con 8 mesas de 4 personas, la disponibilidad de ese horario se calcula con 8 mesas.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Duración de Reservas</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Cada tipo de mesa tiene una duración predeterminada (ej: 90, 120, 150 minutos). El sistema bloquea una mesa durante esa duración cuando se reserva.
                        </p>
                        <div className="bg-muted/30 p-2 rounded text-xs">
                          <strong>Bloqueo Bidireccional:</strong> Si alguien reserva a las 20:00 con duración de 120 min, no solo se bloquea 20:00-22:00, sino que también se bloquean intervalos anteriores si se solaparían (ej: 19:30, 19:00).
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Tamaño del Grupo</h4>
                        <p className="text-sm text-muted-foreground">
                          Cada tipo de mesa tiene rangos de capacidad (min-max personas). Una mesa de 4 asientos podría aceptar 3-5 personas, dando flexibilidad.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Solo Reservas Confirmadas</h4>
                        <p className="text-sm text-muted-foreground">
                          El cálculo solo considera reservas con estado "Confirmado". Las pendientes, canceladas o completadas no afectan la disponibilidad.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vista de Disponibilidad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Entender la Vista de Disponibilidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  La disponibilidad se organiza en acordeones expandibles por fecha:
                </p>

                <div className="space-y-3">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 p-3 border-b">
                      <h4 className="font-semibold text-sm">Encabezado de Fecha</h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="text-sm">
                        <strong>Muestra:</strong> Día de la semana, fecha completa, y resumen de disponibilidad
                      </div>
                      <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
                        <p><strong>Ejemplo:</strong> "Viernes, 15 de noviembre 2024"</p>
                        <p className="text-green-600">✓ "8 de 12 horarios disponibles" (buena disponibilidad)</p>
                        <p className="text-yellow-600">⚠ "3 de 12 horarios disponibles" (disponibilidad limitada)</p>
                        <p className="text-destructive">✗ "0 de 12 horarios disponibles" (día completo)</p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 p-3 border-b">
                      <h4 className="font-semibold text-sm">Detalles de Horario</h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Al expandir una fecha, ves todos los intervalos de 30 minutos dentro de tus horarios configurados:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-muted/20 rounded">
                          <span className="font-medium text-sm">20:00</span>
                          <span className="text-xs text-green-600">5 mesas disponibles</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-2">
                          Debajo del horario se muestran tarjetas con cada tipo de mesa
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/30 p-3 border-b">
                      <h4 className="font-semibold text-sm">Tarjetas de Mesa</h4>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Cada tarjeta muestra un tipo de mesa con:
                      </p>
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-primary/5 border-b border-primary/20 p-3">
                          <div className="font-semibold text-sm">Mesa para 4</div>
                          <div className="text-xs text-muted-foreground">4 asientos</div>
                        </div>
                        <div className="p-3 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Disponibilidad</span>
                            <span className="font-semibold text-green-600">3/6</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t">
                            <span className="text-muted-foreground">Capacidad</span>
                            <span className="font-medium">3-5 personas</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 bg-muted/30 p-2 rounded text-xs space-y-1">
                        <p><strong>Verde (3/6):</strong> Buena disponibilidad</p>
                        <p><strong>Amarillo (2/6):</strong> Disponibilidad limitada (≤2 mesas)</p>
                        <p><strong>Rojo (0/6):</strong> Sin disponibilidad</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advertencias de Capacidad */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Advertencias de Capacidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Si la disponibilidad es muy limitada, verás una alerta amarilla en la parte superior:
                </p>

                <Alert className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/10">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-sm">
                    <span className="font-medium">Atención:</span> La disponibilidad es limitada en varios días. Algunos días están completamente llenos. Considera agregar más mesas o horarios.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/30 p-3 rounded text-sm space-y-2">
                  <p><strong>Esta alerta aparece cuando:</strong></p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                    <li>Hay días completamente llenos (0% de horarios disponibles)</li>
                    <li>Varios días tienen ≤20% de horarios disponibles</li>
                  </ul>
                  <p className="text-xs mt-2"><strong>Recomendación:</strong> Si ves esto frecuentemente, considera ajustar tu configuración de mesas o horarios.</p>
                </div>
              </CardContent>
            </Card>

            {/* Crear Reserva Manual */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Crear Reservas Manuales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Puedes crear reservas directamente desde esta vista para clientes que llaman por teléfono o WhatsApp:
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">1.</span>
                      Abrir el Formulario
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Haz clic en el botón <strong>"Agregar Reserva"</strong> en la esquina superior derecha.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">2.</span>
                      Seleccionar Fecha
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      El selector de fecha solo muestra fechas que tienen horarios configurados. Si una fecha no aparece, es porque no tienes horarios para ese día.
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs">
                      Las fechas se muestran en formato legible: "Lunes 15 nov"
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">3.</span>
                      Seleccionar Hora
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Una vez seleccionada la fecha, el selector de hora se activa. Solo muestra horarios con disponibilidad:
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
                      <p><strong>Formato:</strong> "20:00 (5 disponibles)"</p>
                      <p><strong>Si dice (0 disponibles):</strong> Ese horario está completo y aparecerá deshabilitado</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">4.</span>
                      Seleccionar Número de Personas
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Después de elegir fecha y hora, el selector de personas se activa. Solo muestra tamaños de grupo que tienen mesas disponibles:
                    </p>
                    <div className="bg-muted/30 p-2 rounded text-xs">
                      <strong>Ejemplo:</strong> Si solo quedan mesas de 4 y 6 personas, solo verás opciones de 3-5 personas (rango de la mesa de 4) y 5-7 personas (rango de la mesa de 6).
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">5.</span>
                      Ingresar Datos del Cliente
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Completa los campos requeridos:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2 mt-2">
                      <li><strong>Nombre:</strong> Obligatorio</li>
                      <li><strong>Teléfono:</strong> Obligatorio</li>
                      <li><strong>Email:</strong> Obligatorio</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="text-primary">6.</span>
                      Crear la Reserva
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Haz clic en <strong>"Crear Reserva"</strong>. El sistema:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                      <li>Selecciona automáticamente la mesa más adecuada para el tamaño del grupo</li>
                      <li>Asigna la duración configurada para ese tipo de mesa</li>
                      <li>Crea la reserva con estado <Badge variant="default" className="text-xs">Confirmado</Badge></li>
                      <li>Actualiza automáticamente la disponibilidad</li>
                    </ul>
                  </div>
                </div>

                <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    <strong>Ventaja:</strong> El formulario te guía paso a paso, mostrando solo opciones válidas en cada etapa. Es imposible crear una reserva para un horario sin disponibilidad.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Selección Inteligente de Mesas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Selección Inteligente de Mesas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cuando creas una reserva manual, no necesitas elegir qué mesa específica asignar. El sistema lo hace automáticamente usando un algoritmo inteligente:
                </p>

                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-3 text-sm">¿Cómo Funciona?</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">1.</span>
                      <span>Filtra solo las mesas que tienen capacidad disponible en ese horario</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">2.</span>
                      <span>De esas mesas, descarta las que no pueden acomodar el tamaño del grupo (fuera del rango min-max)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">3.</span>
                      <span>De las mesas válidas, elige la <strong>mesa más pequeña</strong> que pueda acomodar el grupo</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary font-bold">4.</span>
                      <span>Si no hay mesa disponible, rechaza la reserva con mensaje claro</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-muted/30 p-3 rounded text-sm space-y-2">
                  <p><strong>Ejemplo:</strong></p>
                  <p className="text-muted-foreground">
                    Un grupo de 3 personas quiere reservar. Hay disponibles: mesa de 2 (rango 1-2), mesa de 4 (rango 3-5), y mesa de 6 (rango 5-7).
                  </p>
                  <p className="text-green-600">
                    ✓ El sistema elige la mesa de 4 (la más pequeña que cumple el rango 3-5)
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Esto maximiza la eficiencia: guarda las mesas grandes para grupos grandes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actualización en Tiempo Real */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                  Actualización en Tiempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  La vista se actualiza automáticamente sin necesidad de recargar cuando:
                </p>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">Se crea una nueva reserva (manual o desde el sitio web)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">Se confirma una reserva pendiente</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">Se cancela o elimina una reserva</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">Cambias la configuración de mesas o horarios</span>
                  </div>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Si tienes múltiples pestañas abiertas, todas se actualizarán simultáneamente gracias a la sincronización en tiempo real.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Botón Scroll to Top */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ArrowUp className="h-5 w-5 text-primary" />
                  Navegación Rápida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Como la vista puede ser larga (28 días de disponibilidad), hay un botón flotante en la esquina inferior derecha (<ArrowUp className="h-3 w-3 inline" />) que te lleva instantáneamente al inicio de la página.
                </p>
              </CardContent>
            </Card>

            {/* Mejores Prácticas */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Lightbulb className="h-5 w-5" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Revisa la disponibilidad regularmente:</strong> Identifica patrones de demanda y ajusta tus horarios/mesas en consecuencia.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Actúa sobre las advertencias:</strong> Si ves alertas de capacidad frecuentemente, considera agregar más mesas o ampliar horarios en días populares.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Usa esta vista para decisiones estratégicas:</strong> Identifica qué días de la semana son más demandados y planifica tu staffing.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Reservas telefónicas:</strong> Esta es la vista ideal para atender llamadas. Puedes ver disponibilidad y crear reservas en segundos.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Confía en el sistema:</strong> No necesitas calcular manualmente. El algoritmo evita sobreventa automáticamente.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Por qué no aparece una fecha específica?</h4>
                    <p className="text-xs text-muted-foreground">
                      Solo aparecen fechas que tienen al menos un horario de reserva configurado y activo. Si falta una fecha, revisa la pestaña "Horarios de Reserva" para ese día de la semana.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Por qué un horario muestra 0 mesas disponibles?</h4>
                    <p className="text-xs text-muted-foreground">
                      Todas las mesas están reservadas para ese horario, considerando las duraciones. Recuerda que una reserva no solo bloquea su hora exacta, sino también intervalos anteriores/posteriores según la duración.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Puedo ver más de 28 días?</h4>
                    <p className="text-xs text-muted-foreground">
                      Actualmente el sistema muestra 28 días hacia adelante. Esto es suficiente para la mayoría de restaurantes y mantiene el rendimiento óptimo.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Qué pasa si creo una reserva manual por error?</h4>
                    <p className="text-xs text-muted-foreground">
                      Puedes cancelarla o eliminarla desde la pestaña "Lista de Reservas". La disponibilidad se actualizará automáticamente.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Las reservas manuales aparecen en el calendario también?</h4>
                    <p className="text-xs text-muted-foreground">
                      Sí, todas las reservas (manuales o del sitio web) aparecen en todas las vistas: disponibilidad, lista y calendario.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Por qué el formulario me restringe el número de personas?</h4>
                    <p className="text-xs text-muted-foreground">
                      El sistema solo muestra tamaños de grupo que pueden ser acomodados con las mesas disponibles en ese horario específico. Esto previene que crees reservas imposibles de cumplir.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ventaja del Sistema */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-green-900 dark:text-green-100 mb-2">
                    Ventaja Principal del Sistema
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    No necesitas calcular manualmente la disponibilidad, gestionar duraciones, o preocuparte por sobrevender mesas. 
                    El sistema hace todo el trabajo pesado automáticamente, actualizándose en tiempo real y guiándote paso a paso 
                    cuando creas reservas manuales. Esto elimina errores humanos y te da confianza total en tu gestión de reservas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "lista-reservas":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Lista de Reservas</CardTitle>
                <CardDescription className="text-base">
                  Navega a: Reservas → Lista de Reservas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>¿Qué es la Lista de Reservas?</AlertTitle>
                  <AlertDescription>
                    Aquí encuentras todas las reservas futuras de tu restaurante en un solo lugar. Puedes buscar, filtrar, actualizar estados, agregar notas internas y exportar datos. La lista se actualiza en tiempo real cuando llegan nuevas reservas.
                  </AlertDescription>
                </Alert>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <HelpCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>💡 Ayuda contextual:</strong> En la esquina superior derecha de la sección verás un ícono de ayuda (<HelpCircle className="h-3 w-3 inline" />). Haz clic para ver consejos rápidos sobre cómo gestionar tus reservas efectivamente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Interfaz Adaptativa */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Interfaz Adaptativa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  La lista se adapta automáticamente según el dispositivo que uses:
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      💻 Vista de Escritorio
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Tabla completa con todas las columnas: Fecha, Hora, Cliente, Contacto, Personas, Estado y Acciones. Ideal para gestión masiva de reservas.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📱 Vista Móvil
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Tarjetas individuales por reserva con toda la información organizada verticalmente. Enlaces directos para llamar o enviar email con un toque.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Herramientas de Búsqueda y Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Búsqueda y Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Search className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Búsqueda Rápida</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Encuentra reservas instantáneamente buscando por:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                          <li>Nombre del cliente</li>
                          <li>Número de teléfono</li>
                          <li>Correo electrónico</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Filter className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Filtro por Estado</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Usa el selector de estado para filtrar:
                        </p>
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Todos</Badge>
                            <span className="text-muted-foreground">Ver todas las reservas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">Pendiente</Badge>
                            <span className="text-muted-foreground">Solo pendientes de confirmar</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs">Confirmado</Badge>
                            <span className="text-muted-foreground">Reservas confirmadas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="text-xs">Cancelado</Badge>
                            <span className="text-muted-foreground">Reservas canceladas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">Completado</Badge>
                            <span className="text-muted-foreground">Visitas completadas</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Download className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Exportar a CSV</h4>
                        <p className="text-sm text-muted-foreground">
                          Descarga las reservas filtradas en formato CSV para análisis en Excel o respaldo. El archivo incluye: fecha, hora, cliente, contacto, personas, estado y solicitudes especiales.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Combina búsqueda + filtro para encontrar reservas muy específicas. Por ejemplo: filtra por "Pendiente" y busca un nombre para confirmar una reserva rápidamente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Gestión de Estados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Gestión de Estados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cada reserva tiene un estado que puedes actualizar fácilmente:
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="border-orange-500 text-orange-500">Pendiente</Badge>
                      <div className="flex-1">
                        <p className="text-sm mb-2">Nueva reserva recibida, esperando tu confirmación.</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p><strong>Acciones rápidas:</strong></p>
                          <ul className="list-disc list-inside ml-2">
                            <li>Botón <strong>"Confirmar"</strong> (<CheckCircle2 className="h-3 w-3 inline" />) para aceptar</li>
                            <li>Botón <strong>"Rechazar"</strong> (<XCircle className="h-3 w-3 inline" />) para declinar con motivo</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                    <div className="flex items-start gap-3">
                      <Badge variant="default">Confirmado</Badge>
                      <div className="flex-1">
                        <p className="text-sm">Reserva aceptada y garantizada. El cliente puede contar con su mesa.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-950/20">
                    <div className="flex items-start gap-3">
                      <Badge variant="destructive">Cancelado</Badge>
                      <div className="flex-1">
                        <p className="text-sm mb-2">Reserva rechazada por el restaurante o cancelada por el cliente.</p>
                        <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 mt-2">
                          <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                            <strong>Importante:</strong> Al rechazar una reserva, se abrirá un diálogo para que selecciones o especifiques el motivo (ej: "No hay mesas disponibles", "Fuera del horario", etc.). Este motivo se guarda por separado en "Motivo de Rechazo", preservando las solicitudes especiales originales del cliente.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary">Completado</Badge>
                      <div className="flex-1">
                        <p className="text-sm">El cliente llegó y completó su visita. Útil para mantener historial.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-semibold mb-2 text-sm">¿Cómo Cambiar el Estado?</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Reservas Pendientes:</strong> Usa los botones rápidos "Confirmar" o "Rechazar"</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span><strong>Otras Reservas:</strong> Usa el selector desplegable de estado para cambiar entre Pendiente, Confirmado, Cancelado o Completado</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Notas Internas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Notas Internas Privadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Las notas internas son <strong>privadas y solo visibles para ti</strong>. Úsalas para registrar información importante sobre cada reserva.
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Cuándo Usar Notas Internas?</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-2">
                      <li>Alergias alimentarias del cliente</li>
                      <li>Preferencias especiales (mesa junto a ventana, área tranquila)</li>
                      <li>Ocasiones especiales (cumpleaños, aniversario)</li>
                      <li>Clientes VIP o habituales</li>
                      <li>Instrucciones específicas del equipo</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Cómo Agregar Notas</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground ml-2">
                      <li>Haz clic en <strong>"Ver Detalles"</strong> de la reserva</li>
                      <li>Escribe tu nota en el campo "Notas Internas"</li>
                      <li>Haz clic en <strong>"Guardar Notas"</strong></li>
                    </ol>
                  </div>
                </div>

                <Alert>
                  <MessageSquare className="h-4 w-4" />
                  <AlertTitle>Campos en los Detalles de Reserva</AlertTitle>
                  <AlertDescription className="text-sm space-y-1">
                    <p><strong>Solicitudes Especiales del Cliente:</strong> Lo que el cliente escribió al hacer la reserva.</p>
                    <p><strong>Motivo de Rechazo:</strong> El motivo que registraste al declinar una reserva (solo visible si fue cancelada).</p>
                    <p><strong>Notas Internas:</strong> Solo las ves tú. Para tu gestión interna privada.</p>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Ver Detalles y Eliminar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Acciones Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Ver Detalles</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Abre un diálogo con toda la información de la reserva:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground ml-2">
                          <li>Información del cliente (nombre, email, teléfono)</li>
                          <li>Detalles de la reserva (fecha, hora, número de personas)</li>
                          <li>Solicitudes especiales del cliente</li>
                          <li>Tus notas internas (puedes editarlas aquí)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start gap-3">
                      <Trash2 className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">Eliminar Reserva</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          Elimina permanentemente una reserva del sistema. Se pedirá confirmación antes de eliminar.
                        </p>
                        <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 mt-2">
                          <AlertCircle className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                            <strong>Recomendación:</strong> En lugar de eliminar, considera cambiar el estado a "Cancelado" para mantener el historial.
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actualización en Tiempo Real */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">6</span>
                  Actualización en Tiempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  La lista se actualiza automáticamente sin necesidad de recargar la página cuando:
                </p>

                <div className="grid gap-2">
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">Llega una nueva reserva desde tu sitio web</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">Cambias el estado de una reserva</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">Agregas o editas notas internas</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 rounded border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm">Se elimina una reserva</span>
                  </div>
                </div>

                <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    <strong>Limpieza Automática:</strong> Las reservas de fechas pasadas se eliminan automáticamente del sistema para mantener la lista limpia y enfocada en reservas futuras.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Mejores Prácticas */}
            <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-800 dark:text-green-200">
                  <Lightbulb className="h-5 w-5" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Responde Rápido:</strong> Revisa y confirma las reservas pendientes lo antes posible. Los clientes aprecian confirmaciones rápidas.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Usa Notas Internas:</strong> Registra preferencias de clientes habituales para ofrecer un servicio personalizado en futuras visitas.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Marca Completadas:</strong> Al final del día, marca las reservas completadas para mantener un historial preciso.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Motivos Claros:</strong> Al rechazar reservas, proporciona siempre un motivo claro y específico.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Exporta Regularmente:</strong> Descarga tus datos mensualmente para análisis de tendencias y demanda.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Móvil-Friendly:</strong> La vista móvil incluye enlaces directos para llamar o enviar email. Úsalos para contactar clientes rápidamente.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Qué pasa con las reservas de ayer o de hace una semana?</h4>
                    <p className="text-xs text-muted-foreground">
                      Las reservas pasadas se eliminan automáticamente del sistema. Solo verás reservas futuras en la lista.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Cuál es la diferencia entre "Cancelado" y eliminar?</h4>
                    <p className="text-xs text-muted-foreground">
                      "Cancelado" mantiene un registro de la reserva en el sistema (útil para historial). Eliminar borra permanentemente la reserva. Recomendamos usar "Cancelado" en lugar de eliminar. El motivo del rechazo se guarda por separado del campo de solicitudes especiales del cliente.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿El cliente puede ver mis notas internas o el motivo de rechazo?</h4>
                    <p className="text-xs text-muted-foreground">
                      Las notas internas son completamente privadas y solo visibles en tu panel de administración. El motivo de rechazo tampoco es visible para el cliente actualmente, pero se guarda en el sistema para tu referencia y análisis interno.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Puedo buscar por fecha de reserva?</h4>
                    <p className="text-xs text-muted-foreground">
                      La búsqueda actual filtra por nombre, email y teléfono. Para ver reservas de un día específico, usa el Calendario de Reservas. Si necesitas búsqueda por fecha en la lista, contáctanos para sugerencias de mejora.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">¿Se notifica al cliente cuando cambio el estado?</h4>
                    <p className="text-xs text-muted-foreground">
                      Actualmente no se envían notificaciones automáticas por email. Recomendamos contactar al cliente directamente (los enlaces en la vista móvil facilitan esto).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "calendario-reservas":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Reservas</CardTitle>
              <CardDescription>
                Vista visual mensual interactiva de todas tus reservas con actualizaciones en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introducción */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  📅 El calendario de reservas te proporciona una vista visual mensual intuitiva de todas tus reservas, 
                  facilitando la planificación, organización y gestión del flujo de clientes en tu restaurante.
                </p>
              </div>

              {/* Navegación del Calendario */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Navegación del Calendario
                </h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <ChevronLeft className="h-4 w-4 text-primary" />
                      Cambiar de Mes
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Utiliza las flechas <strong>← y →</strong> en la parte superior para navegar entre meses anteriores y futuros. 
                      El calendario carga automáticamente todas las reservas del mes seleccionado.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Mes Actual</h4>
                    <p className="text-sm text-muted-foreground">
                      El nombre del mes y año se muestra centrado en el encabezado (ejemplo: "enero 2025"). 
                      La vista se actualiza instantáneamente al cambiar de mes.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Lectura del Calendario */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Cómo Leer el Calendario
                </h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-card">
                    <h4 className="font-medium mb-3">Días con Reservas</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium mb-1">📊 Badge Numérico</p>
                        <p className="text-muted-foreground">
                          Muestra el número total de reservas ese día (ejemplo: "3 reservas"). 
                          Este contador incluye reservas de todos los estados.
                        </p>
                      </div>
                      
                      <div>
                        <p className="font-medium mb-2">🎨 Indicadores de Color</p>
                        <p className="text-muted-foreground mb-2">
                          Pequeños círculos de colores que representan el estado de cada reserva:
                        </p>
                        <div className="space-y-2 ml-4">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-yellow-500 flex-shrink-0"></div>
                            <span><strong>Amarillo:</strong> Pendiente de confirmación</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500 flex-shrink-0"></div>
                            <span><strong>Verde:</strong> Confirmada</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-red-500 flex-shrink-0"></div>
                            <span><strong>Rojo:</strong> Cancelada</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                            <span><strong>Azul:</strong> Completada</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium mb-1">👆 Interactividad</p>
                        <p className="text-muted-foreground">
                          Los días con reservas son clickeables y cambian de color al pasar el mouse sobre ellos, 
                          indicando que puedes hacer click para ver más detalles.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Días sin Reservas</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                      <li>• Solo muestran el número del día</li>
                      <li>• No son clickeables ni interactivos</li>
                      <li>• Perfectos para identificar espacios disponibles de un vistazo</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Días de Otros Meses</h4>
                    <p className="text-sm text-muted-foreground">
                      Los días que pertenecen al mes anterior o siguiente aparecen atenuados (color gris claro). 
                      Estos días ayudan a mantener la estructura visual del calendario. Para ver sus reservas, 
                      navega al mes correspondiente.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ver Detalles de Reservas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Ver Detalles de un Día
                </h3>
                
                <div className="p-4 border rounded-lg bg-accent/10">
                  <ol className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary flex-shrink-0">1.</span>
                      <div>
                        <strong>Click en el Día:</strong> Haz click en cualquier día que tenga reservas 
                        (identificables por el badge numérico y los puntos de colores).
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary flex-shrink-0">2.</span>
                      <div>
                        <strong>Ventana de Detalles:</strong> Se abre un diálogo modal mostrando la fecha completa 
                        (ejemplo: "23 de enero de 2025") y todas las reservas de ese día ordenadas por hora.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary flex-shrink-0">3.</span>
                      <div>
                        <strong>Información Mostrada:</strong> Para cada reserva verás:
                        <ul className="mt-2 space-y-1 ml-4">
                          <li>• <strong>Nombre del cliente</strong></li>
                          <li>• <strong>Hora de reserva</strong> y número de personas (ejemplo: "19:00 • 4 personas")</li>
                          <li>• <strong>Teléfono</strong> con enlace clickeable para llamar directamente</li>
                          <li>• <strong>Email</strong> con enlace clickeable para enviar correo</li>
                          <li>• <strong>Estado actual</strong> con badge de color correspondiente</li>
                        </ul>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-primary flex-shrink-0">4.</span>
                      <div>
                        <strong>Cerrar Detalles:</strong> Click fuera del diálogo o en el botón × (cerrar) 
                        en la esquina superior derecha para volver a la vista del calendario.
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              <Separator />

              {/* Actualizaciones en Tiempo Real */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Actualizaciones en Tiempo Real
                </h3>
                
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium mb-3">
                    El calendario se actualiza automáticamente en tiempo real sin necesidad de recargar la página:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                    <li>• <strong>Nueva Reserva:</strong> Aparece inmediatamente en el calendario</li>
                    <li>• <strong>Cambio de Estado:</strong> Los indicadores de color se actualizan al instante</li>
                    <li>• <strong>Cancelación:</strong> El contador y los indicadores se ajustan automáticamente</li>
                    <li>• <strong>Eliminación:</strong> La reserva desaparece del calendario en tiempo real</li>
                    <li>• <strong>Sincronización:</strong> Funciona incluso si tienes múltiples pestañas abiertas</li>
                  </ul>
                  
                  <div className="mt-3 p-3 bg-background border rounded-lg">
                    <p className="text-sm">
                      <strong>💡 Nota:</strong> No necesitas refrescar manualmente. El sistema mantiene tu calendario 
                      sincronizado automáticamente con cualquier cambio en tus reservas, ya sea que lo hagas tú mismo, 
                      otro usuario, o que llegue desde el sitio web.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Casos de Uso Prácticos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Casos de Uso Prácticos
                </h3>
                
                <div className="grid gap-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <h4 className="font-semibold mb-1">Planificación de Personal</h4>
                        <p className="text-sm text-muted-foreground">
                          Identifica rápidamente los días con mayor volumen de reservas para ajustar el número 
                          de meseros y cocineros necesarios. Un vistazo al calendario te muestra toda la semana 
                          o mes completo.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <h4 className="font-semibold mb-1">Gestión de Capacidad</h4>
                        <p className="text-sm text-muted-foreground">
                          Visualiza la distribución de reservas a lo largo del mes para detectar patrones y 
                          optimizar tu disponibilidad. Si un día está muy lleno, puedes prepararte mejor.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📞</span>
                      <div>
                        <h4 className="font-semibold mb-1">Seguimiento Rápido</h4>
                        <p className="text-sm text-muted-foreground">
                          Accede fácilmente a la información de contacto de todos los clientes de un día específico 
                          para confirmaciones proactivas, avisos sobre cambios en el servicio, o emergencias.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">📈</span>
                      <div>
                        <h4 className="font-semibold mb-1">Análisis de Tendencias</h4>
                        <p className="text-sm text-muted-foreground">
                          Observa patrones semanales y mensuales (por ejemplo, "los viernes siempre tenemos más reservas") 
                          para tomar decisiones estratégicas sobre horarios especiales u ofertas.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Preguntas Frecuentes */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preguntas Frecuentes</h3>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger className="text-left">
                      ¿Por qué algunos días tienen varios círculos de colores?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Cada círculo representa el estado de una reserva individual. Si un día tiene múltiples 
                        reservas con diferentes estados (por ejemplo, 2 confirmadas y 1 pendiente), verás varios 
                        círculos de diferentes colores. La cantidad de círculos del mismo color indica cuántas 
                        reservas tienen ese estado específico. Esto te permite identificar de un vistazo la 
                        composición del día (por ejemplo, si tienes muchas pendientes que necesitas confirmar).
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-2">
                    <AccordionTrigger className="text-left">
                      ¿Puedo gestionar reservas desde el calendario?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        El calendario está diseñado principalmente para <strong>visualización</strong> y 
                        <strong>acceso rápido a información de contacto</strong>. Para gestionar reservas 
                        (confirmar, cancelar, agregar notas internas, etc.), debes ir a la pestaña 
                        <strong>"Lista de Reservas"</strong> donde encontrarás todas las opciones de gestión 
                        disponibles. Este diseño separa la vista general de la gestión detallada para mantener 
                        el calendario limpio y fácil de leer.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-3">
                    <AccordionTrigger className="text-left">
                      ¿El calendario muestra todas las reservas o solo algunas?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        El calendario muestra <strong>TODAS</strong> las reservas del mes seleccionado, 
                        independientemente de su estado (pendiente, confirmada, cancelada o completada). 
                        Esto te permite tener una visión completa del historial y las reservas activas de cada día. 
                        Los indicadores de color te ayudan a distinguir rápidamente el estado de cada una, 
                        permitiéndote, por ejemplo, ver cuántas reservas confirmadas vs pendientes tienes 
                        en un día determinado.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-4">
                    <AccordionTrigger className="text-left">
                      ¿Necesito refrescar para ver nuevas reservas?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>No.</strong> El calendario utiliza tecnología de actualización en tiempo real 
                        (WebSocket/Supabase Realtime) que sincroniza automáticamente la información sin necesidad 
                        de recargar la página.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cuando llegue una nueva reserva (ya sea creada manualmente por ti, por otro usuario con 
                        acceso, o desde el formulario del sitio web) o cambie el estado de una existente, 
                        los cambios aparecerán <strong>instantáneamente</strong> en tu calendario. Esto es 
                        especialmente útil si tienes varios dispositivos o usuarios gestionando reservas 
                        simultáneamente.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-5">
                    <AccordionTrigger className="text-left">
                      ¿Puedo ver reservas de meses pasados?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Sí, utiliza la flecha izquierda (←) para navegar a meses anteriores. Esto es muy útil para:
                      </p>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground ml-4">
                        <li>• Revisar el historial de reservas</li>
                        <li>• Analizar patrones de reservas pasadas</li>
                        <li>• Verificar información de clientes que visitaron anteriormente</li>
                        <li>• Planificar eventos especiales basándote en años anteriores</li>
                      </ul>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Todas las reservas se conservan en el sistema indefinidamente, independientemente de 
                        su antigüedad, permitiéndote acceder a datos históricos cuando los necesites.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-6">
                    <AccordionTrigger className="text-left">
                      ¿El calendario tiene en cuenta mi zona horaria?
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-muted-foreground">
                        Sí, el calendario respeta completamente la zona horaria configurada en los ajustes 
                        de tu cliente. Las fechas de las reservas se muestran correctamente según tu ubicación, 
                        evitando confusiones con fechas que pudieran aparecer desplazadas por diferencias horarias. 
                        Por ejemplo, si tu restaurante está en Lima (UTC-5) y recibes una reserva cerca de la 
                        medianoche, el sistema asegura que aparezca en el día correcto según tu zona horaria local.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              <Separator />

              {/* Consejos Profesionales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Consejos Profesionales
                </h3>
                
                <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">💡</span>
                      <div>
                        <strong>Revisión Matutina:</strong> Consulta el calendario cada mañana para preparar 
                        el servicio del día y anticipar el flujo de clientes. Revisa especialmente las reservas 
                        pendientes que necesitan confirmación.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">💡</span>
                      <div>
                        <strong>Planificación Semanal:</strong> Al inicio de cada semana, revisa los próximos 
                        7 días para coordinar compras de ingredientes según el volumen esperado y organizar 
                        turnos de personal adecuadamente.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">💡</span>
                      <div>
                        <strong>Identificación de Patrones:</strong> Observa qué días de la semana suelen tener 
                        más reservas para optimizar ofertas y promociones. Por ejemplo, si los martes son lentos, 
                        podrías ofrecer un descuento especial.
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">💡</span>
                      <div>
                        <strong>Contacto Proactivo:</strong> Usa los enlaces de teléfono y email en el diálogo 
                        de detalles para confirmar reservas importantes con anticipación o avisar sobre cambios 
                        en el servicio (por ejemplo, eventos especiales o cambios en el menú).
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">💡</span>
                      <div>
                        <strong>Vista Complementaria:</strong> Combina el calendario con la vista de "Lista de Reservas". 
                        Usa el calendario para obtener una vista general y planificación mensual, y la lista para 
                        gestión detallada día a día (confirmaciones, notas, etc.).
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Consejo Final */}
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✅ <strong>Recuerda:</strong> El calendario es tu herramienta de vista rápida y planificación. 
                  Para gestión detallada (confirmar, rechazar, agregar notas), usa la "Lista de Reservas". 
                  Juntas forman un sistema completo de gestión de reservas.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      
      case "introduccion-analiticas":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Introducción a las Analíticas</CardTitle>
              <CardDescription>
                Comprende cómo funciona el sistema de analíticas en tiempo real de tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ⭐ <strong>Función Premium:</strong> Las analíticas avanzadas están disponibles exclusivamente para clientes con el <strong>plan Avanzado</strong>. Si tienes el plan Básico, actualiza para acceder a todas las métricas detalladas.
                </p>
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  📊 <strong>Plan Básico y Google Search Console:</strong> Si estás en el plan Básico pero quieres verificar tu sitio en Google Search Console para enviar tu sitemap, consulta la <Link to="/guias/analiticas/configurar-google-search-console" className="underline font-medium">guía de Google Search Console</Link> para instrucciones de verificación DNS.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  ¿Qué son las Analíticas?
                </h3>
                <p className="text-muted-foreground">
                  El sistema de analíticas de Mi Restaurante Online rastrea automáticamente el comportamiento de los visitantes en tu sitio web en <strong>tiempo real</strong>. 
                  Cada interacción importante (visitas a páginas, clics en botones, tiempo en el sitio) se registra para que puedas tomar decisiones informadas sobre tu negocio.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>💡 Ejemplo práctico:</strong> Si notas que muchos visitantes hacen clic en "Reservar mesa" pero pocos completan la reserva, 
                    podrías simplificar el proceso de reserva. Si ves que la sección "Postres" de tu menú recibe muchas vistas, 
                    podrías destacarla más o crear promociones especiales.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Cómo Funciona el Sistema
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tu sistema de analíticas opera en un proceso automatizado de 3 etapas:
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white text-sm">1</span>
                      Recolección en Tiempo Real
                    </h4>
                    <p className="text-sm text-muted-foreground ml-8">
                      Tu sitio web rastrea automáticamente cada interacción del visitante: vistas de página, clics en WhatsApp, 
                      descargas del menú, tiempo en cada sección, etc. Estos eventos se almacenan temporalmente en el navegador 
                      del usuario y se envían periódicamente a la base de datos.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950 rounded-r-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white text-sm">2</span>
                      Procesamiento Diario Automatizado
                    </h4>
                    <p className="text-sm text-muted-foreground ml-8">
                      Cada día a las <strong>2:00 AM</strong>, un proceso automatizado analiza todos los eventos del día anterior, 
                      calcula métricas agregadas (visitantes únicos, tasa de rebote, tiempo promedio, etc.) y genera un reporte diario. 
                      Los eventos procesados se eliminan para mantener la base de datos limpia.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950 rounded-r-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white text-sm">3</span>
                      Visualización en el Dashboard
                    </h4>
                    <p className="text-sm text-muted-foreground ml-8">
                      Los datos procesados se muestran en tu panel de Analíticas con gráficos interactivos, tablas y métricas clave. 
                      Puedes filtrar por diferentes rangos de fechas (última semana, último mes, últimos 3 meses) y ver tendencias a lo largo del tiempo.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  ¿Dónde Encuentro mis Analíticas?
                </h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Acceso Directo desde el Panel</h4>
                    <p className="text-sm text-muted-foreground">
                      En tu <strong>Panel Principal</strong>, haz clic en la pestaña <strong>"Analíticas"</strong> en el menú de navegación. 
                      Aquí verás un resumen completo de todas tus métricas.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Sección de Analíticas Detalladas</h4>
                    <p className="text-sm text-muted-foreground">
                      La página de analíticas muestra varios paneles con información específica:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-muted-foreground">
                      <li>Vista general con métricas clave (visitas, tiempo promedio, tasa de rebote)</li>
                      <li>Gráfico de interacciones (clics en WhatsApp, teléfono, descargas de menú)</li>
                      <li>Distribución por tipo de dispositivo (móvil, tablet, escritorio)</li>
                      <li>Popularidad de secciones del menú</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Eventos Rastreados Automáticamente</h3>
                <p className="text-muted-foreground mb-3">
                  Tu sitio web rastrea los siguientes tipos de eventos sin necesidad de configuración adicional:
                </p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">📄 Vistas de Página</h4>
                    <p className="text-xs text-muted-foreground">Cada vez que alguien carga una página</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">💬 Clics en WhatsApp</h4>
                    <p className="text-xs text-muted-foreground">Cuando alguien hace clic para contactarte</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">📞 Clics en Teléfono</h4>
                    <p className="text-xs text-muted-foreground">Cuando alguien hace clic para llamarte</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">📥 Descargas de Menú</h4>
                    <p className="text-xs text-muted-foreground">Cuando descargan tu menú en PDF</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">📅 Clics en Reservar</h4>
                    <p className="text-xs text-muted-foreground">Intentos de hacer reserva</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">⏱️ Tiempo en Página</h4>
                    <p className="text-xs text-muted-foreground">Cuánto tiempo pasan en cada página</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">🍽️ Vistas de Secciones del Menú</h4>
                    <p className="text-xs text-muted-foreground">Qué partes del menú exploran más</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium text-sm mb-1">📜 Profundidad de Scroll</h4>
                    <p className="text-xs text-muted-foreground">Hasta dónde bajan en cada página</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Precisión de los Datos</h3>
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-green-900 dark:text-green-100">✅ Sistema 100% Preciso</h4>
                  <p className="text-sm text-green-900 dark:text-green-100 mb-2">
                    El sistema de analíticas ha sido probado y verificado para tener <strong>100% de precisión</strong>. 
                    Cada evento rastreado se procesa correctamente y los números en tu dashboard son exactos.
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-green-900 dark:text-green-100">
                    <li>Los eventos se recolectan en tiempo real sin pérdida de datos</li>
                    <li>El procesamiento diario verifica y valida todos los eventos</li>
                    <li>Los datos procesados coinciden 1:1 con los eventos originales</li>
                    <li>No hay duplicación ni omisión de eventos</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Próximos Pasos</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-medium mb-2">📊 Entender las Métricas</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Aprende qué significa cada métrica y cómo interpretarla para tu negocio.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/guias/analiticas/metricas">Ver Guía de Métricas</Link>
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary transition-colors">
                    <h4 className="font-medium mb-2">📈 Ver Estadísticas de Uso</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Descubre cómo leer y aprovechar el dashboard de analíticas al máximo.
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/guias/analiticas/estadisticas-uso">Leer Dashboard</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo Pro:</strong> Revisa tus analíticas al menos una vez por semana. Busca patrones: ¿Qué días recibes más visitas? 
                  ¿Qué secciones del menú son más populares? ¿Cuántos visitantes hacen clic en WhatsApp? Usa esta información para optimizar 
                  tu contenido, horarios y promociones.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "metricas":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Entendiendo las Métricas</CardTitle>
              <CardDescription>
                Guía completa de todas las métricas que tu sistema de analíticas rastrea y calcula
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  ⭐ <strong>Función Premium:</strong> Las métricas detalladas están disponibles exclusivamente para clientes con el <strong>plan Avanzado</strong>. 
                  El plan Básico <strong>NO</strong> incluye acceso al sistema de analíticas integrado.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Métricas de Tráfico Principal
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">📄 Páginas Vistas Totales</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cada vez que alguien carga una página en tu sitio, se cuenta como una vista. Esta es una métrica de <strong>volumen</strong> 
                      que te ayuda a entender el tráfico total.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>Ejemplo:</strong> Si tienes 500 páginas vistas, significa que tus visitantes cargaron 500 páginas en total 
                      (puede ser 500 personas viendo 1 página cada una, o 100 personas viendo 5 páginas cada una, etc.)
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">👥 Visitantes Únicos (Sesiones Únicas)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Número de <strong>personas diferentes</strong> que visitaron tu sitio. Se identifica mediante sesiones únicas del navegador.
                      Una misma persona que visita tu sitio 5 veces cuenta como 1 visitante único.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>Cómo se calcula:</strong> El sistema genera un ID único de sesión para cada navegador. Si el mismo navegador 
                      visita tu sitio varias veces el mismo día, se cuenta como 1 visitante único.
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📊 Relación Páginas/Visitante</h4>
                    <p className="text-sm text-muted-foreground">
                      Divide <strong>Páginas Vistas</strong> entre <strong>Visitantes Únicos</strong> para saber cuántas páginas ve cada persona en promedio.
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-muted-foreground">
                      <li><strong>1-2 páginas/visitante:</strong> Los visitantes ven poco contenido (posible problema de navegación o contenido)</li>
                      <li><strong>3-5 páginas/visitante:</strong> Buen engagement, exploran tu sitio</li>
                      <li><strong>5+ páginas/visitante:</strong> Excelente, muy interesados en tu contenido</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Métricas de Comportamiento
                </h3>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">⏱️ Tiempo Promedio en Página</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cuánto tiempo (en minutos y segundos) pasan los visitantes en tu sitio en promedio. Se calcula a partir de eventos de 
                      <code className="px-1 py-0.5 bg-muted rounded text-xs">time_on_page</code> registrados cuando alguien sale de una página.
                    </p>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                        <p className="text-xs font-medium text-red-900 dark:text-red-100">⚠️ Menos de 30 seg</p>
                        <p className="text-xs text-red-900 dark:text-red-100 mt-1">Visitantes salen rápido</p>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded">
                        <p className="text-xs font-medium text-amber-900 dark:text-amber-100">📈 1-3 minutos</p>
                        <p className="text-xs text-amber-900 dark:text-amber-100 mt-1">Engagement normal</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                        <p className="text-xs font-medium text-green-900 dark:text-green-100">✅ 3+ minutos</p>
                        <p className="text-xs text-green-900 dark:text-green-100 mt-1">Excelente interés</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🚪 Tasa de Rebote</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Porcentaje de visitantes que entraron a tu sitio y <strong>salieron sin ver ninguna otra página</strong>. 
                      Se calcula dividiendo sesiones con 1 sola página vista entre total de sesiones.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>Fórmula:</strong> (Sesiones con 1 página vista ÷ Total de sesiones) × 100
                    </div>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                        <p className="text-xs font-medium text-green-900 dark:text-green-100">✅ Menos de 40%</p>
                        <p className="text-xs text-green-900 dark:text-green-100 mt-1">Excelente retención</p>
                      </div>
                      <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded">
                        <p className="text-xs font-medium text-amber-900 dark:text-amber-100">📊 40-60%</p>
                        <p className="text-xs text-amber-900 dark:text-amber-100 mt-1">Normal para restaurantes</p>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded">
                        <p className="text-xs font-medium text-red-900 dark:text-red-100">⚠️ Más de 60%</p>
                        <p className="text-xs text-red-900 dark:text-red-100 mt-1">Revisar contenido</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Métricas de Interacción (Conversión)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Estas métricas son <strong>las más importantes</strong> porque miden acciones concretas que tus visitantes realizan. 
                  Son indicadores directos de interés y potenciales clientes.
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">💬 Clics en WhatsApp</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Número de veces que alguien hizo clic en el botón de WhatsApp para contactarte. Se rastrea en cualquier botón de WhatsApp 
                      de tu sitio (navegación, footer, sección de contacto, etc.)
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>💡 Acción:</strong> Si ves muchos clics en WhatsApp, asegúrate de responder rápido para convertir esos contactos en clientes. 
                      Si hay pocos clics, considera hacer el botón más visible o agregar mensajes de incentivo.
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">📞 Clics en Teléfono</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cuántas veces los visitantes hicieron clic en tu número de teléfono para llamarte. Principalmente desde dispositivos móviles.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">📥 Descargas del Menú</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Número de veces que descargaron tu menú en PDF. Indica interés serio en tu oferta.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>💡 Insight:</strong> Si muchas personas descargan tu menú pero pocas hacen reservas o te contactan, 
                      podría indicar que los precios no son competitivos o que falta un call-to-action claro después de ver el menú.
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">📅 Clics en Reservar</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cuántas veces los visitantes hicieron clic en el botón "Reservar mesa" o similar. Esta es una métrica de <strong>intención de conversión</strong>.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>⚠️ Importante:</strong> Compara esta métrica con las reservas reales completadas. Si hay muchos clics pero pocas reservas, 
                      tu formulario de reserva podría ser demasiado complicado.
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📊 Tasa de Conversión de Interacción</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Calcula manualmente: (Total de interacciones ÷ Visitantes únicos) × 100
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li><strong>Menos de 5%:</strong> Bajo, necesitas CTAs más claros o contenido más atractivo</li>
                      <li><strong>5-15%:</strong> Normal para sitios de restaurantes</li>
                      <li><strong>15%+:</strong> Excelente, tu sitio convierte muy bien</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Métricas de Dispositivos
                </h3>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">📱 Distribución por Tipo de Dispositivo</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Tu sistema detecta automáticamente el tipo de dispositivo (móvil, tablet, escritorio) de cada visitante y 
                    agrupa los datos. Esto te ayuda a optimizar la experiencia para tus visitantes principales.
                  </p>
                  
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">🖥️ Escritorio (Desktop)</span>
                      <span className="text-xs text-muted-foreground">Computadoras y laptops</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">📱 Móvil (Mobile)</span>
                      <span className="text-xs text-muted-foreground">Teléfonos smartphones</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">📱 Tablet</span>
                      <span className="text-xs text-muted-foreground">iPads y tablets Android</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <strong>💡 Uso típico:</strong> La mayoría de restaurantes reciben 60-80% de tráfico móvil. Si tu porcentaje es menor, 
                      asegúrate de que tu sitio se vea bien en dispositivos móviles.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Métricas de Contenido
                </h3>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">🍽️ Popularidad de Secciones del Menú</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Tu sitio rastrea automáticamente cuando los visitantes <strong>ven cada sección de tu menú</strong> usando tecnología de IntersectionObserver. 
                    Para cada sección registra:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 mt-2 text-sm text-muted-foreground">
                    <li><strong>Número de vistas:</strong> Cuántas veces se visualizó esa sección</li>
                    <li><strong>Tiempo promedio:</strong> Cuántos segundos en promedio pasan los visitantes viendo esa sección</li>
                  </ul>

                  <div className="mt-3 p-3 bg-muted rounded text-sm">
                    <strong>💡 Cómo usarlo:</strong> Si "Postres" tiene muchas vistas y alto tiempo promedio, considera destacarlos más en tu marketing. 
                    Si "Bebidas" tiene pocas vistas, tal vez necesites fotos más atractivas o descripciones más tentadoras.
                  </div>
                </div>
              </div>

              <Separator />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>¿Con qué frecuencia se actualizan las métricas?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Los eventos se recolectan en <strong>tiempo real</strong> mientras los visitantes navegan tu sitio. Sin embargo, 
                      las métricas agregadas (totales, promedios, tasas) se procesan <strong>una vez al día a las 2:00 AM</strong>. 
                      Esto significa que verás los datos del día anterior en tu dashboard a partir de las 2:00 AM.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2">
                  <AccordionTrigger>¿Qué métrica es la más importante?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      No hay una sola métrica "más importante", pero para restaurantes, prioriza en este orden:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li><strong>Clics en WhatsApp/Teléfono:</strong> Contacto directo = potenciales clientes</li>
                      <li><strong>Clics en Reservar:</strong> Intención clara de reservar</li>
                      <li><strong>Descargas del Menú:</strong> Interés serio en tu oferta</li>
                      <li><strong>Tiempo en página:</strong> Indica engagement con tu contenido</li>
                      <li><strong>Visitantes únicos:</strong> Alcance de tu sitio</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger>¿Cómo se identifica a un visitante único?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      El sistema genera un ID de sesión único para cada navegador que visita tu sitio. Este ID se guarda temporalmente 
                      en el navegador del usuario. Si la misma persona visita tu sitio varias veces el mismo día desde el mismo navegador, 
                      se cuenta como 1 visitante único. Si usa un navegador diferente o borra sus cookies, contará como un nuevo visitante único.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4">
                  <AccordionTrigger>¿Las métricas incluyen mis propias visitas al sitio?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Sí, actualmente el sistema rastrea todas las visitas, incluyendo las tuyas. Para obtener datos más precisos de visitantes reales, 
                      evita navegar tu sitio en modo de navegación normal. Usa el modo incógnito o pide a amigos/familiares que prueben el sitio 
                      en lugar de hacerlo tú mismo repetidamente.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 <strong>Consejo Pro:</strong> No te obsesiones con una sola métrica. La clave está en ver el <strong>panorama completo</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-blue-900 dark:text-blue-100">
                  <li>Alto tráfico + baja interacción = Necesitas mejorar tu contenido o CTAs</li>
                  <li>Bajo tráfico + alta interacción = Necesitas más marketing para atraer visitantes</li>
                  <li>Alto tiempo en página + baja tasa de rebote = Contenido atractivo que retiene visitantes</li>
                  <li>Muchas descargas de menú + pocos contactos = Revisa tus precios o agrega incentivos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "estadisticas-uso":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cómo Leer el Dashboard de Analíticas</CardTitle>
              <CardDescription>
                Guía completa para interpretar y aprovechar tu panel de analíticas al máximo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  ⭐ <strong>Función Premium:</strong> El dashboard de analíticas completo está disponible exclusivamente para clientes con el <strong>plan Avanzado</strong>.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  Acceso al Dashboard de Analíticas
                </h3>
                <p className="text-muted-foreground">
                  Para acceder a tus analíticas, ve a tu <strong>Panel Principal</strong> y haz clic en la pestaña <strong>"Analíticas"</strong> 
                  en el menú de navegación. Alternativamente, puedes acceder directamente desde la URL: <code className="px-2 py-1 bg-muted rounded text-sm">
                  /client/analytics/[tu-client-id]</code>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  Selector de Rango de Fechas
                </h3>
                <p className="text-muted-foreground mb-3">
                  En la parte superior del dashboard encontrarás un selector de rango de fechas que te permite filtrar los datos por diferentes períodos:
                </p>
                
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📅 Última Semana</h4>
                    <p className="text-sm text-muted-foreground">
                      Últimos 7 días. Ideal para ver tendencias recientes y hacer ajustes rápidos.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📅 Último Mes</h4>
                    <p className="text-sm text-muted-foreground">
                      Últimos 30 días. Perfecto para análisis mensual y comparar semanas.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📅 Últimos 3 Meses</h4>
                    <p className="text-sm text-muted-foreground">
                      Últimos 90 días. Útil para identificar tendencias a largo plazo y estacionalidad.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 <strong>Tip:</strong> El dashboard suma automáticamente todos los datos del rango seleccionado. 
                    Por ejemplo, si seleccionas "Último Mes", verás la suma total de páginas vistas, clics, etc. de los últimos 30 días.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Panel de Vista General (Overview Cards)
                </h3>
                <p className="text-muted-foreground mb-3">
                  La primera sección del dashboard muestra 4 tarjetas principales con las métricas más importantes:
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">📄 Páginas Vistas</h4>
                      <Badge variant="outline">Métrica de Volumen</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Número total de páginas cargadas por todos los visitantes en el período seleccionado.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>Ejemplo:</strong> Si muestra "1,250", significa que se cargaron 1,250 páginas en total en el período.
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950 rounded-r-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">👥 Visitantes Únicos</h4>
                      <Badge variant="outline">Métrica de Alcance</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Número de personas diferentes que visitaron tu sitio (basado en sesiones únicas).
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>Ejemplo:</strong> Si muestra "350", significa que 350 personas diferentes visitaron tu sitio en el período.
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950 rounded-r-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">⏱️ Tiempo Promedio</h4>
                      <Badge variant="outline">Métrica de Engagement</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Tiempo promedio que los visitantes pasan en tu sitio, mostrado en formato <code>mm:ss</code>.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>Ejemplo:</strong> Si muestra "2:35", significa que en promedio los visitantes pasan 2 minutos y 35 segundos en tu sitio.
                    </div>
                  </div>

                  <div className="p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-950 rounded-r-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">🚪 Tasa de Rebote</h4>
                      <Badge variant="outline">Métrica de Retención</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Porcentaje de visitantes que solo vieron una página y se fueron, mostrado como porcentaje (%).
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded text-sm">
                      <strong>Ejemplo:</strong> Si muestra "45%", significa que 45% de tus visitantes solo vieron una página antes de salir.
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Panel de Métricas de Interacción
                </h3>
                <p className="text-muted-foreground mb-3">
                  Esta sección muestra cuántas veces los visitantes interactuaron con elementos clave de tu sitio. 
                  Son las métricas más importantes porque representan <strong>acciones reales</strong> de potenciales clientes.
                </p>
                
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <span className="text-lg">💬</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Clics en WhatsApp</h4>
                        <p className="text-xs text-muted-foreground">Contactos directos</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">45</p>
                    <p className="text-xs text-muted-foreground mt-1">personas hicieron clic para contactarte</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-lg">📞</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Clics en Teléfono</h4>
                        <p className="text-xs text-muted-foreground">Llamadas potenciales</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-xs text-muted-foreground mt-1">personas intentaron llamarte</p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <span className="text-lg">📥</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Descargas de Menú</h4>
                        <p className="text-xs text-muted-foreground">Interés en tu oferta</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-xs text-muted-foreground mt-1">personas descargaron tu menú</p>
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    💡 <strong>Cómo interpretar:</strong> Estas son las acciones más valiosas. Un clic en WhatsApp o teléfono representa 
                    una persona interesada que quiere contactarte. Monitorea estas métricas de cerca y responde rápido a los mensajes para convertirlos en clientes.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Layout className="h-5 w-5 text-primary" />
                  Distribución por Dispositivos
                </h3>
                <p className="text-muted-foreground mb-3">
                  Esta sección muestra un gráfico de barras horizontales con el porcentaje de visitantes por tipo de dispositivo. 
                  Te ayuda a entender desde dónde te visitan tus clientes.
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Cómo Leer el Gráfico</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      El gráfico muestra barras de diferentes colores para cada tipo de dispositivo. 
                      La longitud de cada barra representa el porcentaje del total.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-4 bg-blue-500 rounded"></div>
                        <span className="text-sm">📱 Mobile (típicamente 60-80%)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-4 bg-green-500 rounded"></div>
                        <span className="text-sm">🖥️ Desktop (típicamente 15-30%)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-4 bg-amber-500 rounded"></div>
                        <span className="text-sm">📱 Tablet (típicamente 5-10%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h4 className="font-medium mb-2 text-amber-900 dark:text-amber-100">⚠️ Qué hacer con esta información</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-amber-900 dark:text-amber-100">
                      <li><strong>Si Mobile &gt; 70%:</strong> Prioriza la experiencia móvil, botones grandes, textos legibles</li>
                      <li><strong>Si Desktop &gt; 40%:</strong> Aprovecha el espacio para mostrar más contenido visual</li>
                      <li><strong>Si Tablet &gt; 15%:</strong> Asegúrate de que tu sitio se vea bien en pantallas medianas</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Popularidad de Secciones del Menú
                </h3>
                <p className="text-muted-foreground mb-3">
                  Esta sección final muestra una tabla con las secciones más vistas de tu menú, ordenadas de mayor a menor popularidad. 
                  Incluye el número de vistas y el tiempo promedio que los visitantes pasan en cada sección.
                </p>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Cómo Leer la Tabla</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Sección del Menú</th>
                          <th className="text-center py-2">Vistas</th>
                          <th className="text-center py-2">Tiempo Promedio</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">🍕 Pizzas</td>
                          <td className="text-center">245</td>
                          <td className="text-center">1:45</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">🍰 Postres</td>
                          <td className="text-center">189</td>
                          <td className="text-center">2:10</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">🥗 Ensaladas</td>
                          <td className="text-center">156</td>
                          <td className="text-center">1:20</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>Vistas:</strong> Cuántas veces esa sección apareció en la pantalla de los visitantes (se detecta automáticamente con IntersectionObserver)
                    </p>
                    <p>
                      <strong>Tiempo Promedio:</strong> Cuánto tiempo en promedio los visitantes pasan mirando esa sección (formato mm:ss)
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">💡 Estrategias según Popularidad</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-blue-900 dark:text-blue-100">
                    <li><strong>Sección muy vista + alto tiempo:</strong> Es tu estrella, destácala más en marketing y redes sociales</li>
                    <li><strong>Sección muy vista + bajo tiempo:</strong> Interés inicial pero pierden interés. Mejora descripciones/fotos</li>
                    <li><strong>Sección poco vista + alto tiempo:</strong> Los que la ven les encanta. Hazla más visible en el sitio</li>
                    <li><strong>Sección poco vista + bajo tiempo:</strong> Considera mejorarla o eliminarla del menú</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  Actualización de Datos
                </h3>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Frecuencia de Actualización</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Los datos en tu dashboard se actualizan <strong>una vez al día a las 2:00 AM</strong>. Esto significa que:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-sm text-muted-foreground">
                    <li>Los datos que ves hoy corresponden hasta el día anterior completo (hasta las 11:59 PM)</li>
                    <li>Las visitas y eventos de hoy se procesarán y aparecerán mañana después de las 2:00 AM</li>
                    <li>No necesitas refrescar manualmente la página, los datos se cargan automáticamente al abrir el dashboard</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    ✅ <strong>Sistema 100% Preciso:</strong> El sistema ha sido verificado para tener 100% de precisión. 
                    Cada evento rastreado se procesa correctamente y los números que ves son exactos, sin duplicados ni omisiones.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estado Sin Datos</h3>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">¿Qué significa "No hay datos disponibles"?</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Si ves este mensaje en tu dashboard, puede significar:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-sm text-muted-foreground">
                    <li>Tu sitio web aún no ha recibido visitas en el período seleccionado</li>
                    <li>El sistema de analíticas está en proceso de recolectar datos (espera 24 horas después del lanzamiento)</li>
                    <li>Seleccionaste un rango de fechas anterior al lanzamiento de tu sitio</li>
                  </ul>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      💡 <strong>Solución:</strong> Comparte el enlace de tu sitio web en redes sociales, con amigos y familiares. 
                      En 24 horas verás los primeros datos en tu dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-1">
                  <AccordionTrigger>¿Puedo exportar los datos de analíticas?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Actualmente el sistema no ofrece exportación directa de datos. Sin embargo, puedes tomar capturas de pantalla del dashboard 
                      o anotar manualmente los números clave. Si necesitas exportación de datos, contacta a soporte para solicitar esta función.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-2">
                  <AccordionTrigger>¿Las analíticas afectan la velocidad de mi sitio?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      No. El sistema de analíticas está optimizado para no afectar la velocidad de carga. Los eventos se recolectan de forma 
                      asíncrona en segundo plano y se envían en lotes pequeños cada cierto tiempo, sin interferir con la experiencia del usuario.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-3">
                  <AccordionTrigger>¿Puedo ver analíticas en tiempo real?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      No. El dashboard muestra datos procesados del día anterior. Los eventos se recolectan en tiempo real en tu sitio web, 
                      pero se procesan en lote a las 2:00 AM cada día. Esto garantiza mayor precisión y optimiza el rendimiento del sistema.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-4">
                  <AccordionTrigger>¿Por qué mis números son diferentes a Google Analytics?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Es normal que haya pequeñas diferencias entre diferentes sistemas de analíticas debido a:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Diferentes métodos de detección de bots y spam</li>
                      <li>Diferente definición de "sesión" o "visitante único"</li>
                      <li>Uso de bloqueadores de anuncios (afectan más a Google Analytics)</li>
                      <li>Diferente zona horaria configurada</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ambos sistemas son válidos. Usa las tendencias y patrones en lugar de números absolutos para tomar decisiones.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="faq-5">
                  <AccordionTrigger>¿Cómo puedo aumentar mis métricas de interacción?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Para aumentar clics en WhatsApp, teléfono y descargas de menú:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Haz los botones más visibles (colores contrastantes, tamaño adecuado)</li>
                      <li>Agrega mensajes de incentivo: "¡Pregúntanos por nuestras promociones!", "Reserva ahora y obtén 10% de descuento"</li>
                      <li>Coloca los botones de contacto en múltiples ubicaciones (header, footer, después del menú, etc.)</li>
                      <li>Agrega testimonios y reseñas para generar confianza antes del contacto</li>
                      <li>Incluye fotos atractivas de tus platos para despertar el deseo de contactarte</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 <strong>Mejores Prácticas:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-blue-900 dark:text-blue-100">
                  <li>Revisa tus analíticas al menos <strong>una vez por semana</strong>, preferiblemente el mismo día cada semana</li>
                  <li>Toma nota de los números clave en un cuaderno o hoja de cálculo para ver tendencias mes a mes</li>
                  <li>No te frustres si los números son bajos al inicio. Concéntrate en el crecimiento gradual</li>
                  <li>Usa el selector de rango para comparar períodos: ¿Este mes tuviste más visitas que el mes pasado?</li>
                  <li>Presta más atención a las <strong>métricas de interacción</strong> (WhatsApp, teléfono) que a las de volumen (páginas vistas)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "configurar-google-analytics":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Google Analytics (GA4)</CardTitle>
              <CardDescription>
                Conecta Google Analytics para rastrear visitantes y comportamiento en tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  ⭐ <strong>Función Premium:</strong> Google Analytics está disponible exclusivamente para el <strong>plan Avanzado</strong>. Si tienes el plan Básico, actualiza para integrar GA4 a tu sitio web.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nota Importante</AlertTitle>
                <AlertDescription>
                  Google actualiza frecuentemente la ubicación de sus configuraciones. Si los pasos que ves aquí no coinciden exactamente con lo que ves en tu pantalla, consulta la guía oficial de Google: <a href="https://support.google.com/analytics/answer/9304153" target="_blank" rel="noopener noreferrer" className="text-primary underline">Configurar Analytics para un sitio web (Guía oficial de Google)</a>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  ¿Qué es Google Analytics 4 (GA4)?
                </h3>
                <p className="text-muted-foreground">
                  Google Analytics 4 es la plataforma de análisis web más popular del mundo. Te permite rastrear visitantes, analizar su comportamiento, entender de dónde vienen (búsqueda, redes sociales, etc.), y tomar decisiones basadas en datos reales para mejorar tu negocio.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>💡 Complementa tus Analíticas Integradas:</strong> Mientras que Mi Restaurante Online te da analíticas específicas para restaurantes (interacciones con menú, clics en reservas, etc.), Google Analytics te da una visión más amplia del tráfico web, fuentes de referencia, y comportamiento de usuarios.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 1: Crear una Propiedad de Google Analytics 4</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">1.1 Accede a Google Analytics</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ve a <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">analytics.google.com</a> e inicia sesión con tu cuenta de Google.
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">1.2 Crear una Cuenta</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Si es tu primera vez, haz clic en <strong>"Crear Cuenta"</strong> (Account). Dale un nombre a tu cuenta (ej: "Mi Restaurante").
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">1.3 Crear una Propiedad</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Dentro de la cuenta, crea una <strong>"Propiedad"</strong> (Property). Dale un nombre (ej: "Sitio Web Restaurante"), elige tu zona horaria y moneda.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>⚠️ Importante:</strong> Asegúrate de crear una propiedad <strong>GA4</strong> (Google Analytics 4), no una propiedad Universal Analytics (ya está descontinuada).
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950 rounded-r-lg">
                    <h4 className="font-medium mb-2">1.4 Configurar un Data Stream</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Google te pedirá configurar un <strong>"Data Stream"</strong>. Selecciona <strong>"Web"</strong>, ingresa la URL de tu sitio web (ej: https://turestaurante.com) y dale un nombre al stream.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Al crear el stream, Google te mostrará un <strong>"Measurement ID"</strong> que comienza con <strong>"G-"</strong> (ej: G-XXXXXXXXXX). <strong>Copia este ID</strong>, lo necesitarás en el siguiente paso.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 2: Compartir tu Measurement ID con Soporte</h3>
                <p className="text-muted-foreground mb-3">
                  Como cliente del plan Avanzado, nuestro equipo de soporte instalará el código de Google Analytics en tu sitio web por ti. Solo necesitas proporcionarnos tu Measurement ID.
                </p>

                <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <Mail className="h-4 w-4" />
                    Qué Enviar a Soporte
                  </h4>
                  <div className="space-y-2 text-sm text-amber-900 dark:text-amber-100">
                    <p><strong>Asunto:</strong> Instalación de Google Analytics (GA4)</p>
                    <p><strong>Mensaje sugerido:</strong></p>
                    <div className="p-3 bg-white dark:bg-gray-900 rounded border text-muted-foreground mt-2">
                      <p className="mb-2">Hola equipo de soporte,</p>
                      <p className="mb-2">Me gustaría integrar Google Analytics 4 en mi sitio web.</p>
                      <p className="mb-2">Mi <strong>Measurement ID</strong> es: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">G-XXXXXXXXXX</span></p>
                      <p>Por favor, instalen el código de seguimiento en mi sitio web.</p>
                      <p className="mt-2">Gracias!</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Tiempo de Implementación</h4>
                    <p className="text-sm text-muted-foreground">
                      Nuestro equipo instalará el código de Google Analytics en tu sitio web en un plazo de <strong>24-48 horas</strong>. Te notificaremos por correo cuando esté listo.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 3: Verificar que Funciona</h3>
                <p className="text-muted-foreground mb-3">
                  Una vez que el equipo de soporte instale el código, puedes verificar que Google Analytics esté funcionando correctamente.
                </p>

                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Opción 1: Reporte en Tiempo Real</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-4">
                      <li>Ve a tu propiedad de Google Analytics</li>
                      <li>En el menú lateral, haz clic en <strong>"Informes"</strong> → <strong>"Tiempo real"</strong></li>
                      <li>Abre tu sitio web en otra pestaña del navegador</li>
                      <li>Deberías ver <strong>al menos 1 usuario activo</strong> en el reporte de tiempo real (tú mismo)</li>
                    </ol>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Opción 2: Google Tag Assistant</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Instala la extensión de Chrome <a href="https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Tag Assistant</a>, visita tu sitio web, y la extensión te indicará si detecta el código de Google Analytics.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Próximos Pasos: Explorando Google Analytics</h3>
                <p className="text-muted-foreground mb-3">
                  Una vez que Google Analytics esté funcionando, puedes empezar a explorar tus datos:
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📊 Informes de Adquisición</h4>
                    <p className="text-sm text-muted-foreground">
                      Descubre de dónde vienen tus visitantes: búsqueda de Google, redes sociales, enlaces directos, etc.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🎯 Informes de Engagement</h4>
                    <p className="text-sm text-muted-foreground">
                      Analiza qué páginas son más populares, cuánto tiempo pasan los usuarios en tu sitio, y más.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🌍 Informes Demográficos</h4>
                    <p className="text-sm text-muted-foreground">
                      Conoce la edad, género, ubicación geográfica e intereses de tus visitantes (requiere activar señales de Google).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📱 Informes de Tecnología</h4>
                    <p className="text-sm text-muted-foreground">
                      Ve qué dispositivos, navegadores y sistemas operativos usan tus visitantes.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    💡 <strong>Consejo:</strong> Explora los informes de GA4 regularmente para entender tendencias de tráfico, identificar páginas con bajo rendimiento, y optimizar tu estrategia de marketing. Combina estos datos con las analíticas integradas de Mi Restaurante Online para tener una visión 360° de tu negocio.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Recursos Oficiales de Google
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://support.google.com/analytics/answer/9304153" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                      Configurar Analytics para un sitio web (Guía oficial)
                    </a>
                  </li>
                  <li>
                    <a href="https://support.google.com/analytics/answer/10110290" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                      Configurar tu propiedad GA4 con Setup Assistant
                    </a>
                  </li>
                  <li>
                    <a href="https://developers.google.com/analytics/devguides/collection/ga4" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                      Documentación para desarrolladores de GA4
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "configurar-google-search-console":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Configurar Google Search Console</CardTitle>
              <CardDescription>
                Verifica tu sitio web en Google Search Console para mejorar tu SEO y enviar tu sitemap
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nota Importante</AlertTitle>
                <AlertDescription>
                  Google actualiza frecuentemente la ubicación de sus configuraciones. Si los pasos que ves aquí no coinciden exactamente con lo que ves en tu pantalla, consulta la guía oficial de Google: <a href="https://support.google.com/webmasters/answer/9008080" target="_blank" rel="noopener noreferrer" className="text-primary underline">Verificar la propiedad del sitio (Guía oficial de Google)</a>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  ¿Qué es Google Search Console?
                </h3>
                <p className="text-muted-foreground">
                  Google Search Console (GSC) es una herramienta gratuita de Google que te ayuda a monitorear y mejorar cómo aparece tu sitio en los resultados de búsqueda de Google. Con GSC puedes ver qué palabras clave traen tráfico, identificar problemas de indexación, enviar tu sitemap, y optimizar tu presencia en Google.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>💡 Por qué es importante:</strong> Verificar tu sitio en GSC te permite enviar tu sitemap para que Google indexe tu sitio más rápido, detectar errores técnicos que afectan tu SEO, y entender qué búsquedas llevan a tu restaurante.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Beneficios de Usar Google Search Console</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Ver cuántas personas encuentran tu restaurante en Google</li>
                  <li>Saber qué búsquedas muestran tu sitio web</li>
                  <li>Identificar problemas técnicos que afectan tu SEO</li>
                  <li>Enviar tu sitemap para indexación más rápida</li>
                  <li>Monitorear el rendimiento móvil de tu sitio</li>
                  <li>Recibir alertas sobre problemas de seguridad</li>
                </ul>
              </div>

              <Separator />

              {/* Basic Plan Section */}
              <div className="p-5 border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <CheckCircle className="h-5 w-5" />
                  Plan Básico: Verificación DNS
                </h3>
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-4">
                  Si tienes el <strong>Plan Básico</strong>, puedes verificar tu sitio en Google Search Console para enviar tu sitemap. 
                  La verificación se hace mediante un <strong>registro DNS TXT</strong> que nosotros añadiremos por ti.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <h4 className="font-medium mb-2">Paso 1: Obtener el Registro TXT de Google</h4>
                    <ol className="list-decimal list-inside space-y-2 ml-4 text-sm text-muted-foreground">
                      <li>Ve a <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Search Console</a> e inicia sesión</li>
                      <li>Haz clic en <strong>"Agregar propiedad"</strong></li>
                      <li>Selecciona <strong>"Dominio"</strong> (opción de la izquierda)</li>
                      <li>Ingresa tu dominio (ej: <code className="bg-muted px-2 py-0.5 rounded text-xs">turestaurante.com</code>)</li>
                      <li>Google te mostrará un <strong>registro TXT</strong> que se ve así:</li>
                    </ol>
                    <div className="p-3 bg-muted rounded mt-3">
                      <code className="text-xs">google-site-verification=ABC123xyz789_EJEMPLO-codigo</code>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Copia este código completo</strong> (incluye todo después del =)
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <h4 className="font-medium mb-2">Paso 2: Enviar el Registro a Soporte</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Contacta a nuestro equipo de soporte con la siguiente información:
                    </p>
                    <div className="p-3 bg-muted rounded text-sm">
                      <p className="mb-2"><strong>Asunto:</strong> Verificación DNS para Google Search Console</p>
                      <p className="mb-2"><strong>Mensaje sugerido:</strong></p>
                      <div className="pl-3 border-l-2 border-primary">
                        <p className="mb-1">Hola equipo,</p>
                        <p className="mb-1">Necesito verificar mi dominio en Google Search Console.</p>
                        <p className="mb-1">Mi dominio es: <strong>turestaurante.com</strong></p>
                        <p className="mb-1">El registro TXT que Google me dio es:</p>
                        <p className="font-mono text-xs bg-background px-2 py-1 rounded mb-1">google-site-verification=ABC123xyz789_EJEMPLO-codigo</p>
                        <p>Por favor, añadan este registro DNS TXT a mi dominio.</p>
                        <p className="mt-2">Gracias!</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <h4 className="font-medium mb-2">Paso 3: Verificar en Google (después de 24-48h)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Una vez que nuestro equipo añada el registro DNS (te notificaremos por email):
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Vuelve a Google Search Console</li>
                      <li>Haz clic en <strong>"Verificar"</strong></li>
                      <li>Si todo está correcto, verás <strong>"Propiedad verificada"</strong> ✅</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <h4 className="font-medium mb-2">Paso 4: Enviar tu Sitemap</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Una vez verificado, puedes enviar tu sitemap:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>En Google Search Console, ve a <strong>"Sitemaps"</strong></li>
                      <li>Ingresa: <code className="bg-muted px-2 py-0.5 rounded text-xs">sitemap.xml</code></li>
                      <li>Haz clic en <strong>"Enviar"</strong></li>
                    </ol>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Advanced Plan Section */}
              <div className="p-5 border-2 border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-purple-900 dark:text-purple-100">
                  <Sparkles className="h-5 w-5" />
                  Plan Avanzado: Integración Completa
                </h3>
                <p className="text-sm text-purple-900 dark:text-purple-100 mb-4">
                  Con el <strong>Plan Avanzado</strong>, tienes varias opciones para verificar tu sitio, incluyendo verificación por etiqueta HTML, integración con Google Analytics, y más.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <h4 className="font-medium mb-2">Opción 1: Verificación por Etiqueta HTML (Recomendado)</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Paso 1: Obtener el código de verificación</p>
                        <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                          <li>Ve a <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Search Console</a></li>
                          <li>Haz clic en <strong>"Agregar propiedad"</strong></li>
                          <li>Selecciona <strong>"Prefijo de URL"</strong> (ej: https://turestaurante.com)</li>
                          <li>Elige el método <strong>"Etiqueta HTML"</strong></li>
                          <li>Copia el código que aparece en <code className="bg-muted px-1 py-0.5 rounded text-xs">content="..."</code></li>
                        </ol>
                        <div className="p-3 bg-muted rounded mt-2">
                          <p className="text-xs mb-1">Ejemplo de código de Google:</p>
                          <code className="text-xs">&lt;meta name="google-site-verification" content="<strong className="text-primary">ABC123xyz_EJEMPLO</strong>" /&gt;</code>
                          <p className="text-xs mt-2"><strong>Solo copia:</strong> <code className="bg-background px-1 py-0.5 rounded">ABC123xyz_EJEMPLO</code></p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Paso 2: Compartir con Soporte</p>
                        <div className="p-3 bg-muted rounded text-sm">
                          <p className="mb-1"><strong>Asunto:</strong> Verificación de Google Search Console</p>
                          <p className="mb-2"><strong>Mensaje:</strong></p>
                          <div className="pl-3 border-l-2 border-primary">
                            <p>Hola,</p>
                            <p className="my-1">Necesito verificar mi sitio en Google Search Console.</p>
                            <p className="my-1">Mi código de verificación es: <code className="bg-background px-2 py-0.5 rounded">ABC123xyz_EJEMPLO</code></p>
                            <p>Por favor, instalen este código en mi sitio.</p>
                            <p className="mt-2">Gracias!</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium mb-1">Paso 3: Verificar (después de 24-48h)</p>
                        <p className="text-sm text-muted-foreground">
                          Una vez que el soporte instale el código, vuelve a Google Search Console y haz clic en <strong>"Verificar"</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <h4 className="font-medium mb-2">Opción 2: Verificación mediante Google Analytics</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Si ya configuraste Google Analytics 4 en tu sitio, Google Search Console puede verificar automáticamente:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>En Google Search Console, agrega tu propiedad</li>
                      <li>Selecciona el método <strong>"Google Analytics"</strong></li>
                      <li>Google detectará tu código de GA4 y verificará instantáneamente</li>
                    </ol>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                      ✅ <strong>Ventaja:</strong> No necesitas código adicional, se verifica automáticamente si ya tienes GA4 instalado
                    </p>
                  </div>

                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                    <h4 className="font-medium mb-2">Opción 3: Verificación DNS (Avanzado)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Similar al Plan Básico, pero con acceso completo a todas las funcionalidades de GSC. Sigue los mismos pasos que en la sección del Plan Básico arriba.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso Final: Enviar tu Sitemap</h3>
                <p className="text-muted-foreground mb-3">
                  Independientemente de tu plan, una vez verificado tu sitio, <strong>envía tu sitemap</strong> para que Google indexe todas tus páginas:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>En Google Search Console, ve a <strong>"Sitemaps"</strong> en el menú lateral</li>
                  <li>En "Agregar un nuevo sitemap", ingresa: <code className="bg-muted px-2 py-1 rounded text-xs">sitemap.xml</code></li>
                  <li>Haz clic en <strong>"Enviar"</strong></li>
                </ol>

                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg mt-3">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    ✅ <strong>¡Listo!</strong> Google comenzará a rastrear tu sitio automáticamente. Los primeros datos aparecerán en 24-48 horas.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Qué Hacer Después de Verificar</h3>
                <p className="text-muted-foreground mb-3">
                  Una vez verificado, podrás acceder a información valiosa en Google Search Console:
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📊 Rendimiento</h4>
                    <p className="text-sm text-muted-foreground">
                      Qué búsquedas muestran tu restaurante, cuántos clics recibes, y tu posición promedio en resultados
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔍 Inspección de URL</h4>
                    <p className="text-sm text-muted-foreground">
                      Verificar si páginas específicas están indexadas y solicitar indexación manual
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">⚠️ Cobertura</h4>
                    <p className="text-sm text-muted-foreground">
                      Identificar errores de rastreo, páginas bloqueadas, o problemas de indexación
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📱 Experiencia Móvil</h4>
                    <p className="text-sm text-muted-foreground">
                      Ver si tu sitio es mobile-friendly y detectar problemas de usabilidad móvil
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">💡 Mejoras SEO</h4>
                    <p className="text-sm text-muted-foreground">
                      Sugerencias para optimizar títulos, descripciones, y datos estructurados
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔗 Enlaces</h4>
                    <p className="text-sm text-muted-foreground">
                      Ver qué sitios enlazan al tuyo y cuáles son tus páginas más enlazadas
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">💡 Consejos para Aprovechar GSC</h4>
                <ul className="list-disc list-inside space-y-2 ml-4 text-sm text-blue-900 dark:text-blue-100">
                  <li>Revisa el <strong>informe de Rendimiento</strong> semanalmente para identificar qué búsquedas traen más clics</li>
                  <li>Optimiza el contenido de tu sitio alrededor de las <strong>palabras clave con buena impresión pero bajo CTR</strong></li>
                  <li>Corrige cualquier <strong>error de Cobertura</strong> lo antes posible para no perder tráfico</li>
                  <li>Solicita <strong>indexación manual</strong> cuando publiques contenido nuevo importante (nuevos platos, eventos especiales)</li>
                  <li>Monitorea el rendimiento móvil y asegúrate de que tu sitio sea <strong>100% mobile-friendly</strong></li>
                </ul>
              </div>

              <Separator />

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Recursos Oficiales de Google
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://support.google.com/webmasters/answer/9008080" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                      Verificar la propiedad del sitio (Guía oficial de Google)
                    </a>
                  </li>
                  <li>
                    <a href="https://support.google.com/webmasters/answer/34592" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                      Agregar una propiedad a Search Console
                    </a>
                  </li>
                  <li>
                    <a href="https://support.google.com/webmasters/answer/7552505" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
                      Introducción a Search Console (Guía completa)
                    </a>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        );

      case "como-obtener-soporte":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cómo Obtener Soporte</CardTitle>
              <CardDescription>
                Todo lo que necesitas saber para obtener ayuda rápida y efectiva
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introduction */}
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Ofrecemos múltiples canales de soporte para ayudarte cuando lo necesites. Dependiendo de tu plan, tendrás acceso a diferentes opciones y tiempos de respuesta.
                </p>
              </div>

              <Separator />

              {/* Support Channels */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Canales de Soporte Disponibles
                </h3>
                
                <div className="space-y-4">
                  {/* Ticket System */}
                  <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">Sistema de Tickets</h4>
                          <Badge variant="outline" className="text-xs">Recomendado</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          El método más eficiente para obtener soporte. Disponible desde tu dashboard o desde la página pública de soporte.
                        </p>
                        
                        <div className="space-y-2 mb-3">
                          <p className="text-sm font-medium">✓ Ventajas:</p>
                          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Registro completo de toda la conversación</li>
                            <li>• Notificaciones por email de cada respuesta</li>
                            <li>• Historial accesible en cualquier momento</li>
                            <li>• Seguimiento del estado del ticket</li>
                            <li>• Auto-prefill cuando estás logueado</li>
                          </ul>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <SmartSupportLink variant="default" size="sm">
                            Acceder desde Dashboard
                          </SmartSupportLink>
                          <Button variant="outline" size="sm" asChild>
                            <a href="/soporte" target="_blank">Página Pública de Soporte</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp - Advanced Plan Only */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">Soporte por WhatsApp</h4>
                          <Badge className="text-xs bg-purple-600">Plan Avanzado</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Atención prioritaria por WhatsApp para clientes del plan avanzado. Usa tu PIN único para verificación rápida.
                        </p>
                        <p className="text-xs text-muted-foreground italic">
                          Si tienes el plan avanzado, encontrarás tu PIN único en la sección de Soporte del dashboard.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Public Support Form */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">Formulario Público de Soporte</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Accesible desde <a href="/soporte" className="text-primary hover:underline" target="_blank">mirestaurante.online/soporte</a> sin necesidad de iniciar sesión.
                        </p>
                        <Alert className="mt-2">
                          <Info className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            <strong>Auto-prefill inteligente:</strong> Si accedes mientras estás logueado, el formulario se completará automáticamente con tu información y credenciales de soporte premium (si aplica).
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </div>

                  {/* Documentation */}
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <FileText className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">Guías y Documentación</h4>
                        <p className="text-sm text-muted-foreground">
                          Antes de contactar soporte, revisa estas guías. Muchas preguntas comunes tienen respuestas detalladas con instrucciones paso a paso.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Premium Support PIN */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  PIN de Soporte Premium
                </h3>

                <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-900 dark:text-purple-100">Solo Plan Avanzado</AlertTitle>
                  <AlertDescription className="text-purple-800 dark:text-purple-200 space-y-2">
                    <p>
                      Los clientes del plan avanzado reciben un <strong>PIN único de 8 dígitos</strong> para verificación rápida y acceso a soporte prioritario.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium">Ubicación del PIN</p>
                      <p className="text-sm text-muted-foreground">
                        Encontrarás tu PIN en la parte superior de la sección <strong>Soporte</strong> en tu dashboard, dentro de una tarjeta destacada con fondo azul.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">Copiar PIN</p>
                      <p className="text-sm text-muted-foreground">
                        Usa el botón "Copiar PIN" para copiarlo al portapapeles y usarlo en el formulario de soporte o WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">Uso del PIN</p>
                      <p className="text-sm text-muted-foreground">
                        Proporciona tu PIN al contactar soporte para recibir atención prioritaria y acceso a funciones premium.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Horarios de Atención
                </h3>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Lunes a Viernes</span>
                      <span className="text-sm text-muted-foreground">9:00 AM - 6:00 PM</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Sábados</span>
                      <span className="text-sm text-muted-foreground">10:00 AM - 2:00 PM</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Domingos y Festivos</span>
                      <span className="text-sm text-muted-foreground">Cerrado</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    Tickets creados fuera de horario serán respondidos al inicio del siguiente día hábil.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Response Times */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tiempos de Respuesta</h3>
                
                <div className="grid gap-3">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">Urgente</span>
                        <Badge variant="destructive" className="text-xs">Alta Prioridad</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sitio caído, errores críticos que impiden uso
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Plan Básico:</strong> 2-4 horas • <strong className="text-purple-600">Plan Avanzado:</strong> 1-2 horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">Normal</span>
                        <Badge variant="outline" className="text-xs">Prioridad Media</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Consultas generales, configuraciones, problemas no críticos
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Plan Básico:</strong> 24-48 horas • <strong className="text-purple-600">Plan Avanzado:</strong> 12-24 horas
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">Baja Prioridad</span>
                        <Badge variant="secondary" className="text-xs">No Urgente</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sugerencias, mejoras, consultas informativas
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <strong>Ambos planes:</strong> 48-72 horas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Consejo Profesional</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    Proporciona toda la información relevante en tu primer mensaje: qué intentabas hacer, qué sucedió, capturas de pantalla, navegador y dispositivo. Esto acelera significativamente el tiempo de resolución.
                  </p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case "crear-tickets":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Crear Tickets de Soporte</CardTitle>
              <CardDescription>
                Guía completa para crear tickets efectivos y obtener respuestas rápidas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introduction */}
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Los tickets de soporte son la forma más eficiente de obtener ayuda. Aprende a crear tickets que obtengan respuestas rápidas y soluciones efectivas.
                </p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Auto-prefill disponible:</strong> Si accedes al formulario de soporte mientras estás logueado, tus datos se completarán automáticamente, incluyendo tu PIN premium si tienes plan avanzado.
                </AlertDescription>
              </Alert>

              <Separator />

              {/* Where to Create Tickets */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde Crear un Ticket?</h3>
                
                <div className="grid gap-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Desde tu Dashboard
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Ve a <strong>Soporte</strong> en el menú lateral y haz clic en <strong>"Nuevo Ticket"</strong>
                    </p>
                    <SmartSupportLink variant="outline" size="sm">
                      Ir a Soporte en Dashboard
                    </SmartSupportLink>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      Página Pública de Soporte
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Accede a <a href="/soporte" className="text-primary hover:underline" target="_blank">mirestaurante.online/soporte</a> sin necesidad de iniciar sesión
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/soporte" target="_blank">Ir a Formulario Público</a>
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Step by Step */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pasos para Crear un Ticket</h3>

                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-semibold text-lg">Información Básica</h4>
                      <p className="text-sm text-muted-foreground">
                        Completa los campos de identificación:
                      </p>
                      
                      <div className="space-y-2 ml-2">
                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="font-medium text-sm mb-1">Nombre Completo</p>
                          <p className="text-xs text-muted-foreground">
                            Tu nombre o el nombre de tu restaurante
                          </p>
                          {/* If logged in badge */}
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Auto-completado si estás logueado
                          </Badge>
                        </div>

                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="font-medium text-sm mb-1">Email</p>
                          <p className="text-xs text-muted-foreground">
                            Donde recibirás las respuestas
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Auto-completado si estás logueado
                          </Badge>
                        </div>

                        <div className="p-3 border rounded-lg bg-muted/30">
                          <p className="font-medium text-sm mb-1">ID de Cliente o Subdominio (Opcional)</p>
                          <p className="text-xs text-muted-foreground">
                            Ej: "turestaurante" de turestaurante.mirestaurante.online
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            Auto-completado si estás logueado
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-semibold text-lg">Tipo de Soporte</h4>
                      
                      <div className="space-y-3">
                        <div className="p-4 border-2 border-muted rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-medium">Soporte General</h5>
                            <Badge variant="outline">Plan Básico y Avanzado</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Para consultas estándar y soporte técnico básico
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            <strong>Tiempo de respuesta:</strong> 24-48 horas
                          </p>
                        </div>

                        <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50/50 dark:bg-purple-950/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-purple-600" />
                            <h5 className="font-medium">Soporte Premium</h5>
                            <Badge className="bg-purple-600">Solo Plan Avanzado</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Atención prioritaria con tiempos de respuesta más rápidos. Requiere PIN único.
                          </p>
                          
                          <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-900/30">
                            <AlertCircle className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-xs space-y-1">
                              <p><strong>Verificación automática:</strong></p>
                              <ul className="ml-4 space-y-1 mt-1">
                                <li>• Si estás logueado con plan avanzado, tu email y PIN se auto-completan</li>
                                <li>• Si no estás logueado, necesitarás ingresar manualmente tu email registrado y PIN</li>
                                <li>• Tu PIN está disponible en la sección Soporte de tu dashboard</li>
                              </ul>
                            </AlertDescription>
                          </Alert>
                          
                          <p className="text-xs text-purple-700 dark:text-purple-300 mt-2 font-medium">
                            <strong>Tiempo de respuesta:</strong> 12-24 horas (1-2 horas para urgencias)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-semibold text-lg">Tipo de Consulta</h4>
                      
                      <div className="grid gap-2">
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">General</p>
                          <p className="text-xs text-muted-foreground">Consultas generales y preguntas</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">Técnico</p>
                          <p className="text-xs text-muted-foreground">Problemas técnicos con tu sitio</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">Facturación</p>
                          <p className="text-xs text-muted-foreground">Consultas sobre pagos y suscripciones</p>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm">DNS</p>
                          <p className="text-xs text-muted-foreground">Configuración de dominio personalizado</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-semibold text-lg">Detalles del Problema</h4>
                      
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm mb-2">Asunto</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Un título claro y descriptivo (mínimo 5 caracteres)
                          </p>
                          <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded border border-green-200 dark:border-green-800">
                            <p className="text-xs text-green-700 dark:text-green-300">
                              ✓ Bueno: "Error 500 al subir imágenes del menú"
                            </p>
                          </div>
                          <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-800 mt-2">
                            <p className="text-xs text-red-700 dark:text-red-300">
                              ✗ Malo: "Ayuda" o "No funciona"
                            </p>
                          </div>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <p className="font-medium text-sm mb-2">Mensaje</p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Descripción detallada (mínimo 20 caracteres). Incluye:
                          </p>
                          <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                            <li>• <strong>Qué intentabas hacer:</strong> "Estaba subiendo una imagen del menú..."</li>
                            <li>• <strong>Qué sucedió:</strong> "Apareció un error 500 y la imagen no se guardó"</li>
                            <li>• <strong>Qué esperabas:</strong> "Esperaba que la imagen se subiera correctamente"</li>
                            <li>• <strong>Pasos para reproducir:</strong> Lista numerada de acciones</li>
                            <li>• <strong>Navegador y dispositivo:</strong> "Chrome en Windows 10"</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                      5
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-semibold text-lg">Enviar Ticket</h4>
                      <p className="text-sm text-muted-foreground">
                        Revisa que toda la información sea correcta y haz clic en <strong>"Enviar"</strong>. Recibirás:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                        <li>• Confirmación inmediata en pantalla</li>
                        <li>• Email de confirmación con número de ticket</li>
                        <li>• Notificaciones por email cuando recibas respuestas</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Example */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ejemplo de Ticket Bien Redactado</h3>
                
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-lg space-y-3">
                  <div>
                    <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">ASUNTO:</p>
                    <p className="text-sm text-green-900 dark:text-green-100 font-medium">
                      Error 500 al actualizar horarios de apertura del lunes
                    </p>
                  </div>
                  
                  <Separator className="bg-green-200 dark:bg-green-800" />
                  
                  <div>
                    <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-1">TIPO:</p>
                    <p className="text-sm text-green-900 dark:text-green-100">
                      Soporte General • Consulta Técnica
                    </p>
                  </div>
                  
                  <Separator className="bg-green-200 dark:bg-green-800" />
                  
                  <div>
                    <p className="text-xs font-medium text-green-900 dark:text-green-100 mb-2">MENSAJE:</p>
                    <div className="text-sm text-green-900 dark:text-green-100 space-y-2">
                      <p>
                        Hola, estoy intentando actualizar los horarios de apertura de mi restaurante desde Panel Principal → Configuración → Horarios.
                      </p>
                      <p>
                        <strong>Problema:</strong> Cuando hago clic en "Guardar Cambios" después de modificar el horario del lunes, aparece un error 500 y los cambios no se guardan.
                      </p>
                      <p>
                        <strong>Pasos para reproducir:</strong>
                      </p>
                      <ol className="ml-4 space-y-1 text-sm">
                        <li>1. Ir a Panel Principal → Horarios</li>
                        <li>2. Cambiar hora de apertura del lunes de 10:00 a 11:00</li>
                        <li>3. Hacer clic en "Guardar Cambios"</li>
                        <li>4. Aparece error 500</li>
                      </ol>
                      <p>
                        <strong>Información adicional:</strong>
                        <br />
                        • Navegador: Chrome versión 120
                        <br />
                        • Dispositivo: MacBook Pro
                        <br />
                        • Adjunto captura del mensaje de error
                      </p>
                    </div>
                  </div>
                </div>

                <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-900 dark:text-green-100">¿Por qué este ticket es bueno?</AlertTitle>
                  <AlertDescription className="text-green-800 dark:text-green-200 text-xs space-y-1">
                    <ul className="ml-4 space-y-1">
                      <li>• Asunto específico y descriptivo</li>
                      <li>• Explica qué intentaba hacer</li>
                      <li>• Describe claramente el problema</li>
                      <li>• Incluye pasos para reproducir</li>
                      <li>• Proporciona información técnica relevante</li>
                      <li>• Menciona que adjuntará evidencia</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              {/* Pro Tips */}
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Consejos para Tickets Efectivos</AlertTitle>
                <AlertDescription className="space-y-2 text-sm">
                  <ul className="ml-4 space-y-1">
                    <li>• Sé específico en el asunto - ayuda a priorizar tu ticket</li>
                    <li>• Incluye toda la información posible en el primer mensaje</li>
                    <li>• Las capturas de pantalla son muy valiosas para problemas visuales</li>
                    <li>• Menciona si el problema es recurrente o solo ocurrió una vez</li>
                    <li>• Si es urgente, selecciona la prioridad correcta y explica por qué</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case "historial-tickets":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Tickets</CardTitle>
              <CardDescription>
                Aprende a revisar, responder y gestionar tus tickets de soporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Introduction */}
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Tu historial de tickets te permite revisar todas tus conversaciones de soporte, ver el estado de cada ticket y continuar conversaciones abiertas.
                </p>
              </div>

              <Separator />

              {/* How to Access */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Acceder a tu Historial
                </h3>
                
                <div className="p-4 border-2 border-primary/20 rounded-lg bg-primary/5">
                  <p className="text-sm text-muted-foreground mb-3">
                    Para ver todos tus tickets:
                  </p>
                  <ol className="space-y-2 ml-4 text-sm text-muted-foreground">
                    <li>1. Ve a <strong>Soporte</strong> desde el menú lateral de tu dashboard</li>
                    <li>2. Verás una lista de todos tus tickets en la parte izquierda</li>
                    <li>3. Haz clic en cualquier ticket para ver los detalles completos</li>
                  </ol>
                  <SmartSupportLink variant="outline" size="sm" className="mt-3">
                    Ir a Historial de Tickets
                  </SmartSupportLink>
                </div>
              </div>

              <Separator />

              {/* Ticket Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de cada Ticket</h3>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Cada ticket en tu historial muestra:
                  </p>
                  
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Número de Ticket</p>
                        <p className="text-xs text-muted-foreground">
                          ID único (ej: #TK-2024-001) para referencia rápida
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Estado Actual</p>
                        <p className="text-xs text-muted-foreground">
                          Nuevo, En Progreso, Resuelto o Cerrado
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Prioridad</p>
                        <p className="text-xs text-muted-foreground">
                          Baja, Media, Alta o Urgente
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Contador de Respuestas</p>
                        <p className="text-xs text-muted-foreground">
                          Número total de mensajes en la conversación
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                        <Clock className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Fechas</p>
                        <p className="text-xs text-muted-foreground">
                          Fecha de creación y última actualización
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Ticket States */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estados de Tickets</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Nuevo</h4>
                        <Badge className="bg-blue-500 text-xs">Activo</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ticket recién creado. Nuestro equipo lo revisará pronto y comenzará a trabajar en él.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50/50 dark:bg-yellow-950/20">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">En Progreso</h4>
                        <Badge className="bg-yellow-500 text-xs">Activo</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        El equipo está trabajando activamente en tu ticket. Es posible que te pidan más información o que ya estén implementando una solución.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border-2 border-green-200 rounded-lg bg-green-50/50 dark:bg-green-950/20">
                    <div className="w-4 h-4 rounded-full bg-green-500 mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Resuelto</h4>
                        <Badge className="bg-green-500 text-xs">Puede reabrirse</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        El problema ha sido solucionado. Si el problema persiste o no estás satisfecho con la solución, puedes agregar una respuesta explicando la situación.
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        <strong>Nota:</strong> Los tickets resueltos pueden reabrirse automáticamente si agregas una nueva respuesta.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg bg-gray-50/50 dark:bg-gray-950/20">
                    <div className="w-4 h-4 rounded-full bg-gray-500 mt-1 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Cerrado</h4>
                        <Badge variant="secondary" className="text-xs">Finalizado</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Ticket finalizado y archivado. No se pueden agregar más respuestas.
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        <strong>Nota:</strong> Si tienes un problema relacionado, crea un nuevo ticket y menciona el número del ticket anterior.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* How to Respond */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cómo Responder a un Ticket</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Selecciona el Ticket</h4>
                      <p className="text-sm text-muted-foreground">
                        Haz clic en el ticket que deseas revisar desde la lista en la izquierda. Los detalles aparecerán en el panel derecho.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Revisa la Conversación</h4>
                      <p className="text-sm text-muted-foreground">
                        Lee todos los mensajes anteriores para entender el contexto completo. Verás:
                      </p>
                      <ul className="text-sm text-muted-foreground ml-4 mt-2 space-y-1">
                        <li>• Tu mensaje original</li>
                        <li>• Respuestas del equipo de soporte (fondo verde)</li>
                        <li>• Tus respuestas anteriores (fondo azul)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Escribe tu Respuesta</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        En el campo de texto al final (solo visible si el ticket no está cerrado):
                      </p>
                      <ul className="text-sm text-muted-foreground ml-4 space-y-1">
                        <li>• Responde las preguntas del equipo</li>
                        <li>• Proporciona información adicional solicitada</li>
                        <li>• Confirma si la solución funcionó</li>
                        <li>• Explica si el problema persiste</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Envía la Respuesta</h4>
                      <p className="text-sm text-muted-foreground">
                        Haz clic en <strong>"Enviar Respuesta"</strong>. Recibirás una confirmación y el equipo será notificado automáticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Mail className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Recibirás un email cada vez que el equipo responda a tu ticket. El email incluirá un resumen de la respuesta y un enlace directo al ticket.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              {/* Viewing Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Panel de Detalles del Ticket</h3>
                
                <p className="text-sm text-muted-foreground">
                  Cuando seleccionas un ticket, verás:
                </p>

                <div className="space-y-2">
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm mb-1">Información del Cliente</p>
                    <p className="text-xs text-muted-foreground">
                      Tu nombre y email registrado en el ticket
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm mb-1">Mensaje Original</p>
                    <p className="text-xs text-muted-foreground">
                      Tu consulta o problema inicial tal como lo describiste
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm mb-1">Conversación Completa</p>
                    <p className="text-xs text-muted-foreground">
                      Todos los intercambios de mensajes en orden cronológico
                    </p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <p className="font-medium text-sm mb-1">Campo de Respuesta</p>
                    <p className="text-xs text-muted-foreground">
                      Área de texto para agregar nuevos mensajes (si el ticket está abierto)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Premium Support PIN Card */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  PIN de Soporte Premium
                </h3>

                <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <AlertTitle className="text-purple-900 dark:text-purple-100">Solo Plan Avanzado</AlertTitle>
                  <AlertDescription className="text-purple-800 dark:text-purple-200 text-sm">
                    <p className="mb-2">
                      Si tienes el plan avanzado, verás una tarjeta destacada en la parte superior de esta página con tu PIN único de 8 dígitos.
                    </p>
                    <p className="text-xs">
                      <strong>Usa este PIN cuando:</strong>
                    </p>
                    <ul className="text-xs ml-4 mt-1 space-y-1">
                      <li>• Contactes soporte por WhatsApp</li>
                      <li>• Crees tickets desde la página pública de soporte</li>
                      <li>• Necesites verificación rápida de tu cuenta</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              {/* Pro Tips */}
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Consejos Útiles</AlertTitle>
                <AlertDescription className="space-y-2 text-sm">
                  <ul className="ml-4 space-y-1">
                    <li>• <strong>Revisa el historial antes de crear un nuevo ticket</strong> - Puedes encontrar soluciones a problemas similares</li>
                    <li>• <strong>Responde rápidamente</strong> cuando el equipo pida información - Acelera la resolución</li>
                    <li>• <strong>Usa el mismo ticket</strong> para problemas relacionados en lugar de crear múltiples tickets</li>
                    <li>• <strong>Confirma cuando el problema esté resuelto</strong> - Ayuda al equipo a cerrar tickets correctamente</li>
                    <li>• <strong>Sé claro y específico</strong> en tus respuestas para evitar malentendidos</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        );

      case "gestionar-suscripcion":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Gestionar tu Suscripción</CardTitle>
              <CardDescription>
                Aprende a administrar tu plan y suscripción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde gestiono mi suscripción?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Suscripción</strong> desde el menú principal de tu dashboard.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de tu Plan Actual</h3>
                <p className="text-muted-foreground mb-3">
                  En la página de suscripción verás:
                </p>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Nombre del Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      El plan que tienes actualmente contratado (Básico, Profesional, Premium, etc.)
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Estado de la Suscripción</h4>
                    <p className="text-sm text-muted-foreground">
                      Si tu suscripción está activa, pausada o cancelada
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Fecha de Renovación</h4>
                    <p className="text-sm text-muted-foreground">
                      Cuándo se realizará el próximo cobro automático
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Monto a Pagar</h4>
                    <p className="text-sm text-muted-foreground">
                      El costo mensual o anual de tu plan actual
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Recursos Incluidos</h4>
                    <p className="text-sm text-muted-foreground">
                      Límites de visitas mensuales, ancho de banda y otras características de tu plan
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Acciones Disponibles</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Cambiar de Plan</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Puedes actualizar o cambiar tu plan en cualquier momento:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li><strong>Upgrade:</strong> Si actualizas a un plan superior, el cambio es inmediato y se prorratea el costo</li>
                      <li><strong>Downgrade:</strong> Si cambias a un plan inferior, el cambio se aplica en la próxima fecha de facturación</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Pausar Suscripción</h4>
                    <p className="text-sm text-muted-foreground">
                      Si necesitas pausar tu servicio temporalmente, puedes hacerlo. Tu sitio quedará desactivado pero conservarás toda tu información. No se realizarán cobros mientras esté pausada.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Cancelar Suscripción</h4>
                    <p className="text-sm text-muted-foreground">
                      Puedes cancelar en cualquier momento. Seguirás teniendo acceso hasta el final del período pagado. Tus datos se conservarán por 90 días por si decides reactivar.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Actualizar Método de Pago</h4>
                    <p className="text-sm text-muted-foreground">
                      Mantén tu información de pago actualizada para evitar interrupciones en el servicio.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Facturación y Recibos</h3>
                <p className="text-muted-foreground mb-3">
                  Desde la página de suscripción también puedes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Descargar facturas anteriores</li>
                  <li>Ver historial de pagos</li>
                  <li>Actualizar información de facturación (nombre, dirección, RFC, etc.)</li>
                  <li>Ver cargos por excedentes si los hubiera</li>
                </ul>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⚠️ <strong>Importante:</strong> Si tu pago falla, tendrás 3 días para actualizar tu método de pago antes de que el servicio se suspenda temporalmente.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Los planes anuales tienen un descuento significativo comparado con el pago mensual. Considera cambiar a facturación anual para ahorrar.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "metodos-pago":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>
                Administra tus métodos de pago y configuración de facturación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Métodos de Pago Aceptados</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">💳 Tarjetas de Crédito/Débito</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Aceptamos las principales tarjetas:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Visa</li>
                      <li>Mastercard</li>
                      <li>American Express</li>
                      <li>Otras tarjetas locales</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🏦 Transferencia Bancaria</h4>
                    <p className="text-sm text-muted-foreground">
                      Disponible para planes anuales. Contacta a soporte para obtener los datos bancarios.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Agregar o Actualizar Método de Pago</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Ve a <strong>Suscripción</strong> en el menú principal
                  </li>
                  <li>
                    Busca la sección "Método de Pago" o "Información de Pago"
                  </li>
                  <li>
                    Haz clic en "Actualizar Método de Pago" o "Agregar Tarjeta"
                  </li>
                  <li>
                    Ingresa los datos de tu tarjeta:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Número de tarjeta</li>
                      <li>Nombre del titular</li>
                      <li>Fecha de vencimiento (MM/AA)</li>
                      <li>Código de seguridad (CVV)</li>
                    </ul>
                  </li>
                  <li>
                    Haz clic en "Guardar" para confirmar
                  </li>
                </ol>

                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    🔒 <strong>Seguridad:</strong> Todos los datos de pago están encriptados y protegidos. Utilizamos procesadores de pago certificados PCI-DSS. Nunca almacenamos información completa de tarjetas en nuestros servidores.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuración de Facturación Automática</h3>
                <p className="text-muted-foreground">
                  Una vez que agregues un método de pago válido:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Los pagos se procesarán automáticamente cada mes/año según tu plan</li>
                  <li>Recibirás un email de confirmación después de cada cargo</li>
                  <li>Tu factura estará disponible en tu dashboard</li>
                  <li>Si el pago falla, recibirás una notificación para actualizar tu método de pago</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Problemas Comunes y Soluciones</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">❌ Pago Rechazado</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Si tu pago es rechazado, puede deberse a:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Fondos insuficientes</li>
                      <li>Tarjeta vencida</li>
                      <li>Datos incorrectos</li>
                      <li>Límite de compras en línea alcanzado</li>
                      <li>Bloqueo por seguridad del banco</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      <strong>Solución:</strong> Verifica con tu banco y actualiza tu método de pago.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔄 Cambiar Método de Pago</h4>
                    <p className="text-sm text-muted-foreground">
                      Puedes cambiar tu método de pago en cualquier momento. El nuevo método se usará para el próximo cobro programado.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📧 No Recibí mi Factura</h4>
                    <p className="text-sm text-muted-foreground">
                      Las facturas se envían automáticamente por email. Revisa tu carpeta de spam. También puedes descargarlas desde la sección Suscripción → Historial de Facturas.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reembolsos</h3>
                <p className="text-muted-foreground">
                  Los reembolsos se procesan según nuestra política:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Dentro de los primeros 7 días: Reembolso completo</li>
                  <li>Después de 7 días: Prorrateado según uso</li>
                  <li>Planes anuales: Reembolso de meses no utilizados</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  Para solicitar un reembolso, crea un ticket en la sección de Soporte.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Configura recordatorios en tu calendario para revisar que tu tarjeta no esté por vencer, evitando interrupciones en el servicio.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "cambios-plan":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Cambios de Plan</CardTitle>
              <CardDescription>
                Cómo actualizar, cambiar o reducir tu plan de suscripción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tipos de Cambio de Plan</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">⬆️ Upgrade (Mejora de Plan)</h4>
                    <p className="text-sm text-muted-foreground">
                      Cambiar a un plan con más recursos y características (por ejemplo, de Básico a Profesional).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">⬇️ Downgrade (Reducción de Plan)</h4>
                    <p className="text-sm text-muted-foreground">
                      Cambiar a un plan con menos recursos (por ejemplo, de Premium a Profesional).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔄 Cambio de Periodicidad</h4>
                    <p className="text-sm text-muted-foreground">
                      Cambiar de facturación mensual a anual (o viceversa) manteniendo el mismo nivel de plan.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cómo Hacer un Upgrade</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>Ve a <strong>Suscripción</strong> en el menú principal</li>
                  <li>Revisa los planes disponibles y sus características</li>
                  <li>Selecciona el plan al que deseas actualizar</li>
                  <li>Haz clic en "Actualizar Plan" o "Upgrade"</li>
                  <li>Revisa el resumen de cambios y costos</li>
                  <li>Confirma la actualización</li>
                </ol>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg mt-4">
                  <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">📊 Cómo Funciona el Cargo al Mejorar</h4>
                  <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                    Cuando haces un upgrade, se aplica un <strong>prorrateo justo</strong>:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-blue-900 dark:text-blue-100">
                    <li>Se calcula el tiempo restante de tu período actual</li>
                    <li>Se acredita el monto no usado de tu plan actual</li>
                    <li>Se cobra solo la diferencia para el nuevo plan</li>
                    <li>El cambio es inmediato: accedes a las nuevas características de inmediato</li>
                  </ul>
                  <p className="text-sm text-blue-900 dark:text-blue-100 mt-2">
                    <strong>Ejemplo:</strong> Si estás en el día 15 de tu ciclo mensual de un plan de $500 y cambias a uno de $1000, solo pagarás aproximadamente $250 (la mitad del mes del plan nuevo menos el crédito del plan anterior).
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cómo Hacer un Downgrade</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>Ve a <strong>Suscripción</strong> en el menú principal</li>
                  <li>Selecciona el plan al que deseas cambiar (uno de menor costo)</li>
                  <li>Haz clic en "Cambiar Plan" o "Downgrade"</li>
                  <li>Revisa las características que perderás</li>
                  <li>Confirma que entiendes los cambios</li>
                  <li>Procede con la confirmación</li>
                </ol>

                <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg mt-4">
                  <h4 className="font-medium mb-2 text-amber-900 dark:text-amber-100">📅 Cuándo se Aplica un Downgrade</h4>
                  <p className="text-sm text-amber-900 dark:text-amber-100 mb-2">
                    Al reducir tu plan:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-amber-900 dark:text-amber-100">
                    <li>El cambio NO es inmediato</li>
                    <li>Conservas tu plan actual hasta el final del período pagado</li>
                    <li>El nuevo plan (reducido) se activa en tu próxima fecha de renovación</li>
                    <li>No hay reembolso de la diferencia del período actual</li>
                    <li>Puedes cancelar el downgrade antes de que se aplique si cambias de opinión</li>
                  </ul>
                  <p className="text-sm text-amber-900 dark:text-amber-100 mt-2">
                    <strong>Ejemplo:</strong> Si hoy es 15 de marzo y tu ciclo se renueva el 1 de abril, seguirás con tu plan actual hasta el 31 de marzo. El plan reducido comenzará el 1 de abril.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cambiar de Mensual a Anual</h3>
                <p className="text-muted-foreground mb-3">
                  Los planes anuales suelen tener un descuento significativo (típicamente 15-20% comparado con pago mensual).
                </p>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Proceso:</h4>
                  <ol className="list-decimal list-inside space-y-2 ml-4 text-sm text-muted-foreground">
                    <li>Ve a Suscripción y selecciona tu plan actual</li>
                    <li>Cambia el toggle de "Mensual" a "Anual"</li>
                    <li>Verás el ahorro anual comparado con el pago mensual</li>
                    <li>Se cobrará el monto anual de inmediato</li>
                    <li>Tu próxima renovación será en 12 meses</li>
                  </ol>
                </div>

                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-3">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    💰 <strong>Ahorro:</strong> Con facturación anual, típicamente ahorras el equivalente a 2 meses de servicio al año.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Consideraciones Importantes</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Límites de Recursos</h4>
                    <p className="text-sm text-muted-foreground">
                      Al cambiar a un plan con menos recursos (downgrade), asegúrate de que tu uso actual esté dentro de los nuevos límites. Si excedes los límites del nuevo plan, se aplicarán cargos por excedentes.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Funcionalidades Premium</h4>
                    <p className="text-sm text-muted-foreground">
                      Algunas funcionalidades (como analíticas avanzadas, reservas, email personalizado) solo están disponibles en ciertos planes. Al reducir tu plan, podrías perder acceso a estas características.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Cancelar Cambio Pendiente</h4>
                    <p className="text-sm text-muted-foreground">
                      Si programaste un downgrade pero cambias de opinión, puedes cancelarlo desde la página de Suscripción antes de que se aplique en tu próxima fecha de renovación.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿No Estás Seguro Qué Plan Elegir?</h3>
                <p className="text-muted-foreground mb-3">
                  Si tienes dudas sobre qué plan es el adecuado para tu negocio:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Revisa tus estadísticas de uso actuales en la sección Analíticas</li>
                  <li>Considera tu crecimiento proyectado para los próximos meses</li>
                  <li>Evalúa qué funcionalidades realmente necesitas</li>
                  <li>Contacta a nuestro equipo de soporte para asesoramiento personalizado</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Puedes cambiar de plan en cualquier momento. No hay penalizaciones ni períodos de permanencia obligatorios.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "informacion-facturacion":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Información de Facturación</CardTitle>
              <CardDescription>
                Gestiona tus datos fiscales y descarga facturas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro mis Facturas?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Suscripción</strong> → sección <strong>"Historial de Facturación"</strong> o <strong>"Facturas"</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Actualizar Información Fiscal</h3>
                <p className="text-muted-foreground mb-3">
                  Para que tus facturas incluyan tus datos fiscales correctos:
                </p>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>Ve a <strong>Suscripción</strong> → <strong>"Información de Facturación"</strong></li>
                  <li>Haz clic en "Editar Información Fiscal"</li>
                  <li>Completa o actualiza los siguientes campos:</li>
                </ol>

                <div className="space-y-3 mt-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Nombre o Razón Social *</h4>
                    <p className="text-sm text-muted-foreground">
                      Tu nombre completo (persona física) o nombre de la empresa (persona moral)
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">RFC *</h4>
                    <p className="text-sm text-muted-foreground">
                      Tu Registro Federal de Contribuyentes (13 caracteres para persona física, 12 para moral)
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Dirección Fiscal *</h4>
                    <p className="text-sm text-muted-foreground">
                      Calle, número, colonia, código postal, ciudad y estado
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Régimen Fiscal</h4>
                    <p className="text-sm text-muted-foreground">
                      Por ejemplo: Persona Física con Actividad Empresarial, Régimen Simplificado de Confianza, etc.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Email de Facturación</h4>
                    <p className="text-sm text-muted-foreground">
                      El email donde deseas recibir tus facturas (puede ser diferente al email de tu cuenta)
                    </p>
                  </div>
                </div>

                <ol start={4} className="list-decimal list-inside space-y-2 ml-4 text-muted-foreground mt-4">
                  <li>Haz clic en "Guardar Cambios"</li>
                  <li>La información se aplicará a futuras facturas</li>
                </ol>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    ⚠️ <strong>Importante:</strong> Los cambios en tu información fiscal solo se aplican a facturas futuras. Las facturas ya emitidas no pueden modificarse. Si necesitas corregir una factura reciente, contacta a soporte dentro de las primeras 72 horas.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Descargar Facturas</h3>
                <p className="text-muted-foreground mb-3">
                  Para descargar tus facturas:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Ve a <strong>Suscripción</strong> → <strong>"Historial de Facturas"</strong></li>
                  <li>Verás una lista de todas tus facturas ordenadas por fecha</li>
                  <li>Cada factura muestra: fecha, concepto, monto y estado (pagada/pendiente)</li>
                  <li>Haz clic en el botón "Descargar PDF" junto a la factura que deseas</li>
                  <li>El archivo PDF se descargará a tu dispositivo</li>
                </ol>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg mt-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    💡 <strong>Tip:</strong> También recibes tus facturas automáticamente por email después de cada cobro.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Conceptos en tus Facturas</h3>
                <p className="text-muted-foreground mb-3">
                  Tus facturas pueden incluir los siguientes conceptos:
                </p>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Suscripción Mensual/Anual</h4>
                    <p className="text-sm text-muted-foreground">
                      El costo de tu plan para el período correspondiente
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Excedente de Visitas</h4>
                    <p className="text-sm text-muted-foreground">
                      Cargo adicional si superaste el límite de visitas mensuales de tu plan
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Excedente de Ancho de Banda</h4>
                    <p className="text-sm text-muted-foreground">
                      Cargo adicional si superaste el límite de GB de transferencia de tu plan
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Servicios Adicionales</h4>
                    <p className="text-sm text-muted-foreground">
                      Cargos por servicios extras como soporte premium, desarrollo personalizado, etc.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Ajustes y Créditos</h4>
                    <p className="text-sm text-muted-foreground">
                      Créditos por downgrades, reembolsos parciales o ajustes autorizados
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Facturación de Excedentes</h3>
                <p className="text-muted-foreground mb-3">
                  Si superas los límites de tu plan:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Los excedentes se calculan al final de cada mes</li>
                  <li>Se agregan automáticamente a tu siguiente factura</li>
                  <li>Puedes ver tu uso actual en tiempo real en la sección <strong>Analíticas</strong></li>
                  <li>Recibirás alertas al alcanzar el 80% y 100% de tus límites</li>
                </ul>

                <div className="p-4 bg-muted rounded-lg mt-3">
                  <p className="text-sm font-medium mb-2">Ejemplo de Factura con Excedentes:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Plan Profesional - Marzo 2025: $1,000</li>
                    <li>• Excedente: 5,000 visitas adicionales: $250</li>
                    <li>• Excedente: 15 GB adicionales: $75</li>
                    <li className="font-medium pt-2 border-t">Total: $1,325</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Problemas con Facturas</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Datos Fiscales Incorrectos</h4>
                    <p className="text-sm text-muted-foreground">
                      Si una factura tiene datos incorrectos, tienes 72 horas desde la emisión para solicitar la corrección. Después de ese tiempo, solo podremos corregir facturas del período fiscal actual.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">No Recibí mi Factura</h4>
                    <p className="text-sm text-muted-foreground">
                      Revisa tu carpeta de spam. Si no la encuentras, puedes descargarla desde tu dashboard o contactar a soporte.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Factura Duplicada</h4>
                    <p className="text-sm text-muted-foreground">
                      Si ves un cargo duplicado en tu estado de cuenta, contacta inmediatamente a soporte con los detalles de ambas transacciones.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Necesito Factura de Meses Anteriores</h4>
                    <p className="text-sm text-muted-foreground">
                      Todas las facturas históricas están disponibles en tu dashboard. Puedes descargar facturas de cualquier período anterior.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✅ <strong>Cumplimiento Fiscal:</strong> Todas nuestras facturas cumplen con los requisitos del SAT y son válidas para deducción de impuestos. Conserva tus facturas para tu contabilidad.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      
      case "libro-reclamaciones":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Libro de Reclamaciones</h1>
              <p className="text-muted-foreground">
                Navega a: Políticas → Pestaña <Badge variant="secondary" className="mx-1">Libro de Reclamaciones</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  ¿Qué es el Libro de Reclamaciones?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  El Libro de Reclamaciones es un formulario digital obligatorio para restaurantes en Perú, establecido por el Código de Protección y Defensa del Consumidor. Permite a tus clientes registrar quejas o reclamos sobre tu servicio o productos.
                </p>
                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    <strong>Requisito Legal:</strong> En Perú, todos los restaurantes están obligados por ley a tener un Libro de Reclamaciones disponible para sus clientes, tanto físico como virtual.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Activar/Desactivar el Libro de Reclamaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground mb-3">
                  Controla si el Libro de Reclamaciones está visible en tu sitio web usando el interruptor <strong>"Habilitar Libro de Reclamaciones"</strong>.
                </p>
                
                <div className="grid gap-3">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      Activado (Recomendado)
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      El enlace "Libro de Reclamaciones" aparece en el footer de tu sitio web. Los clientes pueden acceder y completar el formulario de reclamo.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-orange-600" />
                      Desactivado
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      El enlace y la página no están disponibles. Los visitantes no podrán acceder al formulario desde tu sitio web.
                    </p>
                  </div>
                </div>

                <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-sm">
                    <strong>Advertencia Legal:</strong> Aunque puedes desactivar temporalmente esta función, recuerda que en Perú es obligatorio tener un Libro de Reclamaciones disponible para los consumidores. Asegúrate de cumplir con la normativa vigente.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Configurar Email para Recibir Reclamaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground mb-3">
                  Configura el correo electrónico donde deseas recibir las copias de las reclamaciones que envíen tus clientes.
                </p>

                <div className="p-4 border rounded-lg bg-primary/5">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    Email de Reclamaciones
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <span className="font-bold text-primary flex-shrink-0">•</span>
                      <span className="text-muted-foreground">
                        Por defecto, se usa el email de tu cuenta registrada
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-primary flex-shrink-0">•</span>
                      <span className="text-muted-foreground">
                        Puedes cambiarlo a cualquier email corporativo o personal que prefieras
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-primary flex-shrink-0">•</span>
                      <span className="text-muted-foreground">
                        Recibirás una copia completa de cada reclamo enviado
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="font-bold text-primary flex-shrink-0">•</span>
                      <span className="text-muted-foreground">
                        El cliente también recibirá una copia de confirmación en su propio email
                      </span>
                    </li>
                  </ul>
                </div>

                <Alert className="border-primary/30 bg-primary/5">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong>Consejo:</strong> Usa un email que revises frecuentemente para atender las reclamaciones de manera oportuna. La ley establece que debes responder dentro de 30 días calendario.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Datos que se Incluyen Automáticamente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground mb-3">
                  El sistema incluye automáticamente ciertos datos de tu restaurante en el formulario de reclamaciones para cumplir con los requisitos legales:
                </p>

                <div className="grid gap-3">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">📋 RUC del Restaurante</h4>
                    <p className="text-sm text-muted-foreground">
                      El número de RUC de tu restaurante se muestra automáticamente en el formulario. Este dato se toma de la pestaña <Badge variant="outline" className="mx-1">Información General</Badge> del Panel Principal.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2">🏢 Razón Social</h4>
                    <p className="text-sm text-muted-foreground">
                      La razón social de tu negocio también se incluye automáticamente, tomada desde la pestaña <Badge variant="outline" className="mx-1">Información General</Badge> del Panel Principal.
                    </p>
                  </div>
                </div>

                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    <strong>Importante:</strong> Asegúrate de que tu RUC y Razón Social estén correctamente configurados en el Panel Principal → Información General. Estos datos son obligatorios para el Libro de Reclamaciones.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Cómo Funciona el Formulario
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground mb-3">
                  Cuando un cliente accede al Libro de Reclamaciones desde tu sitio web:
                </p>

                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                    <div className="text-sm">
                      <strong>Cliente completa el formulario:</strong> Proporciona su información personal, tipo de documento, y describe su reclamo o queja
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                    <div className="text-sm">
                      <strong>Detalla el reclamo:</strong> Selecciona si es un reclamo o queja, especifica si es por producto o servicio, y describe la situación
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                    <div className="text-sm">
                      <strong>Envía el formulario:</strong> Al enviar, el sistema genera dos correos automáticamente
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">4.</span>
                    <div className="text-sm">
                      <strong>Email al restaurante:</strong> Recibes una copia completa con todos los detalles del reclamo en el email configurado
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">5.</span>
                    <div className="text-sm">
                      <strong>Email al cliente:</strong> El cliente recibe una confirmación con copia de su reclamo
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</span>
                  Ubicación en tu Sitio Web
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground mb-3">
                  Cuando el Libro de Reclamaciones está activado:
                </p>

                <div className="p-4 border rounded-lg bg-primary/5">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    Enlace en el Footer
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Un enlace llamado "Libro de Reclamaciones" aparece en el footer (pie de página) de tu sitio web, junto a otros enlaces importantes.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Los visitantes pueden hacer clic en este enlace para acceder al formulario de reclamos en cualquier momento.
                  </p>
                </div>

                <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm">
                    <strong>Cumplimiento Visible:</strong> El enlace en el footer garantiza que el Libro de Reclamaciones sea fácilmente accesible para tus clientes, cumpliendo con los requisitos de visibilidad establecidos por ley.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <span>⚖️</span> Obligaciones Legales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-orange-600 dark:text-orange-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Disponibilidad:</strong> El Libro de Reclamaciones debe estar disponible y accesible para los consumidores en todo momento
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-orange-600 dark:text-orange-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Tiempo de respuesta:</strong> Debes responder a las reclamaciones dentro de 30 días calendario
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-orange-600 dark:text-orange-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Registro obligatorio:</strong> Todas las reclamaciones deben ser registradas y conservadas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-orange-600 dark:text-orange-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Confidencialidad:</strong> Protege la información personal de tus clientes según la Ley de Protección de Datos
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-orange-600 dark:text-orange-400 shrink-0">•</span>
                    <span className="text-sm">
                      <strong>Sanciones:</strong> El incumplimiento puede generar multas de hasta 450 UIT por parte de INDECOPI
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Revisa tu email frecuentemente:</strong> Responde a las reclamaciones de manera oportuna
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Datos actualizados:</strong> Mantén tu RUC y Razón Social correctos en la Información General
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Mantén activado:</strong> Deja el Libro de Reclamaciones siempre visible para cumplir con la ley
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Usa un email corporativo:</strong> Preferiblemente uno que todo tu equipo pueda monitorear
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Archiva las reclamaciones:</strong> Guarda copias de todos los emails de reclamos que recibas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Actúa proactivamente:</strong> Usa las reclamaciones como oportunidad para mejorar tu servicio
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Documenta las soluciones:</strong> Registra cómo resolviste cada reclamo
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Guardar Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Después de configurar el email o cambiar la visibilidad del Libro de Reclamaciones, haz clic en el botón <strong>"Guardar Cambios"</strong> al final de la página. Los cambios se aplicarán inmediatamente en tu sitio web.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case "paginas-politicas":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Páginas de Políticas</h1>
              <p className="text-muted-foreground">
                Navega a: Políticas → Pestañas <Badge variant="secondary" className="mx-1">Política de Privacidad</Badge>, <Badge variant="secondary" className="mx-1">Política de Cookies</Badge>, <Badge variant="secondary" className="mx-1">Términos de Servicio</Badge>
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  ¿Qué son las Páginas de Políticas?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Las páginas de políticas son documentos legales esenciales que protegen a tu restaurante y a tus clientes. Establecen las reglas, derechos y responsabilidades relacionadas con el uso de tu sitio web y el manejo de datos personales.
                </p>
                <div className="grid md:grid-cols-3 gap-3 mt-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-1">🔒 Política de Privacidad</h4>
                    <p className="text-xs text-muted-foreground">Explica cómo recopilas, usas y proteges los datos personales de tus clientes</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-1">🍪 Política de Cookies</h4>
                    <p className="text-xs text-muted-foreground">Informa sobre el uso de cookies y tecnologías de seguimiento en tu sitio web</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-1">📜 Términos de Servicio</h4>
                    <p className="text-xs text-muted-foreground">Define las condiciones de uso de tu sitio web y servicios</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                  Activar/Desactivar las Páginas de Políticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cada página de política tiene su propio interruptor de activación/desactivación independiente. Esto te permite controlar qué páginas se muestran en tu sitio web.
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-950/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="h-4 w-4 text-green-600" />
                      Cuando está Activada
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        El enlace aparece automáticamente en el footer de tu sitio web
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        Los visitantes pueden acceder y leer la política completa
                      </li>
                      <li className="flex gap-2">
                        <span className="text-green-600">•</span>
                        La página está disponible en la URL correspondiente
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                      Cuando está Desactivada
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span>•</span>
                        El enlace NO aparece en el footer
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        La página no es accesible públicamente
                      </li>
                      <li className="flex gap-2">
                        <span>•</span>
                        El contenido se conserva pero permanece oculto
                      </li>
                    </ul>
                  </div>
                </div>

                <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-sm">
                    <strong>Importante:</strong> Aunque las políticas son opcionales técnicamente, se recomienda activar al menos la Política de Privacidad si recopilas datos personales (reservas, formularios de contacto) para cumplir con regulaciones como GDPR y leyes locales de protección de datos.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                  Editar el Contenido de las Políticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cada pestaña incluye un editor de texto enriquecido que te permite personalizar completamente el contenido de las políticas.
                </p>

                <div className="p-4 border rounded-lg bg-primary/5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileEdit className="h-4 w-4 text-primary" />
                    Contenido Pre-generado
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Al crear tu cuenta, el sistema genera automáticamente contenido inicial para cada política usando:
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">Nombre de tu restaurante</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">Razón Social</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">RUC</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">Email de contacto</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span className="text-muted-foreground">Teléfono y dirección</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Herramientas del Editor:</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Type className="h-3 w-3" />
                        <span className="text-sm font-medium">Formato de Texto</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Negrita, cursiva, subrayado, títulos y párrafos</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Layout className="h-3 w-3" />
                        <span className="text-sm font-medium">Listas</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Viñetas y listas numeradas</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Link2 className="h-3 w-3" />
                        <span className="text-sm font-medium">Enlaces</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Añade hipervínculos a recursos externos</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2 mb-1">
                        <Sliders className="h-3 w-3" />
                        <span className="text-sm font-medium">Alineación</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Izquierda, centro, derecha, justificado</p>
                    </div>
                  </div>
                </div>

                <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <AlertDescription className="text-sm">
                    <strong>Precaución Legal:</strong> El contenido pre-generado es una plantilla general. Te recomendamos revisarlo y adaptarlo a tu situación específica. Si tienes dudas legales, consulta con un abogado especializado en derecho digital o protección de datos.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Detalles de Cada Política
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 p-3 border-b">
                      <h4 className="font-semibold flex items-center gap-2">
                        🔒 Política de Privacidad
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Qué incluye:</strong>
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground pl-4">
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Qué datos personales recopilas (nombre, email, teléfono)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Cómo los usas (reservas, comunicación, mejorar el servicio)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Con quién los compartes (proveedores de servicios)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Medidas de seguridad implementadas</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Derechos de los usuarios (acceso, rectificación, eliminación)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Información de contacto para ejercer derechos</span>
                        </li>
                      </ul>
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <p className="text-xs text-green-800 dark:text-green-200">
                          <strong>URL:</strong> turestaurante.com/privacidad
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 p-3 border-b">
                      <h4 className="font-semibold flex items-center gap-2">
                        🍪 Política de Cookies
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Qué incluye:</strong>
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground pl-4">
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Qué son las cookies y para qué se usan</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Tipos de cookies que usa tu sitio (técnicas, analíticas, publicidad)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Cookies de terceros (Google Analytics, Facebook Pixel, etc.)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Duración de las cookies</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Cómo desactivar o gestionar las cookies</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Impacto de desactivar cookies en la funcionalidad</span>
                        </li>
                      </ul>
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <p className="text-xs text-green-800 dark:text-green-200">
                          <strong>URL:</strong> turestaurante.com/cookies
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-primary/10 p-3 border-b">
                      <h4 className="font-semibold flex items-center gap-2">
                        📜 Términos de Servicio
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Qué incluye:</strong>
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground pl-4">
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Condiciones de uso del sitio web</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Reglas sobre reservas y cancelaciones</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Política de precios y pagos</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Propiedad intelectual (logos, imágenes, contenido)</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Limitaciones de responsabilidad</span>
                        </li>
                        <li className="flex gap-2">
                          <span>•</span>
                          <span>Ley aplicable y jurisdicción</span>
                        </li>
                      </ul>
                      <div className="mt-3 p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <p className="text-xs text-green-800 dark:text-green-200">
                          <strong>URL:</strong> turestaurante.com/terminos
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</span>
                  Ubicación en tu Sitio Web
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Cuando una política está activada, su enlace aparece automáticamente en el footer de tu sitio web:
                </p>

                <div className="p-4 border rounded-lg bg-primary/5">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    Enlaces en el Footer
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    El footer (pie de página) es la ubicación estándar para estos enlaces, cumpliendo con las mejores prácticas web:
                  </p>
                  <div className="grid md:grid-cols-3 gap-2">
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <p className="text-xs font-medium">Política de Privacidad</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <p className="text-xs font-medium">Política de Cookies</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded text-center">
                      <p className="text-xs font-medium">Términos de Servicio</p>
                    </div>
                  </div>
                </div>

                <Alert className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-sm">
                    <strong>Buenas Prácticas:</strong> Los enlaces en el footer son fácilmente accesibles desde cualquier página, lo que mejora la transparencia y cumple con requisitos legales de visibilidad.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Mejores Prácticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Revisa y personaliza:</strong> Aunque el contenido pre-generado es útil, revísalo y ajústalo a tu situación específica
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Mantén actualizado:</strong> Revisa las políticas periódicamente, especialmente cuando cambies servicios o prácticas
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Sé transparente:</strong> Usa lenguaje claro y directo que tus clientes puedan entender fácilmente
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Activa Política de Privacidad:</strong> Si recopilas datos (reservas, contacto), es esencial tenerla activa
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Considera Política de Cookies:</strong> Importante si usas Google Analytics u otras herramientas de seguimiento
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-600 dark:text-green-400 shrink-0">✓</span>
                    <span className="text-sm">
                      <strong>Consulta legal si es necesario:</strong> Para situaciones complejas o si tienes dudas, busca asesoría legal profesional
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Guardar Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Después de editar el contenido de cualquier política o cambiar su estado de activación, haz clic en el botón <strong>"Guardar Cambios"</strong> al final de la página. Los cambios se aplicarán inmediatamente en tu sitio web.
                </p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Guía no encontrada</CardTitle>
              <CardDescription>
                La guía que buscas no está disponible o aún no ha sido creada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Esta guía está en desarrollo o el enlace es incorrecto. Vuelve al inicio para explorar las guías disponibles.
              </p>
              <Link to="/guias/primeros-pasos/introduccion">
                <Button>Volver al Inicio</Button>
              </Link>
            </CardContent>
          </Card>
        );
    }
  };

  // Generate JSON-LD structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "headline": currentMetadata.title,
        "description": currentMetadata.description,
        "author": {
          "@type": "Organization",
          "name": "Mi Restaurante Online",
          "url": "https://mirestauranteonline.com"
        },
        "publisher": {
          "@type": "Organization",
          "name": "Mi Restaurante Online",
          "url": "https://mirestauranteonline.com"
        },
        "datePublished": "2025-01-01",
        "dateModified": new Date().toISOString().split('T')[0],
        "inLanguage": "es-PE",
        "articleSection": currentMetadata.category
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbPath.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": `https://mirestauranteonline.com${item.url}`
        }))
      },
      {
        "@type": "WebPage",
        "name": currentMetadata.title,
        "description": currentMetadata.description,
        "url": `https://mirestauranteonline.com/guias/${category}/${guide}`,
        "breadcrumb": {
          "@id": "#breadcrumb"
        }
      }
    ]
  };

  return isPublicRoute ? (
    <>
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{currentMetadata.title}</title>
        <meta name="title" content={currentMetadata.title} />
        <meta name="description" content={currentMetadata.description} />
        <link rel="canonical" href={`https://mirestauranteonline.com/guias/${category}/${guide}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://mirestauranteonline.com/guias/${category}/${guide}`} />
        <meta property="og:title" content={currentMetadata.title} />
        <meta property="og:description" content={currentMetadata.description} />
        <meta property="og:site_name" content="Mi Restaurante Online" />
        <meta property="og:locale" content="es_PE" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`https://mirestauranteonline.com/guias/${category}/${guide}`} />
        <meta property="twitter:title" content={currentMetadata.title} />
        <meta property="twitter:description" content={currentMetadata.description} />
        
        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Spanish" />
        <meta name="author" content="Mi Restaurante Online" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <main className="flex-1 flex overflow-hidden pt-32">
          <GuidesSidebar activeGuide={activeGuide} />
          
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6 space-y-6 max-w-5xl">
              {renderGuideContent()}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  ) : (
    <div className="flex h-full w-full overflow-hidden">
      <GuidesSidebar activeGuide={activeGuide} />
      
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 space-y-6">
          {renderGuideContent()}
        </div>
      </div>
    </div>
  );
}
