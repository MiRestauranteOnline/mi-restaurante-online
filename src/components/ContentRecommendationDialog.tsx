import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ContentRecommendationDialogProps {
  isOpen: boolean;
  onContinue: () => void;
  onKeepAdding: () => void;
  remainingItems: number;
  remainingReviews: number;
  remainingTeamMembers: number;
}

export const ContentRecommendationDialog = ({ 
  isOpen, 
  onContinue, 
  onKeepAdding, 
  remainingItems, 
  remainingReviews, 
  remainingTeamMembers 
}: ContentRecommendationDialogProps) => {
  const hasRecommendations = remainingItems > 0 || remainingReviews > 0 || remainingTeamMembers > 0;

  if (!hasRecommendations) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={() => {}}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Recomendamos agregar más contenido
          </AlertDialogTitle>
          <AlertDialogDescription>
            Para tener un sitio web más completo y atractivo, te recomendamos agregar:
            <ul className="mt-2 space-y-1 text-sm">
              {remainingItems > 0 && (
                <li>• {remainingItems} {remainingItems === 1 ? 'plato más' : 'platos más'} al menú</li>
              )}
              {remainingReviews > 0 && (
                <li>• {remainingReviews} {remainingReviews === 1 ? 'reseña más' : 'reseñas más'}</li>
              )}
              {remainingTeamMembers > 0 && (
                <li>• {remainingTeamMembers} {remainingTeamMembers === 1 ? 'miembro más' : 'miembros más'} del equipo</li>
              )}
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onKeepAdding}>
            Seguir agregando
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue}>
            Omitir por ahora
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};