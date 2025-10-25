import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, Check, ExternalLink, FileText, Globe, Mail, Save, Palette, DollarSign, AlertCircle, CheckCircle, Info, Truck, Clock, MapPin, Link2, Image, Type, Sliders, Moon, Sun, Layout, Eye, EyeOff, ImagePlus, FileEdit, HelpCircle, ArrowUpDown, Lightbulb, Edit, Trash2, Home, Power, GripVertical, ChevronDown, ChevronRight, Users, ArrowUp, ArrowDown, PowerOff, Star, MessageSquare, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GuidesSidebar } from "@/components/client/GuidesSidebar";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
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

                {/* Navigation & Display Group */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">Botones de Navegación</h4>
                  
                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      👁️ Ocultar Botón de WhatsApp del Menú
                      <Badge variant="outline">Switch</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Activa este interruptor si NO quieres que aparezca el botón de WhatsApp en la barra de navegación superior de tu sitio web. Por defecto está visible y es útil para que los clientes te contacten fácilmente.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      👁️ Ocultar Botón de Teléfono del Menú
                      <Badge variant="outline">Switch</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Activa este interruptor si NO quieres que aparezca el botón de teléfono en la barra de navegación superior. Por defecto está visible para facilitar que los clientes te llamen directamente.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      💬 Mostrar Popup de WhatsApp
                      <Badge variant="outline">Switch</Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Activa este interruptor para mostrar un botón flotante de WhatsApp que permanece visible mientras los visitantes navegan por tu sitio. Este botón facilita el contacto directo.
                    </p>
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs text-blue-800 dark:text-blue-200">
                      <strong>💡 Tip:</strong> El botón flotante puede aumentar las conversiones, pero úsalo con moderación para no saturar la interfaz
                    </div>
                  </div>

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
                  Panel Principal → Pestaña <Badge variant="outline">Contacto</Badge> → Sección "Redes Sociales"
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

            {/* Cómo Usar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                  Cómo Usar los Controles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                    <span className="text-sm">Navega a la pestaña <Badge variant="outline">Navegación y Visibilidad</Badge></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                    <span className="text-sm">Busca la página que quieres configurar (Inicio, Acerca de, Contacto)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                    <span className="text-sm">Activa o desactiva los switches según qué secciones quieras mostrar</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">4.</span>
                    <span className="text-sm">Haz clic en <strong>"Guardar"</strong> para aplicar los cambios</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">5.</span>
                    <span className="text-sm">Verifica tu sitio web para confirmar los cambios</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Mesas</CardTitle>
              <CardDescription>
                Define los tipos de mesa disponibles en tu restaurante
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué es la Configuración de Mesas?</h3>
                <p className="text-muted-foreground">
                  Aquí defines los diferentes tipos de mesa que tiene tu restaurante. Esta información se usa como base para calcular la disponibilidad de reservas automáticamente.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cómo Configurar tus Mesas</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>Haz clic en <strong>"Agregar Configuración"</strong></li>
                  <li>Dale un nombre descriptivo (ej: "Mesa para 2", "Mesa VIP")</li>
                  <li>Especifica el número de asientos</li>
                  <li>Indica cuántas mesas de este tipo tienes</li>
                  <li>Define el tamaño mínimo y máximo de grupo que puede usar esta mesa</li>
                  <li>Establece la duración promedio de la reserva (en minutos)</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Campos Detallados</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Nombre de Mesa</h4>
                    <p className="text-sm text-muted-foreground">
                      Un nombre identificativo para el tipo de mesa. Ejemplo: "Mesa 2 personas", "Mesa familiar", "Mesa bar".
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Asientos</h4>
                    <p className="text-sm text-muted-foreground">
                      El número exacto de sillas/asientos que tiene cada mesa de este tipo.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Cantidad</h4>
                    <p className="text-sm text-muted-foreground">
                      Cuántas mesas de este tipo existen en tu restaurante.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Tamaño de Grupo (Min/Max)</h4>
                    <p className="text-sm text-muted-foreground">
                      Define el rango de personas que puede acomodar este tipo de mesa. Por ejemplo, una mesa de 4 asientos podría acomodar grupos de 2-4 personas.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Duración de Reserva</h4>
                    <p className="text-sm text-muted-foreground">
                      Tiempo promedio (en minutos) que un grupo permanece en la mesa. Esto ayuda a calcular cuántas reservas pueden hacerse en el mismo horario.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ejemplo Práctico</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium">Restaurante "La Estrella"</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>4 mesas de 2 personas (duración: 90 minutos)</li>
                    <li>6 mesas de 4 personas (duración: 120 minutos)</li>
                    <li>2 mesas de 6 personas (duración: 150 minutos)</li>
                    <li>1 mesa VIP de 8 personas (duración: 180 minutos)</li>
                  </ul>
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⚠️ <strong>Importante:</strong> Las mesas inactivas no se mostrarán en el sistema de reservas. Usa el toggle de estado para activar/desactivar tipos de mesa temporalmente.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "disponibilidad-reservas":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Disponibilidad de Reservas</CardTitle>
              <CardDescription>
                Visualiza en tiempo real la disponibilidad y crea reservas manuales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué Muestra la Disponibilidad?</h3>
                <p className="text-muted-foreground">
                  Esta vista te muestra automáticamente todos los horarios disponibles para los próximos 28 días, calculados en tiempo real basándose en tus horarios de reserva, configuración de mesas y reservas existentes.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cómo Funciona el Cálculo</h3>
                <p className="text-muted-foreground">
                  El sistema calcula la disponibilidad automáticamente considerando:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Los horarios de reserva activos que has configurado</li>
                  <li>Las mesas disponibles (globales o personalizadas por horario)</li>
                  <li>Las reservas ya confirmadas en cada franja horaria</li>
                  <li>La duración estimada de cada tipo de mesa</li>
                  <li>El tamaño del grupo que intenta reservar</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Crear Reservas Manuales</h3>
                <p className="text-muted-foreground">
                  Puedes crear reservas directamente desde el panel de administración:
                </p>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>Haz clic en el botón <strong>"Agregar Reserva"</strong></li>
                  <li>Selecciona la fecha deseada</li>
                  <li>Elige el horario disponible (solo verás horarios con disponibilidad)</li>
                  <li>Especifica el tamaño del grupo</li>
                  <li>Ingresa los datos del cliente (nombre, email, teléfono)</li>
                  <li>Guarda la reserva</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Detallada</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Vista por Fecha</h4>
                    <p className="text-sm text-muted-foreground">
                      La disponibilidad se agrupa por fecha, mostrando todos los horarios disponibles para cada día. Esto te permite ver rápidamente qué días tienen mayor disponibilidad.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Detalles de Cada Horario</h4>
                    <p className="text-sm text-muted-foreground">
                      Para cada horario se muestra: la hora, las mesas disponibles, la capacidad total, y el rango de tamaños de grupo que puede acomodar.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Actualización en Tiempo Real</h4>
                    <p className="text-sm text-muted-foreground">
                      La disponibilidad se recalcula automáticamente cada vez que se crea, modifica o cancela una reserva.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✅ <strong>Ventaja:</strong> No necesitas calcular manualmente la disponibilidad. El sistema lo hace por ti automáticamente, evitando sobreventa de mesas.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "lista-reservas":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Lista de Reservas</CardTitle>
              <CardDescription>
                Gestiona todas tus reservas en un solo lugar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué es la Lista de Reservas?</h3>
                <p className="text-muted-foreground">
                  La lista de reservas muestra todas las reservas futuras de tu restaurante, permitiéndote buscar, filtrar, gestionar y actualizar el estado de cada reserva.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Funciones Principales</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Búsqueda</h4>
                    <p className="text-sm text-muted-foreground">
                      Busca reservas por nombre del cliente, email o número de teléfono usando el campo de búsqueda.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Filtros por Estado</h4>
                    <p className="text-sm text-muted-foreground">
                      Filtra reservas por estado: Pendientes, Confirmadas, Canceladas o Completadas.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Cambio de Estado</h4>
                    <p className="text-sm text-muted-foreground">
                      Actualiza el estado de una reserva directamente desde la lista: confirmar, cancelar, declinar o marcar como completada.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Notas Internas</h4>
                    <p className="text-sm text-muted-foreground">
                      Añade notas privadas a cada reserva para recordar detalles especiales (alergias, preferencias, ocasiones especiales).
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Exportar a CSV</h4>
                    <p className="text-sm text-muted-foreground">
                      Descarga todas las reservas filtradas en formato CSV para análisis o respaldo.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estados de Reserva</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pendiente</span>
                    <p className="text-sm text-muted-foreground">Nueva reserva que aún no has confirmado</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Confirmada</span>
                    <p className="text-sm text-muted-foreground">Reserva confirmada y garantizada</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Cancelada</span>
                    <p className="text-sm text-muted-foreground">Cliente canceló la reserva</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Declinada</span>
                    <p className="text-sm text-muted-foreground">Restaurante rechazó la reserva</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Completada</span>
                    <p className="text-sm text-muted-foreground">Cliente llegó y completó su visita</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Consejos de Gestión</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Revisa las reservas pendientes diariamente y confírmalas lo antes posible</li>
                  <li>Usa las notas internas para registrar preferencias especiales de clientes habituales</li>
                  <li>Marca las reservas como completadas al final del día para mantener un historial preciso</li>
                  <li>Si debes declinar una reserva, proporciona un motivo claro al cliente</li>
                  <li>Exporta regularmente tus datos para análisis de tendencias y demanda</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Tip:</strong> Las reservas pasadas se limpian automáticamente del sistema para mantener la lista enfocada en reservas futuras.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "calendario-reservas":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Calendario de Reservas</CardTitle>
              <CardDescription>
                Visualiza tus reservas en formato de calendario mensual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Para Qué Sirve el Calendario?</h3>
                <p className="text-muted-foreground">
                  El calendario te ofrece una vista mensual de todas tus reservas, permitiéndote identificar rápidamente los días con mayor demanda y planificar recursos en consecuencia.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cómo Usar el Calendario</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>Navega entre meses usando las flechas en la parte superior</li>
                  <li>Cada día muestra el número total de reservas</li>
                  <li>Los indicadores de color muestran los estados de las reservas del día</li>
                  <li>Haz clic en cualquier día con reservas para ver los detalles</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Indicadores Visuales</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Número de Reservas</h4>
                    <p className="text-sm text-muted-foreground">
                      Cada día muestra claramente cuántas reservas tienes programadas. Los días sin reservas aparecen sin indicadores.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Código de Colores</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Los puntos de color bajo cada día indican los estados:
                    </p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>Amarillo: Pendientes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Verde: Confirmadas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Rojo: Canceladas</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Vista Detallada</h4>
                    <p className="text-sm text-muted-foreground">
                      Al hacer clic en un día, se abre un diálogo mostrando todas las reservas de ese día con información completa: nombre, hora, personas, contacto y estado.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ventajas de la Vista de Calendario</h3>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Identifica rápidamente los días con alta demanda</li>
                  <li>Planifica la asignación de personal según la ocupación prevista</li>
                  <li>Detecta patrones de reservas (días populares, temporadas altas)</li>
                  <li>Anticipa necesidades de inventario y preparación</li>
                  <li>Visualiza la distribución de reservas a lo largo del mes</li>
                </ul>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Actualizaciones en Tiempo Real</h3>
                <p className="text-muted-foreground">
                  El calendario se actualiza automáticamente cuando:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Se crea una nueva reserva (manual o desde el sitio web)</li>
                  <li>Un cliente cancela su reserva</li>
                  <li>Cambias el estado de una reserva</li>
                  <li>Se elimina una reserva</li>
                </ul>
              </div>

              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✅ <strong>Consejo:</strong> Usa el calendario junto con la lista de reservas. El calendario es ideal para planificación a largo plazo, mientras que la lista es mejor para gestión detallada del día a día.
                </p>
              </div>
            </CardContent>
          </Card>
        );
      
      case "introduccion-analiticas":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Introducción a Analíticas</CardTitle>
              <CardDescription>
                Comprende las métricas y estadísticas de tu sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  ℹ️ <strong>Nota importante:</strong> Todas las analíticas detalladas, así como la integración con Google Analytics y Google Search Console, están disponibles exclusivamente para clientes con el <strong>plan Avanzado</strong>.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué son las Analíticas?</h3>
                <p className="text-muted-foreground">
                  Las analíticas te permiten conocer el comportamiento de los visitantes en tu sitio web. Con esta información puedes tomar decisiones informadas sobre tu negocio.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Dónde encuentro mis Analíticas?</h3>
                <p className="text-muted-foreground">
                  En el <strong>Panel Principal</strong> (para clientes con plan Avanzado), encontrarás la pestaña <strong>"Analíticas"</strong>. 
                  También puedes acceder desde <strong>Configuración → Analíticas</strong> para configurar tus integraciones con Google.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información Disponible</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Visitantes</h4>
                    <p className="text-sm text-muted-foreground">
                      Número total de personas que han visitado tu sitio web
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Páginas Vistas</h4>
                    <p className="text-sm text-muted-foreground">
                      Cantidad total de páginas que han sido vistas por tus visitantes
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Uso de Ancho de Banda</h4>
                    <p className="text-sm text-muted-foreground">
                      Cantidad de datos transferidos desde tu sitio web
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Límites de Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      Visualiza tu uso actual versus los límites de tu plan de suscripción
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Revisa tus analíticas regularmente para entender cuándo tu sitio recibe más tráfico y optimizar tus horarios y ofertas.
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
                Aprende a interpretar las diferentes métricas disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  ℹ️ <strong>Nota:</strong> Las métricas avanzadas y detalladas descritas aquí están disponibles exclusivamente para clientes con el <strong>plan Avanzado</strong>.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Métricas Principales</h3>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Visitantes Únicos vs Visitas Totales</h4>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-sm text-muted-foreground">
                      <li><strong>Visitantes Únicos:</strong> Personas diferentes que visitan tu sitio (una persona = un visitante, sin importar cuántas veces entre)</li>
                      <li><strong>Visitas Totales:</strong> Número total de veces que se accede a tu sitio (incluye visitas repetidas de la misma persona)</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Páginas Vistas</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cada vez que alguien carga una página en tu sitio, se cuenta como una vista de página. Te ayuda a entender:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Qué páginas son más populares</li>
                      <li>Cómo navegan los usuarios por tu sitio</li>
                      <li>Nivel de interés en tu contenido</li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Ancho de Banda</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Es la cantidad de datos transferidos cuando alguien visita tu sitio. Incluye:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Imágenes de tu menú y galería</li>
                      <li>Contenido de texto</li>
                      <li>Estilos y recursos del sitio</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-2">
                      Cada plan tiene un límite de ancho de banda mensual. Si lo superas, se aplicarán cargos por excedente según tu plan.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Tasa de Rebote</h4>
                    <p className="text-sm text-muted-foreground">
                      Porcentaje de visitantes que entran a tu sitio y salen sin interactuar. Una tasa alta podría indicar que necesitas mejorar tu contenido o diseño.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Tiempo Promedio en el Sitio</h4>
                    <p className="text-sm text-muted-foreground">
                      Cuánto tiempo pasan los visitantes en tu sitio. Un tiempo mayor generalmente indica mayor interés en tu contenido.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interpretación de Datos</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-medium mb-2 text-green-900 dark:text-green-100">✅ Señales Positivas</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-green-900 dark:text-green-100">
                      <li>Aumento en visitantes mes a mes</li>
                      <li>Tiempo promedio alto en el sitio (3-5+ minutos)</li>
                      <li>Múltiples páginas vistas por sesión</li>
                      <li>Tasa de rebote baja (menos del 40%)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h4 className="font-medium mb-2 text-amber-900 dark:text-amber-100">⚠️ Áreas de Mejora</h4>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-amber-900 dark:text-amber-100">
                      <li>Tasa de rebote alta (más del 60%)</li>
                      <li>Tiempo muy bajo en el sitio (menos de 1 minuto)</li>
                      <li>Solo 1 página vista por sesión</li>
                      <li>Disminución constante de visitantes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> No te obsesiones con una sola métrica. Analiza el conjunto completo para obtener una visión real del rendimiento de tu sitio.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "estadisticas-uso":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Uso</CardTitle>
              <CardDescription>
                Monitorea el uso de recursos de tu plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué son las Estadísticas de Uso?</h3>
                <p className="text-muted-foreground">
                  Las estadísticas de uso te muestran cuánto de los recursos incluidos en tu plan estás utilizando cada mes.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recursos Monitoreados</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Visitas Mensuales</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Número de visitas incluidas en tu plan versus las utilizadas en el mes actual.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded">
                      <p className="text-sm">Ejemplo: Si tu plan incluye 10,000 visitas y has usado 3,500, verás 35% de uso.</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Ancho de Banda</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      GB de transferencia de datos incluidos versus utilizados.
                    </p>
                    <div className="mt-2 p-3 bg-muted rounded">
                      <p className="text-sm">Ejemplo: Plan con 50 GB, usado 12 GB = 24% de uso.</p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Días Restantes del Ciclo</h4>
                    <p className="text-sm text-muted-foreground">
                      Cuántos días quedan hasta que se reinicien tus límites mensuales. Los contadores se resetean el día que corresponde a tu fecha de facturación.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Excedentes</h3>
                <p className="text-muted-foreground">
                  Si superas los límites de tu plan, se aplicarán cargos por excedente:
                </p>
                
                <div className="space-y-3 mt-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Visitas Excedentes</h4>
                    <p className="text-sm text-muted-foreground">
                      Se cobra una tarifa por cada 1,000 visitas adicionales sobre tu límite. El costo varía según tu plan.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Ancho de Banda Excedente</h4>
                    <p className="text-sm text-muted-foreground">
                      Se cobra por cada GB adicional transferido sobre tu límite mensual.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    ⚠️ <strong>Importante:</strong> Si regularmente superas tus límites, considera actualizar a un plan superior para ahorrar en costos de excedente.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Optimización del Uso</h3>
                <p className="text-muted-foreground mb-3">
                  Consejos para mantener tu uso dentro de los límites:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Optimiza el tamaño de las imágenes antes de subirlas</li>
                  <li>Usa formatos de imagen modernos y comprimidos</li>
                  <li>Revisa regularmente tus estadísticas para anticipar necesidades</li>
                  <li>Considera actualizar tu plan si creces consistentemente</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> El widget de uso en tu dashboard te alerta cuando te acercas al 80% de tus límites mensuales.
                </p>
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
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⭐ <strong>Función Premium:</strong> La integración con Google Analytics solo está disponible para clientes con el <strong>plan Avanzado</strong>. Si tienes el plan Básico, actualiza tu plan para acceder a esta funcionalidad.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué es Google Analytics?</h3>
                <p className="text-muted-foreground">
                  Google Analytics es una herramienta gratuita de Google que te permite rastrear visitantes, páginas vistas, tiempo en el sitio, origen del tráfico y mucho más. Con GA4 (Google Analytics 4), obtienes información detallada sobre cómo interactúan los usuarios con tu restaurante online.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 1: Crear una Cuenta de Google Analytics</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Ve a <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">analytics.google.com</a>
                  </li>
                  <li>
                    Inicia sesión con tu cuenta de Google (o crea una si no tienes)
                  </li>
                  <li>
                    Haz clic en <strong>"Comenzar a medir"</strong>
                  </li>
                  <li>
                    Ingresa el <strong>nombre de tu cuenta</strong> (ej: "Mi Restaurante")
                  </li>
                  <li>
                    Configura las opciones de uso compartido de datos (recomendado dejar por defecto)
                  </li>
                  <li>
                    Haz clic en <strong>"Siguiente"</strong>
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 2: Crear una Propiedad (Property)</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Ingresa el <strong>nombre de la propiedad</strong> (ej: "Sitio Web Restaurante")
                  </li>
                  <li>
                    Selecciona tu <strong>zona horaria</strong> (ej: "(GMT-5) Hora de Perú")
                  </li>
                  <li>
                    Selecciona tu <strong>moneda</strong> (ej: "Sol peruano (S/)")
                  </li>
                  <li>
                    Haz clic en <strong>"Siguiente"</strong>
                  </li>
                  <li>
                    Completa los <strong>detalles de tu negocio</strong>:
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                      <li>Categoría de la industria: <strong>"Alimentos y bebidas"</strong></li>
                      <li>Tamaño de la empresa: Selecciona según corresponda</li>
                    </ul>
                  </li>
                  <li>
                    Selecciona <strong>objetivos de uso</strong> (ej: "Medir el interacción del usuario")
                  </li>
                  <li>
                    Haz clic en <strong>"Crear"</strong>
                  </li>
                  <li>
                    Acepta los <strong>Términos del servicio</strong>
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 3: Configurar Flujo de Datos (Data Stream)</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Selecciona <strong>"Web"</strong> como plataforma
                  </li>
                  <li>
                    Ingresa la <strong>URL de tu sitio web</strong> (ej: "turestaurante.com")
                  </li>
                  <li>
                    Ingresa un <strong>nombre para el stream</strong> (ej: "Sitio Web Principal")
                  </li>
                  <li>
                    Haz clic en <strong>"Crear stream"</strong>
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 4: Obtener tu ID de Medición (Measurement ID)</h3>
                <p className="text-muted-foreground mb-3">
                  Después de crear el stream, verás los detalles del flujo de datos:
                </p>
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">Busca el <strong>"ID de medición"</strong></p>
                  <p className="text-sm text-muted-foreground">
                    Se ve así: <code className="bg-background px-2 py-1 rounded">G-XXXXXXXXXX</code>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ejemplo: <code className="bg-background px-2 py-1 rounded">G-ABC123DEF4</code>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  <strong>COPIA este ID</strong> – lo necesitarás para el siguiente paso.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 5: Conectar Google Analytics en Mi Restaurante Online</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Ve a tu <strong>Dashboard de Mi Restaurante Online</strong>
                  </li>
                  <li>
                    <strong>Si eres cliente:</strong> Navega a <strong>Configuración</strong> en el menú lateral, luego selecciona la pestaña <strong>"Analíticas"</strong>
                  </li>
                  <li>
                    <strong>Si eres admin:</strong> Navega a <strong>Panel Principal</strong>, luego selecciona la pestaña <strong>"Avanzado"</strong> y busca la sección de Google Analytics
                  </li>
                  <li>
                    Activa el switch <strong>"Habilitar Analíticas"</strong> (o el switch junto a "Google Analytics 4" si eres admin)
                  </li>
                  <li>
                    Pega tu <strong>ID de Google Analytics (G-XXXXXXXXXX)</strong> en el campo correspondiente
                  </li>
                  <li>
                    Haz clic en <strong>"Guardar cambios"</strong>
                  </li>
                </ol>

                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    ✅ <strong>¡Listo!</strong> Google Analytics comenzará a rastrear visitantes automáticamente. Los datos pueden tardar 24-48 horas en aparecer en tu cuenta de Google Analytics.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Verificar que Funciona</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>
                    Ve a <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Analytics</a>
                  </li>
                  <li>
                    Selecciona tu propiedad
                  </li>
                  <li>
                    Ve a <strong>Informes → Tiempo real</strong>
                  </li>
                  <li>
                    Abre tu sitio web en otra pestaña
                  </li>
                  <li>
                    Deberías ver <strong>tu visita en tiempo real</strong> en el informe
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Explora los informes de GA4 para entender de dónde vienen tus visitantes (búsqueda, redes sociales, directo) y qué páginas visitan más. Esto te ayudará a optimizar tu estrategia de marketing.
                </p>
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
                Verifica tu sitio web en Google Search Console para mejorar tu SEO y aparecer en resultados de búsqueda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  ⭐ <strong>Función Premium:</strong> La integración con Google Search Console solo está disponible para clientes con el <strong>plan Avanzado</strong>. Si tienes el plan Básico, actualiza tu plan para acceder a esta funcionalidad.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Qué es Google Search Console?</h3>
                <p className="text-muted-foreground">
                  Google Search Console (GSC) es una herramienta gratuita de Google que te ayuda a monitorear y mejorar cómo aparece tu sitio en los resultados de búsqueda de Google. Con GSC puedes ver qué palabras clave traen tráfico, identificar problemas de indexación, y optimizar tu presencia en Google.
                </p>
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
                </ul>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 1: Acceder a Google Search Console</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Ve a <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">search.google.com/search-console</a>
                  </li>
                  <li>
                    Inicia sesión con tu cuenta de Google (la misma que usaste para Analytics si ya lo configuraste)
                  </li>
                  <li>
                    Haz clic en <strong>"Comenzar ahora"</strong>
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 2: Agregar tu Propiedad</h3>
                <p className="text-muted-foreground mb-3">
                  Verás dos opciones para agregar tu propiedad:
                </p>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Opción 1: Dominio (Recomendado)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Verifica todos los subdominios y protocolos (http, https, www, etc.)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ingresa solo tu dominio: <code className="bg-background px-2 py-1 rounded">turestaurante.com</code>
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                      ⚠️ Esta opción requiere verificación por DNS. Si no tienes acceso a tu DNS, usa la Opción 2.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                    <h4 className="font-medium mb-2">Opción 2: Prefijo de URL (Más Fácil) ✅</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Verifica solo una URL específica
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Ingresa la URL completa: <code className="bg-background px-2 py-1 rounded">https://turestaurante.com</code>
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      💡 <strong>Recomendamos esta opción</strong> porque puedes verificar con una etiqueta meta (más fácil).
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-3">
                  <strong>Para esta guía usaremos la Opción 2 (Prefijo de URL)</strong>
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 3: Elegir Método de Verificación</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Después de ingresar tu URL, verás varios métodos de verificación
                  </li>
                  <li>
                    Selecciona <strong>"Etiqueta HTML"</strong>
                  </li>
                  <li>
                    Google te mostrará un código que se ve así:
                    <div className="p-3 bg-muted rounded mt-2 overflow-x-auto">
                      <code className="text-xs">
                        &lt;meta name="google-site-verification" content="<strong className="text-blue-600">ABC123xyz...</strong>" /&gt;
                      </code>
                    </div>
                  </li>
                  <li>
                    <strong>COPIA</strong> solo la parte del <code className="bg-background px-1 py-0.5 rounded text-sm">content="..."</code> (el texto después de <code className="bg-background px-1 py-0.5 rounded text-sm">content=</code>)
                    <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded mt-2">
                      <p className="text-sm text-green-900 dark:text-green-100">
                        Ejemplo: Si el código es<br />
                        <code className="text-xs">&lt;meta name="google-site-verification" content="<strong>XYZ789abc_EJEMPLO-123</strong>" /&gt;</code><br />
                        <strong>Solo copia:</strong> <code className="text-xs bg-background px-1 py-0.5 rounded">XYZ789abc_EJEMPLO-123</code>
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 4: Agregar el Código en Mi Restaurante Online</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Ve a tu <strong>Dashboard de Mi Restaurante Online</strong>
                  </li>
                  <li>
                    <strong>Si eres cliente:</strong> Navega a <strong>Configuración</strong> en el menú lateral, luego selecciona la pestaña <strong>"Analíticas"</strong>
                  </li>
                  <li>
                    <strong>Si eres admin:</strong> Navega a <strong>Panel Principal</strong>, luego selecciona la pestaña <strong>"Avanzado"</strong> y busca la sección de Google Search Console
                  </li>
                  <li>
                    Pega el <strong>código de verificación</strong> que copiaste en el campo <strong>"Código de verificación GSC"</strong>
                    <div className="p-3 bg-muted rounded mt-2">
                      <p className="text-sm">El formato debe ser algo como: <code className="bg-background px-2 py-1 rounded text-xs">XYZ789abc_EJEMPLO-123</code></p>
                    </div>
                  </li>
                  <li>
                    Haz clic en <strong>"Guardar cambios"</strong>
                  </li>
                </ol>

                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    ⏱️ <strong>Espera 1-2 minutos</strong> después de guardar para que el código se propague correctamente antes de verificar en Google.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 5: Verificar en Google Search Console</h3>
                <ol className="list-decimal list-inside space-y-3 ml-4 text-muted-foreground">
                  <li>
                    Vuelve a la pestaña de <strong>Google Search Console</strong>
                  </li>
                  <li>
                    Haz clic en el botón <strong>"Verificar"</strong>
                  </li>
                  <li>
                    Si todo está correcto, verás un mensaje de <strong>"Propiedad verificada"</strong> ✅
                  </li>
                </ol>

                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    ✅ <strong>¡Felicitaciones!</strong> Tu sitio está verificado. Los datos comenzarán a aparecer en 24-48 horas. Google empezará a rastrear tu sitio web y mostrarte información sobre tu rendimiento en búsquedas.
                  </p>
                </div>

                <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg mt-4">
                  <h4 className="font-medium mb-2 text-red-900 dark:text-red-100">❌ Si la verificación falla:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-red-900 dark:text-red-100">
                    <li>Verifica que copiaste el código completo correctamente</li>
                    <li>Asegúrate de haber esperado 1-2 minutos después de guardar</li>
                    <li>Revisa que guardaste los cambios en Mi Restaurante Online</li>
                    <li>Intenta limpiar la caché de tu navegador</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Paso 6: Enviar tu Sitemap (Opcional pero Recomendado)</h3>
                <p className="text-muted-foreground mb-3">
                  Un sitemap ayuda a Google a indexar todas las páginas de tu sitio más rápidamente:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>
                    En Google Search Console, ve a <strong>"Sitemaps"</strong> en el menú lateral
                  </li>
                  <li>
                    En "Agregar un nuevo sitemap", ingresa: <code className="bg-background px-2 py-1 rounded">sitemap.xml</code>
                  </li>
                  <li>
                    Haz clic en <strong>"Enviar"</strong>
                  </li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Qué Hacer Después</h3>
                <p className="text-muted-foreground mb-3">
                  Una vez verificado, podrás acceder a información valiosa:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-muted-foreground">
                  <li><strong>Rendimiento:</strong> Qué búsquedas muestran tu restaurante</li>
                  <li><strong>Inspección de URL:</strong> Verificar si páginas específicas están indexadas</li>
                  <li><strong>Cobertura:</strong> Identificar errores de rastreo</li>
                  <li><strong>Experiencia:</strong> Ver si tu sitio es mobile-friendly</li>
                  <li><strong>Mejoras:</strong> Sugerencias para optimizar tu SEO</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Revisa Google Search Console semanalmente para identificar oportunidades de mejorar tu ranking. Presta atención a las palabras clave que te traen clics y optimiza tu contenido alrededor de ellas.
                </p>
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
                Aprende cómo contactarnos y obtener ayuda cuando la necesites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Canales de Soporte Disponibles</h3>
                
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Sistema de Tickets (Recomendado)</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Crea tickets desde tu dashboard para soporte técnico y consultas. Este es el método más eficiente ya que:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Queda registro de toda la conversación</li>
                      <li>Puedes adjuntar capturas de pantalla</li>
                      <li>Recibes notificaciones de respuestas por email</li>
                      <li>Puedes revisar el historial en cualquier momento</li>
                    </ul>
                    <div className="mt-3">
                      <Button variant="outline" asChild>
                        <a href="/client/support">Ir a Soporte</a>
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">WhatsApp</h4>
                    <p className="text-sm text-muted-foreground">
                      Para consultas rápidas o emergencias urgentes, también puedes contactarnos por WhatsApp. Encontrarás el botón de WhatsApp en la esquina inferior derecha de tu sitio.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Guías y Documentación</h4>
                    <p className="text-sm text-muted-foreground">
                      Antes de contactarnos, revisa esta sección de guías. Muchas preguntas comunes están respondidas aquí con instrucciones paso a paso.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Horarios de Atención</h3>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Nuestro equipo de soporte está disponible:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground mt-2">
                    <li>Lunes a Viernes: 9:00 AM - 6:00 PM (hora local)</li>
                    <li>Sábados: 10:00 AM - 2:00 PM</li>
                    <li>Domingos y festivos: Cerrado</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3">
                    Los tickets creados fuera de horario serán respondidos al inicio del siguiente día hábil.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tiempos de Respuesta</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span className="text-red-600">🔴</span> Urgente
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sitio caído, errores críticos: Respuesta en 2-4 horas durante horario laboral
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span className="text-amber-600">🟡</span> Normal
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Consultas generales, configuraciones: Respuesta en 24 horas
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <span className="text-blue-600">🔵</span> Baja Prioridad
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Sugerencias, mejoras: Respuesta en 48-72 horas
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Cuando crees un ticket, incluye toda la información relevante: qué estabas intentando hacer, qué sucedió, capturas de pantalla, etc. Esto nos ayuda a resolver tu problema más rápido.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "crear-tickets":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Crear Tickets de Soporte</CardTitle>
              <CardDescription>
                Guía paso a paso para crear tickets efectivos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">¿Cómo Crear un Ticket?</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Soporte</strong> desde el menú principal y sigue estos pasos:
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-medium">Haz clic en "Crear Nuevo Ticket"</h4>
                    <p className="text-sm text-muted-foreground">
                      Encontrarás este botón en la parte superior de la página de soporte.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-medium">Completa los Campos Requeridos</h4>
                    <div className="space-y-3 mt-3">
                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Asunto *</h5>
                        <p className="text-sm text-muted-foreground">
                          Un título claro y descriptivo del problema o consulta
                        </p>
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          Ejemplo: "Error al subir imágenes del menú" en lugar de solo "Ayuda"
                        </p>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Categoría *</h5>
                        <p className="text-sm text-muted-foreground">
                          Selecciona la categoría que mejor describe tu consulta:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground mt-2">
                          <li>Técnico: Problemas con el sitio o funcionalidades</li>
                          <li>Facturación: Consultas sobre pagos y suscripciones</li>
                          <li>Configuración: Ayuda con ajustes del dashboard</li>
                          <li>General: Otras consultas</li>
                        </ul>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Prioridad *</h5>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                          <li><strong>Baja:</strong> Consultas generales, no urgentes</li>
                          <li><strong>Normal:</strong> Problemas que afectan funcionalidad pero no bloquean</li>
                          <li><strong>Alta:</strong> Problemas que impiden usar el sitio</li>
                          <li><strong>Urgente:</strong> Sitio completamente caído o error crítico</li>
                        </ul>
                      </div>

                      <div className="p-3 border rounded-lg">
                        <h5 className="font-medium text-sm mb-1">Descripción *</h5>
                        <p className="text-sm text-muted-foreground mb-2">
                          Explica el problema en detalle. Incluye:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                          <li>Qué estabas intentando hacer</li>
                          <li>Qué sucedió (el error o problema)</li>
                          <li>Qué esperabas que sucediera</li>
                          <li>Pasos para reproducir el problema</li>
                          <li>Navegador y dispositivo que usas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-medium">Adjunta Capturas de Pantalla (Opcional)</h4>
                    <p className="text-sm text-muted-foreground">
                      Las imágenes nos ayudan a entender mejor el problema. Captura:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Mensajes de error completos</li>
                      <li>La pantalla donde ocurre el problema</li>
                      <li>Cualquier comportamiento inesperado</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="space-y-2 flex-1">
                    <h4 className="font-medium">Envía el Ticket</h4>
                    <p className="text-sm text-muted-foreground">
                      Revisa que toda la información sea correcta y haz clic en "Crear Ticket". Recibirás una confirmación por email.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Ejemplo de Buen Ticket</h3>
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg space-y-2">
                  <p className="font-medium text-green-900 dark:text-green-100">Asunto:</p>
                  <p className="text-sm text-green-900 dark:text-green-100">
                    Error 500 al intentar actualizar horarios de apertura
                  </p>
                  
                  <p className="font-medium text-green-900 dark:text-green-100 mt-3">Descripción:</p>
                  <p className="text-sm text-green-900 dark:text-green-100">
                    Hola, estoy intentando actualizar los horarios de apertura de mi restaurante desde Panel Principal → Configuración → Horarios.
                    <br /><br />
                    Cuando hago clic en "Guardar Cambios" después de modificar el horario del lunes, aparece un error 500 y los cambios no se guardan.
                    <br /><br />
                    Pasos para reproducir:
                    <br />
                    1. Ir a Panel Principal → Horarios
                    <br />
                    2. Cambiar hora de apertura del lunes de 10:00 a 11:00
                    <br />
                    3. Hacer clic en "Guardar Cambios"
                    <br />
                    4. Aparece error 500
                    <br /><br />
                    Navegador: Chrome, versión 120
                    <br />
                    Dispositivo: MacBook Pro
                    <br /><br />
                    Adjunto captura del error.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Cuanta más información proporciones, más rápido podremos resolver tu problema. No te preocupes por dar "demasiados" detalles.
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case "historial-tickets":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Tickets</CardTitle>
              <CardDescription>
                Cómo revisar y gestionar tus tickets de soporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Acceder a tu Historial</h3>
                <p className="text-muted-foreground">
                  Ve a <strong>Soporte</strong> desde el menú principal. Verás una lista de todos tus tickets anteriores y actuales.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Estados de Tickets</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <h4 className="font-medium">Abierto</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ticket nuevo o en proceso de resolución. Nuestro equipo está trabajando en él.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                      <h4 className="font-medium">Esperando Respuesta</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      El equipo ha respondido y está esperando más información de tu parte.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <h4 className="font-medium">Resuelto</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      El problema ha sido solucionado. Puedes reabrirlo si el problema persiste.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <h4 className="font-medium">Cerrado</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ticket finalizado. Si tienes un problema relacionado, crea un nuevo ticket.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Responder a un Ticket</h3>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Haz clic en el ticket que deseas revisar</li>
                  <li>Lee la respuesta del equipo de soporte</li>
                  <li>Escribe tu respuesta en el campo de texto al final</li>
                  <li>Puedes adjuntar archivos adicionales si es necesario</li>
                  <li>Haz clic en "Enviar Respuesta"</li>
                </ol>
                <p className="text-muted-foreground mt-3">
                  Recibirás un email cada vez que el equipo responda a tu ticket.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Filtrar y Buscar Tickets</h3>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Por Estado</h4>
                    <p className="text-sm text-muted-foreground">
                      Usa los filtros para ver solo tickets abiertos, resueltos o cerrados.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Por Fecha</h4>
                    <p className="text-sm text-muted-foreground">
                      Los tickets más recientes aparecen primero. Puedes ordenar por fecha de creación o última actualización.
                    </p>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Búsqueda</h4>
                    <p className="text-sm text-muted-foreground">
                      Usa la barra de búsqueda para encontrar tickets por palabras clave en el asunto o descripción.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Reabrir un Ticket Cerrado</h3>
                <p className="text-muted-foreground">
                  Si el problema persiste después de que un ticket fue marcado como resuelto:
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4 text-muted-foreground">
                  <li>Abre el ticket desde tu historial</li>
                  <li>Haz clic en "Reabrir Ticket"</li>
                  <li>Explica por qué el problema aún no está resuelto</li>
                  <li>Incluye información adicional si es relevante</li>
                </ol>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  💡 <strong>Consejo:</strong> Revisa tu historial de tickets antes de crear uno nuevo. Es posible que un problema similar ya haya sido resuelto anteriormente.
                </p>
              </div>
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
