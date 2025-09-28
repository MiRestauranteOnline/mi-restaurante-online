import * as React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countryCodes, CountryCode } from "@/data/countryCodes";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

export const PhoneInput = React.forwardRef<HTMLDivElement, PhoneInputProps>(
  ({ 
    countryCode, 
    phoneNumber, 
    onCountryCodeChange, 
    onPhoneNumberChange, 
    placeholder = "123 456 789",
    className,
    maxLength = 15
  }, ref) => {
    
    const validatePhoneNumber = (value: string) => {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to maxLength digits
      if (digitsOnly.length > maxLength) {
        return digitsOnly.slice(0, maxLength);
      }
      
      return digitsOnly;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const validatedNumber = validatePhoneNumber(e.target.value);
      onPhoneNumberChange(validatedNumber);
    };

    return (
      <div ref={ref} className={cn("flex gap-2", className)}>
        <Select value={countryCode} onValueChange={onCountryCodeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue>
              {countryCodes.find(c => c.code === countryCode)?.flag} {countryCode}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-background border border-border shadow-lg z-50">
            {countryCodes.map((country) => (
              <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                <span className="flex items-center gap-2">
                  {country.flag} {country.code} {country.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          maxLength={maxLength}
          className="flex-1"
        />
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";