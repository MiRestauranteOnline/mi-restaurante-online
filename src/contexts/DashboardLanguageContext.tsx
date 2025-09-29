import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface DashboardLanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const DashboardLanguageContext = createContext<DashboardLanguageContextType | undefined>(undefined);

const translations = {
  es: {
    // Navigation
    'nav.dashboard': 'Panel Principal',
    'nav.general': 'General',
    'nav.appearance': 'Apariencia',
    'nav.contact': 'Contacto',
    'nav.menu': 'Menú',
    'nav.carousel': 'Carousel',
    'nav.team': 'Equipo',
    'nav.reviews': 'Reseñas',
    'nav.settings': 'Configuración',
    'nav.images': 'Imágenes',
    
    // Admin Navigation
    'admin.clientManagement': 'Gestión de Clientes',
    'admin.subscriptionManagement': 'Gestión de Suscripciones',
    'admin.marketingAnalytics': 'Analíticas de Marketing',
    'admin.projectConfiguration': 'Configuración del Proyecto',
    'admin.clientImages': 'Imágenes de Clientes',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.saving': 'Guardando...',
    'common.saved': 'Guardado',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.add': 'Agregar',
    'common.search': 'Buscar',
    'common.actions': 'Acciones',
    'common.name': 'Nombre',
    'common.description': 'Descripción',
    'common.image': 'Imagen',
    'common.status': 'Estado',
    'common.enabled': 'Habilitado',
    'common.disabled': 'Deshabilitado',
    
    // Buttons
    'button.viewWebsite': 'Ver Sitio Web',
    'button.logout': 'Cerrar Sesión',
    'button.backToAdmin': 'Volver al Administrador',
    
    // Headers
    'header.clientPortal': 'Portal del Cliente',
    'header.adminDashboard': 'Panel de Administración',
    
    // General tab
    'general.title': 'Información General',
    'general.description': 'Configuración básica del restaurante',
    'general.restaurantName': 'Nombre del Restaurante',
    'general.email': 'Correo Electrónico',
    'general.phone': 'Teléfono',
    'general.address': 'Dirección',
    'general.whatsapp': 'WhatsApp',
    'general.coordinates': 'Coordenadas',
    'general.openingHours': 'Horarios de Apertura',
    'general.socialMedia': 'Redes Sociales',
    'general.deliveryInfo': 'Información de Delivery',
    'general.subdomain': 'Subdominio',
    'general.hideWhatsAppButton': 'Ocultar Botón de WhatsApp del Menú',
    'general.hidden': 'Oculto',
    'general.visible': 'Visible',
    'general.password': 'Contraseña',
    'general.hidePhoneButton': 'Ocultar Botón de Teléfono del Menú',
    'general.customButton': 'Botón Personalizado',
    'general.customDomain': 'Dominio Personalizado',
    'general.showWhatsAppPopup': 'Mostrar Popup de WhatsApp',
    'general.enabled': 'Habilitado',
    'general.disabled': 'Deshabilitado',
    'general.phonePlaceholder': '123 456 789',
    'general.whatsappPlaceholder': '987 654 321',
    'general.ctaButtonPlaceholder': 'Reservar Mesa',
    'general.ctaLinkPlaceholder': '#contacto o https://ejemplo.com',
    'general.subdomainPlaceholder': 'nombrecliente',
    'general.customDomainPlaceholder': 'www.restaurantecliente.com',
    'general.opens': 'Abre',
    'general.closes': 'Cierra',
    'general.heroDescription': 'Descripción del Hero',
    'general.sectionDescription': 'Descripción de la Sección',
    'general.monday': 'Lunes',
    'general.tuesday': 'Martes',
    'general.wednesday': 'Miércoles', 
    'general.thursday': 'Jueves',
    'general.friday': 'Viernes',
    'general.saturday': 'Sábado',
    'general.sunday': 'Domingo',
    'general.open': 'Abierto',
    'general.closed': 'Cerrado',
    
    // Appearance tab
    'appearance.title': 'Configuración de Apariencia',
    'appearance.description': 'Personaliza la apariencia de tu sitio web',
    'appearance.primaryColor': 'Color Primario',
    'appearance.headerBackground': 'Fondo del Header',
    'appearance.headerBackgroundEnabled': 'Habilitar Fondo del Header',
    'appearance.hideWhatsAppButton': 'Ocultar Botón de WhatsApp en Menú',
    
    // Contact tab
    'contact.title': 'Configuración de Contacto',
    'contact.description': 'Gestiona la información de contacto',
    
    // Menu tab
    'menu.title': 'Gestión del Menú',
    'menu.description': 'Administra las categorías y productos del menú',
    'menu.categories': 'Categorías',
    'menu.items': 'Productos',
    'menu.addCategory': 'Agregar Categoría',
    'menu.addItem': 'Agregar Producto',
    'menu.categoryName': 'Nombre de la Categoría',
    'menu.categoryDescription': 'Descripción de la Categoría',
    'menu.itemName': 'Nombre del Producto',
    'menu.itemDescription': 'Descripción del Producto',
    'menu.price': 'Precio',
    'menu.category': 'Categoría',
    'menu.editMenuItem': 'Editar Producto del Menú',
    'menu.addMenuItem': 'Agregar Producto del Menú',
    'menu.showOnHomepage': 'Mostrar en Página Principal',
    'menu.showOnHomepageDesc': 'Mostrar este producto en la página principal (máximo 8 productos)',
    'menu.showImageHome': 'Mostrar Imagen en Página Principal',
    'menu.showImageHomeDesc': 'Mostrar imagen cuando se muestre en la página principal',
    'menu.showImageMenu': 'Mostrar Imagen en Página del Menú',
    'menu.showImageMenuDesc': 'Mostrar imagen en la página completa del menú',
    'menu.displayOrder': 'Orden de Visualización',
    'menu.selectCategory': 'Seleccionar categoría',
    'menu.imageUrl': 'URL de Imagen',
    'menu.saveMenu': 'Guardar Menú',
    
    // Carousel tab
    'carousel.title': 'Configuración del Carousel',
    'carousel.description': 'Administra las imágenes del carousel',
    'carousel.showCarousel': 'Mostrar Carousel',
    'carousel.position': 'Posición del Carousel',
    'carousel.images': 'Imágenes del Carousel',
    'carousel.addImage': 'Agregar Imagen al Carousel',
    'carousel.position1': 'Posición 1 (Después del Hero)',
    'carousel.position2': 'Posición 2 (Después de Servicios)',
    'carousel.position3': 'Posición 3 (Después de Menú)',
    'carousel.position4': 'Posición 4 (Después de Historia)',
    'carousel.position5': 'Posición 5 (Después de Testimonios)',
    'carousel.position6': 'Posición 6 (Después de Equipo)',
    'carousel.position7': 'Posición 7 (Antes de Contacto)',
    
    // Team tab
    'team.title': 'Gestión del Equipo',
    'team.description': 'Administra los miembros del equipo',
    'team.addMember': 'Agregar Miembro',
    'team.memberName': 'Nombre del Miembro',
    'team.position': 'Cargo',
    'team.bio': 'Biografía',
    'team.editTeamMember': 'Editar Miembro del Equipo',
    'team.addTeamMember': 'Agregar Nuevo Miembro del Equipo',
    'team.jobTitle': 'Título',
    'team.profileImage': 'Imagen de Perfil',
    'team.namePlaceholder': 'Nombre del miembro del equipo',
    'team.titlePlaceholder': 'Título del trabajo',
    'team.bioPlaceholder': 'Biografía corta',
    
    // Reviews tab
    'reviews.title': 'Reseñas',
    'reviews.description': 'Administra las reseñas de clientes',
    'reviews.addReview': 'Agregar Reseña',
    'reviews.customerName': 'Nombre del Cliente',
    'reviews.rating': 'Calificación',
    'reviews.comment': 'Comentario',
    'reviews.reviewerName': 'Nombre del Reseñador',
    
    // Menu tab
    'menu.createFirstCategoryButton': 'Crear Primera Categoría',
    'menu.manageDescription': 'Administra las categorías y productos de tu menú. Arrastra las categorías para reordenarlas.',
    
    // Team tab
    'team.teamMembers': 'Miembros del Equipo',
    
    'team.noTeamMembers': 'No se encontraron miembros del equipo. ¡Agrega tu primer miembro del equipo!',
    
    // Branding tab
    'branding.title': 'Marca y Personalización',
    'branding.primaryColor': 'Color Primario',
    'branding.headerBackground': 'Fondo del Header',
    'branding.enableHeaderBackground': 'Habilitar Fondo del Header',
    'branding.headerBackgroundStyle': 'Estilo del Fondo del Header',
    'branding.themeSettings': 'Configuración de Tema',
    'branding.theme': 'Tema',
    'branding.bright': 'Claro',
    'branding.dark': 'Oscuro',
    'branding.logoSettings': 'Configuración de Logo',
    'branding.headerLogo': 'Logo del Header',
    'branding.footerLogo': 'Logo del Footer',
    'branding.typography': 'Tipografía',
    'branding.titleFont': 'Fuente de Títulos',
    'branding.titleFontWeight': 'Peso de Fuente de Títulos',
    'branding.bodyFont': 'Fuente del Cuerpo',
    
    // Content tab
    'content.homepage': 'Página Principal',
    'content.heroSection': 'Sección Hero',
    'content.firstLineHeroTitle': 'Primera Línea del Título Hero',
    'content.secondLineHeroTitle': 'Segunda Línea del Título Hero',
    'content.heroSubtitle': 'Texto del Subtítulo del Hero',
    'content.rightHeroButtonText': 'Texto del Botón Hero Derecho',
    'content.rightHeroButtonLink': 'Enlace del Botón Hero Derecho',
    'content.heroBackgroundImage': 'Imagen de Fondo del Hero',
    'content.aboutSection': 'Sección Acerca de',
    'content.aboutSectionDescription': 'Descripción de la Sección Acerca de',
    'content.menuSection': 'Sección Menú',
    'content.servicesSection': 'Sección Servicios',
    'content.contactSection': 'Sección Contacto',
    'content.deliverySection': 'Sección Delivery',
    'images.title': 'Imágenes del Cliente',
    'images.description': 'Haz clic en cualquier imagen para copiar su URL. Gestiona las imágenes subidas por este cliente.',
    'images.uploadNew': 'Subir Nueva Imagen',
    'images.customImages': 'Imágenes Personalizadas',
    'images.selectClient': 'Selecciona un cliente para ver las imágenes.',
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.general': 'General',
    'nav.appearance': 'Appearance',
    'nav.contact': 'Contact',
    'nav.menu': 'Menu',
    'nav.carousel': 'Carousel',
    'nav.team': 'Team',
    'nav.reviews': 'Reviews',
    'nav.settings': 'Settings',
    'nav.images': 'Images',
    
    // Admin Navigation
    'admin.clientManagement': 'Client Management',
    'admin.subscriptionManagement': 'Subscription Management',
    'admin.marketingAnalytics': 'Marketing Analytics',
    'admin.projectConfiguration': 'Project Configuration',
    'admin.clientImages': 'Client Images',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.saving': 'Saving...',
    'common.saved': 'Saved',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.actions': 'Actions',
    'common.name': 'Name',
    'common.description': 'Description',
    'common.image': 'Image',
    'common.status': 'Status',
    'common.enabled': 'Enabled',
    'common.disabled': 'Disabled',
    
    // Buttons
    'button.viewWebsite': 'View Website',
    'button.logout': 'Logout',
    'button.backToAdmin': 'Back to Admin',
    
    // Headers
    'header.clientPortal': 'Client Portal',
    'header.adminDashboard': 'Admin Dashboard',
    
    // General tab
    'general.title': 'General Information',
    'general.description': 'Basic restaurant configuration',
    'general.restaurantName': 'Restaurant Name',
    'general.email': 'Email',
    'general.phone': 'Phone',
    'general.address': 'Address',
    'general.whatsapp': 'WhatsApp',
    'general.coordinates': 'Coordinates',
    'general.openingHours': 'Opening Hours',
    'general.monday': 'Monday',
    'general.tuesday': 'Tuesday',
    'general.wednesday': 'Wednesday',
    'general.thursday': 'Thursday',
    'general.friday': 'Friday',
    'general.saturday': 'Saturday',
    'general.sunday': 'Sunday',
    'general.open': 'Open',
    'general.closed': 'Closed',
    'general.opens': 'Opens',
    'general.closes': 'Closes',
    
    'general.socialMedia': 'Social Media',
    'general.deliveryInfo': 'Delivery Information',
    'general.subdomain': 'Subdomain',
    'general.hideWhatsAppButton': 'Hide WhatsApp Button from Menu',
    'general.hidden': 'Hidden',
    'general.visible': 'Visible',
    'general.password': 'Password',
    'general.hidePhoneButton': 'Hide Phone Button from Menu',
    'general.customButton': 'Custom Button',
    'general.customDomain': 'Custom Domain',
    'general.showWhatsAppPopup': 'Show WhatsApp Popup',
    'general.enabled': 'Enabled',
    'general.disabled': 'Disabled',
    'general.phonePlaceholder': '123 456 789',
    'general.whatsappPlaceholder': '987 654 321',
    'general.ctaButtonPlaceholder': 'Reserve Table',
    'general.ctaLinkPlaceholder': '#contact or https://example.com',
    'general.subdomainPlaceholder': 'clientname',
    'general.customDomainPlaceholder': 'www.clientrestaurant.com',
    
    // Appearance tab
    'appearance.title': 'Appearance Settings',
    'appearance.description': 'Customize your website appearance',
    'appearance.primaryColor': 'Primary Color',
    'appearance.headerBackground': 'Header Background',
    'appearance.headerBackgroundEnabled': 'Enable Header Background',
    'appearance.hideWhatsAppButton': 'Hide WhatsApp Button in Menu',
    
    // Contact tab
    'contact.title': 'Contact Settings',
    'contact.description': 'Manage contact information',
    
    // Menu tab
    'menu.title': 'Menu Management',
    'menu.description': 'Manage menu categories and items',
    'menu.categories': 'Categories',
    'menu.items': 'Items',
    'menu.addCategory': 'Add Category',
    'menu.addItem': 'Add Item',
    'menu.categoryName': 'Category Name',
    'menu.categoryDescription': 'Category Description',
    'menu.itemName': 'Item Name',
    'menu.itemDescription': 'Item Description',
    'menu.price': 'Price',
    'menu.category': 'Category',
    'menu.editMenuItem': 'Edit Menu Item',
    'menu.addMenuItem': 'Add Menu Item',
    'menu.showOnHomepage': 'Show on Homepage',
    'menu.showOnHomepageDesc': 'Display this item on the homepage (max 8 items)',
    'menu.showImageHome': 'Show Image on Homepage',
    'menu.showImageHomeDesc': 'Display image when shown on homepage',
    'menu.showImageMenu': 'Show Image on Menu Page',
    'menu.showImageMenuDesc': 'Display image on the full menu page',
    'menu.displayOrder': 'Display Order',
    'menu.selectCategory': 'Select category',
    'menu.imageUrl': 'Image URL',
    'menu.saveMenu': 'Save Menu',
    
    // Carousel tab
    'carousel.title': 'Carousel Settings',
    'carousel.description': 'Manage carousel images',
    'carousel.showCarousel': 'Show Carousel',
    'carousel.position': 'Carousel Position',
    'carousel.images': 'Carousel Images',
    'carousel.addImage': 'Add Carousel Image',
    'carousel.position1': 'Position 1 (After Hero)',
    'carousel.position2': 'Position 2 (After Services)',
    'carousel.position3': 'Position 3 (After Menu)',
    'carousel.position4': 'Position 4 (After Story)',
    'carousel.position5': 'Position 5 (After Testimonials)',
    'carousel.position6': 'Position 6 (After Team)',
    'carousel.position7': 'Position 7 (Before Contact)',
    
    // Team tab
    'team.title': 'Team Management',
    'team.description': 'Manage team members',
    'team.addMember': 'Add Member',
    'team.memberName': 'Member Name',
    'team.position': 'Position',
    'team.bio': 'Biography',
    'team.editTeamMember': 'Edit Team Member',
    'team.addTeamMember': 'Add New Team Member',
    'team.jobTitle': 'Title',
    'team.profileImage': 'Profile Image',
    'team.namePlaceholder': 'Team member name',
    'team.titlePlaceholder': 'Job title',
    'team.bioPlaceholder': 'Short bio',
    
    // Menu tab
    'reviews.reviewerName': 'Reviewer Name',
    'menu.editCategory': 'Edit Category',
    
    
    // Images tab
    'images.title': 'Client Images',
    'images.description': 'Click any image to copy its URL. Manage images uploaded by this client.',
    'images.uploadNew': 'Upload New Image',
    'images.customImages': 'Custom Images',
    'images.selectClient': 'Select a client to view images.',
  }
};

export const DashboardLanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <DashboardLanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </DashboardLanguageContext.Provider>
  );
};

export const useDashboardLanguage = (): DashboardLanguageContextType => {
  const context = useContext(DashboardLanguageContext);
  if (!context) {
    throw new Error('useDashboardLanguage must be used within a DashboardLanguageProvider');
  }
  return context;
};