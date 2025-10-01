import { CouponManagement as CouponManagementComponent } from "@/components/admin/CouponManagement";

export default function CouponManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Cupones</h1>
        <p className="text-muted-foreground">
          Crea y administra cupones de descuento para tus clientes
        </p>
      </div>
      <CouponManagementComponent />
    </div>
  );
}
