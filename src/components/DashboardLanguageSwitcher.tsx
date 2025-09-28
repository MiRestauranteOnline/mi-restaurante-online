import { Button } from "@/components/ui/button";
import { useDashboardLanguage } from "@/contexts/DashboardLanguageContext";
import { Globe } from "lucide-react";

export const DashboardLanguageSwitcher = () => {
  const { language, setLanguage } = useDashboardLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2"
    >
      <Globe className="h-4 w-4" />
      {language === 'es' ? 'EN' : 'ES'}
    </Button>
  );
};