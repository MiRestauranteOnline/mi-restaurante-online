import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface UserWarningOverlayProps {
  isOpen: boolean;
  onConfirm: () => void;
  tabName: string;
}

export function UserWarningOverlay({ isOpen, onConfirm, tabName }: UserWarningOverlayProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]" onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Advertencia Importante
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-center space-y-3">
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
          </div>
          <div className="flex justify-center">
            <Button onClick={onConfirm} className="w-full">
              Confirmar y Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}