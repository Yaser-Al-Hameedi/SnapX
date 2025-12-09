"use client";
import { ProcessingProvider } from "@/context/ProcessingContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ProcessingProvider>{children}</ProcessingProvider>;
}
