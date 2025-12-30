"use client";
import { useRef, useState } from "react";
import { useProcessing } from "@/context/ProcessingContext";
import { supabase } from "@/lib/supabase";

export default function UploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const MAX_FILES = 10
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    setSuccess(false);
    }else{
      alert("Maximum 10 files allowed")
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
        alert("You must be logged in to upload files");
        setUploading(false);
        return;
      }

      // Create an array of upload promises (one for each file)
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        return response.json();
      });

      // Wait for ALL uploads to complete in parallel
      const results = await Promise.all(uploadPromises);

      // Extract task_ids from results and start global processing
      const ids = results.map(result => result.task_id);
      startProcessing(ids);

      setSuccess(true);
    } catch (error) {
      alert("Upload error: " + error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
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
          capture="environment"
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
          {success && <p className="text-green-600 mt-2">✓ Uploaded!</p>}
        </div>
      )}
    </>
  );
}