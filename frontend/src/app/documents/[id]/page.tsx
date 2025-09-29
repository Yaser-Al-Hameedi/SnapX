type Doc = {
  id: string;
  date: string;
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

export default function DocumentDetail({ params }: { params: { id: string } }) {
  const doc = DOCS.find(d => d.id === params.id);

  if (!doc) {
    return (
      <main className="container py-8">
        <div className="card p-6">
          <p className="text-sm">Document not found.</p>
          <a className="underline text-sm mt-2 inline-block" href="/documents">Back to documents</a>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8 space-y-6">
      <a className="underline text-sm" href="/documents">← Back to documents</a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: image placeholder */}
        <div className="card p-6 flex items-center justify-center">
          <div className="w-full aspect-[3/4] rounded-lg border border-dashed grid place-items-center text-slate-500">
            Image preview
          </div>
        </div>

        {/* Right: fields */}
        <div className="card p-6 space-y-3 text-sm">
          <h1 className="text-lg font-semibold">Document details</h1>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-slate-600">Type</div><div className="col-span-2">{doc.type}</div>
            <div className="text-slate-600">Date</div><div className="col-span-2">{doc.date}</div>
            <div className="text-slate-600">Amount</div><div className="col-span-2">{doc.amount}</div>
            <div className="text-slate-600">Vendor</div><div className="col-span-2">{doc.vendor ?? "-"}</div>
          </div>
          <button className="btn btn-primary mt-2 w-fit">Edit (stub)</button>
        </div>
      </div>
    </main>
  );
}
