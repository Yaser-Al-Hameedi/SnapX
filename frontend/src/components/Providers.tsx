"use client";
import { ProcessingProvider } from "@/context/ProcessingContext";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProcessingProvider>{children}</ProcessingProvider>
    </AuthProvider>
  );
}
