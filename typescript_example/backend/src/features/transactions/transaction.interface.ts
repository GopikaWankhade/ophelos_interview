export interface TransactionItem {
  type: "Income" | "Expenditure";
  amount_in_cents: number;
  label: string;
  description?: string;
}
