"use client";
import { useRef, useState } from "react";
import { useProcessing } from "@/context/ProcessingContext";
import { supabase } from "@/lib/supabase";
import ErrorModal from "./ErrorModal";

export default function UploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const MAX_FILES = 10
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { startProcessing } = useProcessing();

  function onPick() { inputRef.current?.click(); }
  
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || []); // Array of selected files
    if (selectedFiles.length === 0) return;

    const fileAmount = files.length + selectedFiles.length // Grabbing length of all selected files before adding more
    if (fileAmount <= MAX_FILES){ // Adding files as long as combined file amount <= 10
    const combinedFiles = [...files, ...selectedFiles]

    setFiles(combinedFiles);

    // Create thumbnails for each file
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    const combinedPreviews = [...previews, ...newPreviews] // Making sure all files preview
    setPreviews(combinedPreviews);
    }else{
      setErrorMessage("Maximum 10 files allowed")
    }
  }

  async function handleUpload() {
    if (files.length === 0) return;

    setUploading(true);

    try {
      // Get user's auth token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        setErrorMessage("You must be logged in to upload files");
        setUploading(false);
        return;
      }

      // Track task IDs as they complete
      const taskIds: string[] = [];

      // Create an array of upload promises (one for each file)
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || `Failed to upload ${file.name}`);
        }

        const result = await response.json();

        // Add task ID and update processing status immediately
        taskIds.push(result.task_id);
        startProcessing([...taskIds]);

        return result;
      });

      // Wait for ALL uploads to complete in parallel
      await Promise.all(uploadPromises);

      // Clear files and previews after successful upload
      setFiles([]);
      setPreviews([]);
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      <h2 className="text-lg font-semibold mb-2">Upload</h2>
      <p className="text-sm text-slate-600 mb-4">
        Choose files (desktop) or open camera (phone).
      </p>
      <div className="flex items-center gap-3">
        <button onClick={onPick} className="btn btn-primary">
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={onChange}
          multiple
        />
      </div>

      {/* Thumbnails */}
      {previews.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-slate-600 mb-2">{files.length} file(s) selected</p>
          <div className="flex gap-2 flex-wrap">
            {previews.map((preview, i) => (
              files[i].type === 'application/pdf' ? (
                <div key={i} className="h-20 w-20 border rounded bg-slate-100 flex items-center justify-center">
                  <span className="text-xs text-slate-600">PDF</span>
                </div>
              ) : (
                <img
                  key={i}
                  src={preview}
                  alt={`preview ${i}`}
                  className="h-20 w-20 object-cover rounded border"
                />
              )
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="btn btn-primary mt-4"
          >
            {uploading ? "Uploading..." : `Upload ${files.length} Document(s)`}
          </button>
        </div>
      )}
    </>
  );
}