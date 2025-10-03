import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DomainProgressStepperProps {
  domainAdded: boolean;
  dnsConfigured: boolean;
  sslActive: boolean;
  domainActive: boolean;
}

interface StepProps {
  label: string;
  completed: boolean;
  active: boolean;
  isLast?: boolean;
}

const Step = ({ label, completed, active, isLast }: StepProps) => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
          completed ? "bg-primary border-primary text-primary-foreground" : 
          active ? "border-primary text-primary" : 
          "border-muted text-muted-foreground"
        )}>
          {completed ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : active ? (
            <Clock className="h-4 w-4 animate-pulse" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </div>
        <span className={cn(
          "text-xs mt-2 text-center max-w-[100px]",
          completed ? "text-primary font-medium" :
          active ? "text-foreground" :
          "text-muted-foreground"
        )}>
          {label}
        </span>
      </div>
      {!isLast && (
        <div className={cn(
          "h-0.5 w-16 mx-2 transition-colors",
          completed ? "bg-primary" : "bg-muted"
        )} />
      )}
    </div>
  );
};

export const DomainProgressStepper = ({
  domainAdded,
  dnsConfigured,
  sslActive,
  domainActive
}: DomainProgressStepperProps) => {
  return (
    <div className="flex items-center justify-center py-6">
      <Step 
        label="Dominio Agregado" 
        completed={domainAdded} 
        active={!domainAdded}
      />
      <Step 
        label="DNS Configurado" 
        completed={dnsConfigured} 
        active={domainAdded && !dnsConfigured}
      />
      <Step 
        label="SSL Activo" 
        completed={sslActive} 
        active={dnsConfigured && !sslActive}
      />
      <Step 
        label="Dominio Activo" 
        completed={domainActive} 
        active={sslActive && !domainActive}
        isLast
      />
    </div>
  );
};
