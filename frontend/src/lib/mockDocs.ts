export type Doc = {
  id: string;
  date: string;             // "YYYY-MM-DD"
  type: "receipt" | "invoice";
  amount: string;
  vendor?: string;
};

export const DOCS: Doc[] = [
  { id: "1", date: "2025-09-27", type: "receipt", amount: "$32.11", vendor: "Store ABC" },
  { id: "2", date: "2025-09-26", type: "invoice", amount: "$410.00", vendor: "Supplier XYZ" },
  { id: "3", date: "2025-09-25", type: "receipt", amount: "$7.89",  vendor: "Coffee Hut" },
  { id: "4", date: "2025-09-24", type: "receipt", amount: "$18.40", vendor: "Snacks&Co" },
  { id: "5", date: "2025-09-23", type: "invoice", amount: "$212.55", vendor: "Fuel Dist." },
];