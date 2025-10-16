import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export interface BillingInfo {
  documentType: 'boleta' | 'factura';
  dni?: string;
  ruc?: string;
  businessName?: string;
  fiscalAddress?: string;
}

interface BillingInfoFormProps {
  billingInfo: BillingInfo;
  onChange: (info: BillingInfo) => void;
  errors?: {
    dni?: string;
    ruc?: string;
    businessName?: string;
    fiscalAddress?: string;
  };
}

export const BillingInfoForm = ({ billingInfo, onChange, errors }: BillingInfoFormProps) => {
  const handleDocumentTypeChange = (value: 'boleta' | 'factura') => {
    onChange({
      ...billingInfo,
      documentType: value,
      // Clear fields when switching types
      dni: value === 'boleta' ? billingInfo.dni : undefined,
      ruc: value === 'factura' ? billingInfo.ruc : undefined,
      businessName: value === 'factura' ? billingInfo.businessName : undefined,
      fiscalAddress: value === 'factura' ? billingInfo.fiscalAddress : undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Información de Facturación</h3>
        
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium mb-3 block">
              Tipo de Comprobante
            </Label>
            <RadioGroup
              value={billingInfo.documentType}
              onValueChange={handleDocumentTypeChange}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="boleta" id="boleta" />
                <Label htmlFor="boleta" className="cursor-pointer font-normal">
                  Boleta
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="factura" id="factura" />
                <Label htmlFor="factura" className="cursor-pointer font-normal">
                  Factura
                </Label>
              </div>
            </RadioGroup>
          </div>

          {billingInfo.documentType === 'boleta' && (
            <>
              <div>
                <Label htmlFor="dni">
                  DNI (Opcional)
                </Label>
                <Input
                  id="dni"
                  type="text"
                  placeholder="12345678"
                  maxLength={8}
                  value={billingInfo.dni || ''}
                  onChange={(e) => onChange({ ...billingInfo, dni: e.target.value })}
                  className={errors?.dni ? 'border-red-500' : ''}
                />
                {errors?.dni && (
                  <p className="text-sm text-red-500 mt-1">{errors.dni}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  El DNI es opcional pero recomendado para mayor seguridad
                </p>
              </div>
            </>
          )}

          {billingInfo.documentType === 'factura' && (
            <>
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  Para emitir facturas necesitamos los datos de su empresa
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="ruc">
                  RUC <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ruc"
                  type="text"
                  placeholder="20123456789"
                  maxLength={11}
                  value={billingInfo.ruc || ''}
                  onChange={(e) => onChange({ ...billingInfo, ruc: e.target.value })}
                  className={errors?.ruc ? 'border-red-500' : ''}
                  required
                />
                {errors?.ruc && (
                  <p className="text-sm text-red-500 mt-1">{errors.ruc}</p>
                )}
              </div>

              <div>
                <Label htmlFor="businessName">
                  Razón Social <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Nombre de su empresa"
                  value={billingInfo.businessName || ''}
                  onChange={(e) => onChange({ ...billingInfo, businessName: e.target.value })}
                  className={errors?.businessName ? 'border-red-500' : ''}
                  required
                />
                {errors?.businessName && (
                  <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
                )}
              </div>

              <div>
                <Label htmlFor="fiscalAddress">
                  Dirección Fiscal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fiscalAddress"
                  type="text"
                  placeholder="Dirección completa de su empresa"
                  value={billingInfo.fiscalAddress || ''}
                  onChange={(e) => onChange({ ...billingInfo, fiscalAddress: e.target.value })}
                  className={errors?.fiscalAddress ? 'border-red-500' : ''}
                  required
                />
                {errors?.fiscalAddress && (
                  <p className="text-sm text-red-500 mt-1">{errors.fiscalAddress}</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};