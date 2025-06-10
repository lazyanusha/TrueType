import { useState, useEffect } from "react";

interface Payment {
  id: number;
  user_id: number;
  plan_id: number;
  amount: number;
  date: string; // Start date
  expiry_date: string; // Expiry date
  created_at: string;
  full_name: string;
  email?: string;
  plan_name: string;
}

const ITEMS_PER_PAGE = 20;

export default function Payments() {
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sorting state
  const [sortKey, setSortKey] = useState<"date" | "amount" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Date range filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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

  // Filter by search + date range
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      (p.email?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (p.plan_name?.toLowerCase() ?? "").includes(search.toLowerCase()) ||
      (p.full_name?.toLowerCase() ?? "").includes(search.toLowerCase());

    const paymentDate = new Date(p.date);
    const isAfterStart = startDate ? paymentDate >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? paymentDate <= new Date(endDate) : true;

    return matchesSearch && isAfterStart && isBeforeEnd;
  });

  // Sorting logic
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    if (!sortKey) return 0;
    let aVal: any = a[sortKey];
    let bVal: any = b[sortKey];

    // Convert date strings to Date for comparison
    if (sortKey === "date") {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }

    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = sortedPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatAmount = (paisa: number) => {
    const rupees = paisa / 100;
    return `Rs. ${rupees.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const toggleSort = (key: "date" | "amount") => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="w-full mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Payment Records</h1>

      {/* Search and date range filters */}
      <div className="mb-6 space-y-2">
        <input
          type="text"
          placeholder="Search by user, email, plan"
          className="w-full p-2 border rounded"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset page when searching
          }}
        />

        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block mb-1 font-semibold" htmlFor="startDate">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold" htmlFor="endDate">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr className="bg-blue-100 text-gray-700 text-left cursor-pointer select-none">
            <th className="border border-gray-300 px-3 py-2">S.No</th>
            <th className="border border-gray-300 px-3 py-2">User</th>
            <th className="border border-gray-300 px-3 py-2">Email</th>
            <th className="border border-gray-300 px-3 py-2">Plan</th>

            <th
              className="border border-gray-300 px-3 py-2"
              onClick={() => toggleSort("amount")}
            >
              Amount {sortKey === "amount" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th
              className="border border-gray-300 px-3 py-2"
              onClick={() => toggleSort("date")}
            >
              Start Date{" "}
              {sortKey === "date" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th className="border border-gray-300 px-3 py-2">Expiry Date</th>
          </tr>
        </thead>

        <tbody>
          {paginatedPayments.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-4">
                No records found
              </td>
            </tr>
          ) : (
            paginatedPayments.map((p, index) => (
              <tr key={p.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 px-3 py-2 text-center">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>

                <td className="border border-gray-300 px-3 py-2">
                 <a
                    href={`users/${p.user_id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {p.full_name}
                  </a>
                </td>

                <td className="border border-gray-300 px-3 py-2">
                  {p.email ?? "-"}
                </td>

                <td className="border border-gray-300 px-3 py-2">
                  {p.plan_name}
                </td>

                <td className="border border-gray-300 px-3 py-2">
                  {formatAmount(p.amount)}
                </td>

                <td className="border border-gray-300 px-3 py-2">
                  {p.date ? p.date.split("T")[0] : "-"}
                </td>

                <td className="border border-gray-300 px-3 py-2">
                  {p.expiry_date ? p.expiry_date.split("T")[0] : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
