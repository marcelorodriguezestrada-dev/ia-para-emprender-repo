import { Suspense } from "react";
import PagoInfo from "@/components/PagoInfo";

export default function PagoPage() {
  return (
    <Suspense fallback={null}>
      <PagoInfo />
    </Suspense>
  );
}
