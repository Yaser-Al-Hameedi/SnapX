type Doc = {
  id: string;
  date: string;
  type: "receipt" | "invoice";
  amount: string; // ex: "$45.20"
};

const MOCK_RECENT: Doc[] = [
  { id: "1", date: "2025-09-27", type: "receipt", amount: "$32.11" },
  { id: "2", date: "2025-09-26", type: "invoice", amount: "$410.00" },
  { id: "3", date: "2025-09-25", type: "receipt", amount: "$7.89" },
];

export default function RecentList() {
  return (
    <section>
      <h2 className="text-lg font-semibold mb-3">Recent documents</h2>
      <ul className="space-y-3">
        {MOCK_RECENT.map(d => (
          <li
            key={d.id}
            className="flex items-center justify-between rounded-xl border p-3"
          >
            <div className="text-sm">
              <div className="font-medium">{d.type}</div>
              <div className="text-slate-600">{d.date}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{d.amount}</span>
              <button className="text-sm underline">View</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
