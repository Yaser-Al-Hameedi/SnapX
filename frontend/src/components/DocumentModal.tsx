"use client";
import { useState } from "react";

interface Document {
  id: string;
  vendor_name?: string;
  document_date: string;
  total_amount: number;
  document_type: string;
  file_path: string;
  [key: string]: unknown;
}

interface DocumentModalProps {
  document: Document;
  onClose: () => void;
  onSave: (updatedDoc: Document) => void;
}

export default function DocumentModal({ document, onClose, onSave }: DocumentModalProps) {
  console.log("file_path:", document.file_path);  // Add this line
  console.log("ends with .pdf?", document.file_path.toLowerCase().endsWith('.pdf'));  // And this
  const [vendorName, setVendorName] = useState(document.vendor_name || "");
  const [documentDate, setDocumentDate] = useState(document.document_date || "");
  const [totalAmount, setTotalAmount] = useState(document.total_amount?.toString() || "");
  const [documentType, setDocumentType] = useState(document.document_type || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/documents/${document.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendor_name: vendorName,
          document_date: documentDate,
          total_amount: parseFloat(totalAmount),
          document_type: documentType
        })
      });

      if (response.ok) {
        const updated = await response.json();
        onSave(updated);
        alert("Document updated!");
        onClose();
      } else {
        alert("Failed to update");
      }
    } catch (error) {
      alert("Error: " + error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Document Details</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
<div>
  <h3 className="font-semibold mb-2">Preview</h3>
  {document.file_path.toLowerCase().includes('.pdf') ? (
    <div className="border rounded p-8 text-center">
      <p className="text-slate-600 mb-4">PDF Document</p>
      <a 
        href={document.file_path} 
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary"
      >
        Open PDF
      </a>
    </div>
  ) : (
    <img 
      src={document.file_path} 
      alt="Document" 
      className="w-full border rounded"
    />
  )}
</div>

          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vendor Name</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Document Date</label>
              <input
                type="date"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Amount</label>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="input w-full"
              >
                <option value="receipt">Receipt</option>
                <option value="bill">Bill</option>
                <option value="invoice">Invoice</option>
                <option value="statement">Statement</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex-1"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={onClose} className="btn flex-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}