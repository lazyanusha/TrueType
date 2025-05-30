import { useState } from "react";

export default function Payments() {
  const [search, setSearch] = useState("");

  const payments = [
    { id: 1, user: "Alice", email: "alice@example.com", plan: "Monthly", amount: 700, date: "2025-05-29" },
    { id: 2, user: "Bob", email: "bob@example.com", plan: "Yearly", amount: 7000, date: "2025-04-15" },
    { id: 3, user: "Charlie", email: "charlie@example.com", plan: "Monthly", amount: 700, date: "2025-05-10" },
  ];

  // Filter payments by user name, email , plan, date based on search
 const filteredPayments = payments.filter(
  (p) =>
    p.user.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    p.plan.toLowerCase().includes(search.toLowerCase()) ||
    p.date.toLowerCase().includes(search.toLowerCase())
);


  return (
    <div className="p-6w-full mx-auto ">
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
          {filteredPayments.map((p, index) => (
            <tr key={p.id} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
              <td className="border border-gray-300 px-3 py-2">{p.user}</td>
              <td className="border border-gray-300 px-3 py-2">{p.email}</td>
              <td className="border border-gray-300 px-3 py-2">{p.plan}</td>
              <td className="border border-gray-300 px-3 py-2">Rs {p.amount}</td>
              <td className="border border-gray-300 px-3 py-2">{p.date}</td>
            </tr>
          ))}
          {filteredPayments.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
