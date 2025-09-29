"use client";
import { useRef, useState } from "react";

export default function UploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function onPick() { inputRef.current?.click(); }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setPreview(URL.createObjectURL(f));
  }

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Upload</h2>
      <p className="text-sm text-slate-600 mb-4">
        Choose a file (desktop) or open camera (phone).
      </p>
      <div className="flex items-center gap-3">
        <button onClick={onPick} className="btn btn-primary">Select / Take Photo</button>
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
        </div>
      )}
    </>
  );
}
