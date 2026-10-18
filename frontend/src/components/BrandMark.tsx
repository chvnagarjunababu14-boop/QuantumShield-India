import { Shield } from "@phosphor-icons/react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <Shield size={24} weight="regular" aria-hidden="true" className="text-action" />
      <p className="font-heading text-base font-semibold tracking-tight whitespace-nowrap sm:text-lg">QuantumShield India</p>
    </div>
  );
}
