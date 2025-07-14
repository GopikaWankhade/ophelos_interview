"use client";

import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import Transactions, { Transaction } from "./Transactions";

interface Statement {
  id: number;
  name: string;
  createdAt: Date;
  transactions: Transaction[];
}

export default function StatementsPage() {
  const router = useRouter();

  const [statements, setStatements] = useState<Statement[]>([]);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    apiFetch<Statement[]>("statements")
      .then((data) => setStatements(data))
      .catch(() => router.push("/login"));
  }, [router]);

  async function handleAddStatement(event: FormEvent) {
    event.preventDefault();
    const name = newName.trim();

    if (!name) return;

    setIsLoading(true);
    try {
      const createdStatement = await apiFetch<Statement>("statements", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      setStatements((prev) => [createdStatement, ...prev]);
      setNewName("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateTransaction = (statementId: number) => {
    // Placeholder for opening a modal or navigating to a transaction creation form
    alert(`Create transaction for statement ID: ${statementId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Financial Statements</h1>
          <p className="text-gray-600">
            Track your income and expenses across different statements
          </p>
        </div>

        {/* Add Statement Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Statement</h2>
          <form onSubmit={handleAddStatement} className="flex gap-4">
            <input
              type="text"
              placeholder="Enter statement name (e.g., 'Monthly Budget', 'Vacation Fund')"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="submit"
              disabled={isLoading || !newName.trim()}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </div>
              ) : (
                "Create Statement"
              )}
            </button>
          </form>
        </div>

        {/* Statements List */}
        {Array.isArray(statements) && statements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Statements Yet</h3>
            <p className="text-gray-600">
              Create your first statement to start tracking your finances
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {statements.map((statement) => (
              <div key={statement.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Statement Header */}
                <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-white">{statement.name}</h2>
                      <p className="text-blue-100 text-sm">
                        Created{" "}
                        {new Date(statement.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {statement.transactions.length} transaction
                        {statement.transactions.length !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Component */}
                <div className="p-6">
                  <Transactions
                    transactions={statement.transactions}
                    onCreateTransaction={() => handleCreateTransaction(statement.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
