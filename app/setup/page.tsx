import { Suspense } from "react";
import { SetupApp } from "@/components/setup/setup-app";

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="k-page py-20 text-center text-sm k-text-muted">…</div>
      }
    >
      <SetupApp />
    </Suspense>
  );
}
