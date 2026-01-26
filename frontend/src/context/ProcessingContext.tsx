"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface ProcessingContextType {
  processing: boolean;
  processedCount: number;
  totalFiles: number;
  taskIds: string[];
  startProcessing: (ids: string[]) => void;
}

const ProcessingContext = createContext<ProcessingContextType | undefined>(undefined);

export function ProcessingProvider({ children }: { children: React.ReactNode }) {
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [taskIds, setTaskIds] = useState<string[]>([]);

  const startProcessing = (ids: string[]) => {
    setTaskIds(ids);
    setTotalFiles(ids.length);
    setProcessing(true);
    setProcessedCount(0);
  };

  // Poll for task status updates
  useEffect(() => {
    if (!processing || taskIds.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskIds),
        });

        if (response.ok) {
          const data = await response.json();
          const successCount = data.tasks.filter((task: { status: string }) => task.status === "SUCCESS").length;
          setProcessedCount(successCount);

          // Stop polling when all tasks are complete
          if (successCount === totalFiles) {
            clearInterval(interval);

            // Keep toast visible for 5 seconds after completion
            setTimeout(() => {
              setProcessing(false);
            }, 5000);
          }
        }
      } catch (error) {
        console.error("Failed to check status:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [processing, taskIds, totalFiles]);

  return (
    <ProcessingContext.Provider value={{ processing, processedCount, totalFiles, taskIds, startProcessing }}>
      {children}

      {/* Global Toast notification - bottom right */}
      {processing && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-6 py-4 rounded-lg shadow-lg z-50">
          <p className="font-medium">Processing files...</p>
          <p className="text-sm mt-1">
            {processedCount}/{totalFiles} complete
          </p>
        </div>
      )}
    </ProcessingContext.Provider>
  );
}

export function useProcessing() {
  const context = useContext(ProcessingContext);
  if (context === undefined) {
    throw new Error("useProcessing must be used within a ProcessingProvider");
  }
  return context;
}
