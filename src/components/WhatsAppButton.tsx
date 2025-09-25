import { MessageCircle } from "lucide-react";
import { businessData } from "@/config/businessData";

export const WhatsAppButton = () => {
  const handleClick = () => {
    window.open(`${businessData.contact.whatsapp.url}?text=${encodeURIComponent(businessData.contact.whatsapp.message)}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={handleClick}
        className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 animate-pulse-accent"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      
      {/* Tooltip */}
      <div className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-foreground text-background px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        ¡Conversemos por WhatsApp!
      </div>
    </div>
  );
};