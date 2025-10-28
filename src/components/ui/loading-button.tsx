import { useState, useEffect } from "react";
import { Button, ButtonProps } from "./button";
import { Progress } from "./progress";
import { Loader2 } from "lucide-react";

interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean;
  statusMessages?: string[];
  statusInterval?: number;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingButton = ({
  isLoading,
  statusMessages = [],
  statusInterval = 2000,
  loadingText = "Procesando...",
  children,
  className = "",
  ...props
}: LoadingButtonProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!isLoading || statusMessages.length === 0) {
      setCurrentMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => {
        const next = prev + 1;
        return next >= statusMessages.length ? prev : next;
      });
    }, statusInterval);

    return () => clearInterval(interval);
  }, [isLoading, statusMessages.length, statusInterval]);

  const currentMessage = statusMessages.length > 0
    ? statusMessages[currentMessageIndex]
    : loadingText;

  return (
    <div className="w-full space-y-2">
      <Button
        className={`w-full ${className}`}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {currentMessage}
          </div>
        ) : (
          children
        )}
      </Button>
      {isLoading && (
        <div className="space-y-1">
          <Progress value={undefined} className="h-1" />
          {statusMessages.length > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Paso {currentMessageIndex + 1} de {statusMessages.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
