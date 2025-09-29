"use client";

import { useMemo, useState } from "react";

type Doc = {
  id: string;
  date: string; // "YYYY-MM-DD"
  type: "receipt" | "invoice";
  amount: string;
  vendor?: string;
};

const DOCS: Doc[] = [
  { id: "1", date: "2025-09-27", type: "receipt", amount: "$32.11", vendor: "Store ABC" },
  { id: "2", date: "2025-09-26", type: "invoice", amount: "$410.00", vendor: "Supplier XYZ" },
  { id: "3", date: "2025-09-25", type: "receipt", amount: "$7.89", vendor: "Coffee Hut" },
  { id: "4", date: "2025-09-24", type: "receipt", amount: "$18.40", vendor: "Snacks&Co" },
  { id: "5", date: "2025-09-23", type: "invoice", amount: "$212.55", vendor: "Fuel Dist." },
];

export default function DocumentsPage() {
  // search state
  const [q, setQ] = useState("");
  const [mm, setMM] = useState<string>("");
  const [dd, setDD] = useState<string>("");
  const [yyyy, setYYYY] = useState<string>("");
  const [docType, setDocType] = useState<"all" | Doc["type"]>("all");

  const filtered = useMemo(() => {
    return DOCS.filter((d) => {
      // type filter
      if (docType !== "all" && d.type !== docType) return false;

      // date-part filters (allow partial)
      const [y, m, day] = d.date.split("-"); // "YYYY","MM","DD"
      if (mm && m !== String(mm).padStart(2, "0")) return false;
      if (dd && day !== String(dd).padStart(2, "0")) return false;
      if (yyyy && y !== yyyy) return false;

      // text search across simple fields
      if (q) {
        const hay = `${d.type} ${d.amount} ${d.vendor ?? ""} ${d.date}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }

      return true;
    });
  }, [docType, mm, dd, yyyy, q]);

  return (
    <main className="container py-8 space-y-6">
      <h1 className="text-xl font-semibold">Documents</h1>

      {/* Search bar */}
      <div className="card p-4">
        <form
          className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="md:col-span-4">
            <label className="block text-xs text-slate-600 mb-1">Search text</label>
            <input
              className="input"
              placeholder="vendor, amount, etc."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 mb-1">Month (MM)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={12}
              placeholder="MM"
              value={mm}
              onChange={(e) => setMM(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 mb-1">Day (DD)</label>
            <input
              className="input"
              type="number"
              min={1}
              max={31}
              placeholder="DD"
              value={dd}
              onChange={(e) => setDD(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 mb-1">Year (YYYY)</label>
            <input
              className="input"
              type="number"
              min={1900}
              max={2100}
              placeholder="YYYY"
              value={yyyy}
              onChange={(e) => setYYYY(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 mb-1">Type</label>
            <select
              className="input"
              value={docType}
              onChange={(e) => setDocType(e.target.value as any)}
            >
              <option value="all">All types</option>
              <option value="receipt">receipt</option>
              <option value="invoice">invoice</option>
            </select>
          </div>
        </form>
      </div>

      {/* Results table */}
      <div className="card p-4">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="py-2">Type</th>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="py-3">{d.type}</td>
                  <td className="py-3">{d.date}</td>
                  <td className="py-3">{d.amount}</td>
                  <td className="py-3">
                    <a className="underline" href={`/documents/${d.id}`}>
                      View
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500">
                    No documents match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="md:hidden space-y-3">
          {filtered.map((d) => (
            <li key={d.id} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{d.type}</div>
                  <div className="text-slate-600">{d.date}</div>
                </div>
                <div className="text-sm font-semibold">{d.amount}</div>
              </div>
              <div className="mt-2">
                <a className="underline text-sm" href={`/documents/${d.id}`}>
                  View
                </a>
              </div>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-center text-slate-500 py-6">No documents.</li>
          )}
        </ul>
      </div>
    </main>
  );
}
