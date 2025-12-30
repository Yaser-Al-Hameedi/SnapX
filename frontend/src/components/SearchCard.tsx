"use client";
import { useState } from "react";

export default function SearchCard() {
  const [textQuery, setTextQuery] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [searching, setSearching] = useState(false);

  async function handleSearch() {
    setSearching(true);
    
    const params = new URLSearchParams();
    if (textQuery) params.append("text_query", textQuery);
    if (vendorName) params.append("vendor_name", vendorName);
    if (documentType) params.append("document_type", documentType);
    if (dateFrom) params.append("date_from", dateFrom);
    if (dateTo) params.append("date_to", dateTo);
    if (amountMin) params.append("amount_min", amountMin);
    if (amountMax) params.append("amount_max", amountMax);

    try {
      // Redirect to documents page with search params
      window.location.href = `/documents?${params}`;
    } catch (error) {
      alert("Search error: " + error);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold mb-3">Quick search</h2>
      
      <input
        type="text"
        placeholder="Search text..."
        value={textQuery}
        onChange={(e) => setTextQuery(e.target.value)}
        className="input w-full"
      />

      <input
        type="text"
        placeholder="Vendor name..."
        value={vendorName}
        onChange={(e) => setVendorName(e.target.value)}
        className="input w-full"
      />

      <select
        value={documentType}
        onChange={(e) => setDocumentType(e.target.value)}
        className="input w-full"
      >
        <option value="">All types</option>
        <option value="receipt">Receipt</option>
        <option value="bill">Bill</option>
        <option value="invoice">Invoice</option>
        <option value="statement">Statement</option>
      </select>

      <div className="space-y-2">
        <p className="text-sm text-slate-600">Date Range</p>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="input w-full"
          placeholder="From"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="input w-full"
          placeholder="To"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm text-slate-600">Amount Range</p>
        <input
          type="number"
          placeholder="Min amount"
          value={amountMin}
          onChange={(e) => setAmountMin(e.target.value)}
          className="input w-full"
        />
        <input
          type="number"
          placeholder="Max amount"
          value={amountMax}
          onChange={(e) => setAmountMax(e.target.value)}
          className="input w-full"
        />
      </div>

      <button 
        onClick={handleSearch}
        disabled={searching}
        className="btn btn-primary w-full"
      >
        {searching ? "Searching..." : "Search"}
      </button>
    </div>
  );
}