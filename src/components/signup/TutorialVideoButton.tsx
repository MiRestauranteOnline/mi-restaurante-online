import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { tutorialVideos, TutorialStep } from "@/config/tutorialVideos";

interface TutorialVideoButtonProps {
  step: TutorialStep;
}

export const TutorialVideoButton = ({ step }: TutorialVideoButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const videoUrl = tutorialVideos[step];

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg gap-2 px-6 py-6 text-base"
        size="lg"
      >
        <HelpCircle className="h-5 w-5" />
        ¿No estás seguro? Mira este video
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Tutorial - Paso {step.replace('step', '')}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={videoUrl}
              title="Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
