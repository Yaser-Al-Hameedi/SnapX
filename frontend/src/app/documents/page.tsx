"use client";
import { useEffect, useState } from "react";
import DocumentModal from "@/components/DocumentModal";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Document {
  id: string;
  vendor_name?: string;
  document_type: string;
  total_amount: number;
  document_date: string;
  file_path: string;
  [key: string]: unknown;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  
  const [textQuery, setTextQuery] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");

  async function fetchDocuments() {
    setLoading(true);

    const params = new URLSearchParams();
    if (textQuery) params.append("text_query", textQuery);
    if (vendorName) params.append("vendor_name", vendorName);
    if (documentType) params.append("document_type", documentType);
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);
    if (amountMin) params.append("amount_min", amountMin);
    if (amountMax) params.append("amount_max", amountMax);

    try {
      // Get user's auth token
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error("No auth token");
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleDocumentUpdate(updatedDoc: Document) {
    setDocuments(docs =>
      docs.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc)
    );
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <ProtectedRoute>
      <main className="container py-8 space-y-6">
        <h1 className="text-xl font-semibold">Documents</h1>

      {/* Search Filters */}
      <div className="card p-6 space-y-4">
        <h2 className="font-semibold">Search & Filter</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search text..."
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
            className="input"
          />

          <input
            type="text"
            placeholder="Vendor name..."
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="input"
          />

          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="input"
          >
            <option value="">All types</option>
            <option value="receipt">Receipt</option>
            <option value="bill">Bill</option>
            <option value="invoice">Invoice</option>
            <option value="statement">Statement</option>
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              className="input"
            />
            <input
              type="number"
              placeholder="Max $"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input w-full"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-1 block">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        <button 
          onClick={fetchDocuments}
          className="btn btn-primary"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="card p-6 text-center">Loading...</div>
      ) : documents.length === 0 ? (
        <div className="card p-6 text-center text-slate-500">
          No documents found.
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{documents.length} document(s) found</p>
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="card p-6 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Vendor</p>
                  <p className="font-semibold">{doc.vendor_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Type</p>
                  <p className="font-semibold">{doc.document_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Amount</p>
                  <p className="font-semibold">${doc.total_amount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-semibold">{doc.document_date}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedDoc && (
        <DocumentModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onSave={handleDocumentUpdate}
        />
      )}
      </main>
    </ProtectedRoute>
  );
}