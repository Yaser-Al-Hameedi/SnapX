"use client";
import { useRef, useState } from "react";

export default function UploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  function onPick() { inputRef.current?.click(); }
  
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; 
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setSuccess(false);
  }

  async function handleUpload() {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSuccess(true);
        alert("Document uploaded successfully!");
      } else {
        alert("Upload failed");
      }
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
        Choose a file (desktop) or open camera (phone).
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
        />
      </div>
      {preview && (
        <div className="mt-4">
          <p className="text-sm text-slate-600 mb-2">Preview</p>
          <img src={preview} alt="preview" className="max-h-72 rounded-xl border" />
          <button 
            onClick={handleUpload} 
            disabled={uploading}
            className="btn btn-primary mt-4"
          >
            {uploading ? "Uploading..." : "Upload Document"}
          </button>
          {success && <p className="text-green-600 mt-2">✓ Uploaded!</p>}
        </div>
      )}
    </>
  );
}