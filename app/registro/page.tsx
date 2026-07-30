import { Suspense } from "react";
import RegistroForm from "@/components/RegistroForm";

export default function RegistroPage() {
  return (
    <Suspense fallback={null}>
      <RegistroForm />
    </Suspense>
  );
}
