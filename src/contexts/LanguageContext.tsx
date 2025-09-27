import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.menu': 'Menu',
    'nav.categories': 'Categories', 
    'nav.items': 'Items',
    'nav.reviews': 'Reviews',
    'nav.team': 'Team',
    'nav.settings': 'Settings',
    'nav.subscription': 'Subscription',
    'nav.logout': 'Logout',
    
    // Common
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.add': 'Add',
    'common.view': 'View',
    
    // Admin
    'admin.panel': 'Admin Panel',
    'admin.clientManagement': 'Client Management',
    'admin.subscriptionManagement': 'Subscription Management',
    
    // Subscription
    'subscription.title': 'Subscription Management',
    'subscription.currentPlan': 'Current Plan',
    'subscription.status': 'Status',
    'subscription.nextBilling': 'Next Billing',
    'subscription.upgrade': 'Upgrade Plan',
    'subscription.cancel': 'Cancel Subscription',
    'subscription.cancelWarning': 'Warning: Your website will go offline at the end of your current billing cycle. You can use your domain name freely after cancellation.',
    'subscription.confirmCancel': 'Are you sure you want to cancel your subscription?',
    'subscription.basic': 'Basic Plan',
    'subscription.advanced': 'Advanced Plan',
    
    // Settings tabs
    'settings.general': 'General',
    'settings.menu': 'Menu',
    'settings.reviews': 'Reviews',
    'settings.team': 'Team',
    'settings.appearance': 'Appearance',
    'settings.contact': 'Contact',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.menu': 'Menú',
    'nav.categories': 'Categorías',
    'nav.items': 'Elementos',
    'nav.reviews': 'Reseñas',
    'nav.team': 'Equipo',
    'nav.settings': 'Configuración',
    'nav.subscription': 'Suscripción',
    'nav.logout': 'Cerrar Sesión',
    
    // Common
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.loading': 'Cargando...',
    'common.search': 'Buscar',
    'common.add': 'Agregar',
    'common.view': 'Ver',
    
    // Admin
    'admin.panel': 'Panel de Administración',
    'admin.clientManagement': 'Gestión de Clientes',
    'admin.subscriptionManagement': 'Gestión de Suscripciones',
    
    // Subscription
    'subscription.title': 'Gestión de Suscripción',
    'subscription.currentPlan': 'Plan Actual',
    'subscription.status': 'Estado',
    'subscription.nextBilling': 'Próxima Facturación',
    'subscription.upgrade': 'Actualizar Plan',
    'subscription.cancel': 'Cancelar Suscripción',
    'subscription.cancelWarning': 'Advertencia: Su sitio web se desconectará al final de su ciclo de facturación actual. Puede usar su nombre de dominio libremente después de la cancelación.',
    'subscription.confirmCancel': '¿Está seguro de que desea cancelar su suscripción?',
    'subscription.basic': 'Plan Básico',
    'subscription.advanced': 'Plan Avanzado',
    
    // Settings tabs
    'settings.general': 'General',
    'settings.menu': 'Menú',
    'settings.reviews': 'Reseñas',
    'settings.team': 'Equipo',
    'settings.appearance': 'Apariencia',
    'settings.contact': 'Contacto',
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'es'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}