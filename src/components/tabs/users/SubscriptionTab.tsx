import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Plan {
  id: number;
  name: string;
  price_rs: number;
}

interface Payment {
  id: number;
  plan: Plan;
  date: string;
  expiry_date: string;
  status: string;
  created_at: string;
  deleted_at?: string | null;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-GB");

const calculateRemainingDays = (expiry: string) => {
  const now = new Date();
  const end = new Date(expiry);
  const diffMs = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
};

type SubscriptionStatus = "Active" | "Cancelled (Active)" | "Expired";

function getSubscriptionStatus(payment: Payment): {
  status: SubscriptionStatus;
  color: string;
} {
  const now = new Date();
  const expiry = new Date(payment.expiry_date);
  const isActive = expiry >= now;
  const isCancelled = payment.status === "cancelled";

  let status: SubscriptionStatus = "Expired";
  if (isActive) {
    status = isCancelled ? "Cancelled (Active)" : "Active";
  }

  const color =
    status === "Active"
      ? "text-green-600"
      : status === "Cancelled (Active)"
      ? "text-yellow-600"
      : "text-red-600";

  return { status, color };
}

const SubscriptionTab = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBilling, setShowBilling] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<"All" | SubscriptionStatus>("All");

  const fetchPayments = () => {
    setLoading(true);
    setError(null);
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    fetch(`http://localhost:8000/subscriptions/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }
        const filtered = data.filter(
          (p) => p.id != null && p.plan?.id != null
        );
        if (filtered.length < data.length) {
          console.warn(
            "Some payments were ignored due to missing id or plan.id fields"
          );
        }
        setPayments(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const cancelSubscription = async (paymentId: number) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) {
      return;
    }
    setActionLoading(true);
    try {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");
      const res = await fetch(
        `http://localhost:8000/payments/cancel/${paymentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        const data = await res.json();
        alert(data.detail || "Failed to cancel subscription");
        return;
      }
      alert("Subscription cancelled successfully");
      fetchPayments();
    } catch (err) {
      alert("Error cancelling subscription");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (payments.length === 0)
    return <p>No subscription plans found for this user.</p>;

  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.expiry_date).getTime() - new Date(a.expiry_date).getTime()
  );

  const latest = sortedPayments[0];

  if (!latest?.id || !latest.plan?.id) {
    return <p className="text-red-500">Invalid subscription data received.</p>;
  }

  const { status: currentStatus, color: statusColor } =
    getSubscriptionStatus(latest);

  const filteredPayments =
    filter === "All"
      ? sortedPayments
      : sortedPayments.filter((p) => getSubscriptionStatus(p).status === filter);

  return (
    <div className="space-y-4 mt-8">
      <p>
        Plan: <strong>{latest.plan.name}</strong>
      </p>
      <p>
        <span
          className={statusColor}
          title={
            currentStatus === "Cancelled (Active)"
              ? "This subscription was cancelled but is still valid until expiry."
              : ""
          }
        >
          {currentStatus}
        </span>{" "}
        {currentStatus !== "Expired" && (
          <span className="ml-2 text-sm text-gray-600">
            ({calculateRemainingDays(latest.expiry_date)} days remaining)
          </span>
        )}
      </p>

      <button
        className="px-4 py-2 border border-[#3C5773] text-[#3C5773] rounded hover:bg-[#efefef]"
        onClick={() => setShowBilling(true)}
      >
        Manage Billing
      </button>
      <button
        onClick={() => navigate("/subscription")}
        className="ml-8 px-4 py-2 border border-[#3C5773] text-[#3C5773] rounded hover:bg-[#efefef]"
      >
        Change Plan
      </button>

      {showBilling && (
        <div className="fixed inset-0 bg-[#3C5773] bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative bg-white min-h-[90vh] p-6 rounded-xl max-w-4xl w-full shadow-lg overflow-auto">
            {/* Close Button */}
            <button
              className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-black"
              onClick={() => setShowBilling(false)}
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4">Manage Billing</h2>

            <div className="flex flex-col gap-4 p-4 mb-4 rounded bg-gray-50 shadow-md">
              <p>
                <strong>Active Plan:</strong> {latest.plan.name}
              </p>
              <p>
                <strong>Amount:</strong> Rs. {latest.plan.price_rs}
              </p>
              <p>
                <strong>Start:</strong> {formatDate(latest.date)}
              </p>
              <p>
                <strong>Expires:</strong> {formatDate(latest.expiry_date)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={statusColor}>{currentStatus}</span>{" "}
                {currentStatus !== "Expired" && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({calculateRemainingDays(latest.expiry_date)} days remaining)
                  </span>
                )}
              </p>
              {latest.status !== "cancelled" && currentStatus === "Active" && (
                <div className="mt-2 space-x-2">
                  <button
                    disabled={actionLoading}
                    onClick={() => cancelSubscription(latest.id)}
                    className="px-4 py-2 border border-[#3C5773] text-[#3C5773] rounded hover:bg-[#efefef]"
                  >
                    {actionLoading ? "Processing..." : "Cancel Subscription"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Billing History</h3>
              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value as "All" | SubscriptionStatus)
                }
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Cancelled (Active)">Cancelled (Active)</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 font-semibold text-gray-700">Plan</th>
                    <th className="p-3 font-semibold text-gray-700">Date</th>
                    <th className="p-3 font-semibold text-gray-700">Amount</th>
                    <th className="p-3 font-semibold text-gray-700">Status</th>
                    <th className="p-3 font-semibold text-gray-700">Valid Until</th>
                    <th className="p-3 font-semibold text-gray-700">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p, idx) => {
                    if (!p?.id || !p.plan?.id) return null;

                    const { status: rowStatus, color: rowColor } =
                      getSubscriptionStatus(p);
                    const remaining = calculateRemainingDays(p.expiry_date);
                    return (
                      <tr
                        key={p.id}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-3">{p.plan.name}</td>
                        <td className="p-3">{formatDate(p.date)}</td>
                        <td className="p-3">Rs. {p.plan.price_rs}</td>
                        <td className={`p-3 ${rowColor}`}>{rowStatus}</td>
                        <td className="p-3">{formatDate(p.expiry_date)}</td>
                        <td className="p-3">{remaining} days</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTab;
