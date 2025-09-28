import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface UserWarningOverlayProps {
  isOpen: boolean;
  onConfirm: () => void;
  tabName: string;
}

export function UserWarningOverlay({ isOpen, onConfirm, tabName }: UserWarningOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex justify-center pt-4">
      <div className="bg-white border border-border rounded-lg shadow-lg p-6 max-w-md mx-4 h-fit">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h3 className="text-lg font-semibold">Advertencia Importante</h3>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Al continuar con la pestaña de <strong>{tabName}</strong>, debes tener en cuenta que:
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-2">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              • Cualquier error que cometas se mostrará inmediatamente en tu sitio web
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              • Los cambios en textos pueden afectar el rendimiento SEO
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              • Los cambios en colores y diseño afectarán la apariencia de tu sitio
            </p>
          </div>
          
          <p className="text-sm font-medium">
            Al hacer clic en "Confirmar" acepto que los cambios que realice son bajo mi propia responsabilidad.
          </p>
          
          <Button onClick={onConfirm} className="w-full">
            Confirmar y Continuar
          </Button>
        </div>
      </div>
    </div>
  );
}