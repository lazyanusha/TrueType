import { useState, useEffect } from "react";

interface Payment {
  id: number;
  user_id: number;
  plan_id: number;
  amount: number;
  date: string;
  created_at: string;
  full_name: string;
  email?: string;
  plan_name: string;
}

export default function Payments() {
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPayments() {
      const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
      try {
        const res = await fetch("http://localhost:8000/payments/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);

        const data: Payment[] = await res.json();
        setPayments(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.email?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
    p.plan_name.toLowerCase().includes(search.toLowerCase()) ||
    p.date.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Payment Records</h1>
      <input
        type="text"
        placeholder="Search by user, email, plan or date"
        className="mb-8 w-full p-2 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 px-3 py-2">S.No</th>
            <th className="border border-gray-300 px-3 py-2">User</th>
            <th className="border border-gray-300 px-3 py-2">Email</th>
            <th className="border border-gray-300 px-3 py-2">Plan</th>
            <th className="border border-gray-300 px-3 py-2">Amount</th>
            <th className="border border-gray-300 px-3 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayments.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No records found
              </td>
            </tr>
          ) : (
            filteredPayments.map((p, index) => (
              <tr key={p.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                <td className="border border-gray-300 px-3 py-2">{p.full_name}</td>
                <td className="border border-gray-300 px-3 py-2">{p.email ?? "-"}</td>
                <td className="border border-gray-300 px-3 py-2">{p.plan_name}</td>
                <td className="border border-gray-300 px-3 py-2">Rs {p.amount}</td>
                <td className="border border-gray-300 px-3 py-2">{p.date.split("T")[0]}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
