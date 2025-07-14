import React from "react";

export interface Transaction {
  id: number;
  createdAt: string | Date;
  amount_in_cents: number;
  description: string;
  label: string;
}

interface TransactionsProps {
  transactions: Transaction[];
  onCreateTransaction: () => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, onCreateTransaction }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Transactions</h3>
        <button
          onClick={onCreateTransaction}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          + Add Transaction
        </button>
      </div>
      {transactions.length === 0 ? (
        <p className="italic text-gray-500">No transactions.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-1 text-left">#</th>
                <th className="border px-3 py-1 text-left">Date</th>
                <th className="border px-3 py-1 text-left">Description</th>
                <th className="border px-3 py-1 text-left">Label</th>
                <th className="border px-3 py-1 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={t.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border px-3 py-1">{i + 1}</td>
                  <td className="border px-3 py-1">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="border px-3 py-1">{t.description || "No description"}</td>
                  <td className="border px-3 py-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {t.label}
                    </span>
                  </td>
                  <td className="border px-3 py-1 text-right">
                    <span
                      className={`font-semibold ${t.amount_in_cents >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${Math.abs(t.amount_in_cents / 100).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
