import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";

interface MultiLocationInputProps {
  locations: string[];
  onChange: (locations: string[]) => void;
  placeholder?: string;
  label?: string;
  useTextarea?: boolean;
}

export const MultiLocationInput = ({ 
  locations, 
  onChange, 
  placeholder = "Ej: Av. Principal 123, Distrito, Ciudad",
  useTextarea = false 
}: MultiLocationInputProps) => {
  
  const handleAddLocation = () => {
    onChange([...locations, ""]);
  };

  const handleRemoveLocation = (index: number) => {
    // Never remove the first location (index 0)
    if (index === 0) return;
    
    const newLocations = locations.filter((_, i) => i !== index);
    onChange(newLocations);
  };

  const handleLocationChange = (index: number, value: string) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    onChange(newLocations);
  };

  return (
    <div className="space-y-3">
      {locations.map((location, index) => (
        <div key={index} className="flex gap-2 items-start">
          {useTextarea ? (
            <Textarea
              value={location}
              onChange={(e) => handleLocationChange(index, e.target.value)}
              placeholder={`${placeholder} ${locations.length > 1 ? `(Ubicación ${index + 1})` : ''}`}
              className="resize-none flex-1"
              rows={3}
            />
          ) : (
            <Input
              value={location}
              onChange={(e) => handleLocationChange(index, e.target.value)}
              placeholder={`${placeholder} ${locations.length > 1 ? `(Ubicación ${index + 1})` : ''}`}
              className="flex-1"
            />
          )}
          {index > 0 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleRemoveLocation(index)}
              className="shrink-0"
              title="Eliminar ubicación"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))
      }
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddLocation}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Agregar otra ubicación
      </Button>
    </div>
  );
};

