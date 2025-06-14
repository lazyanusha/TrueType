import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../../utils/authfetch";

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

const statusColor = (status: string) => {
  switch (status) {
    case "currently active":
      return "text-green-600";
    case "cancelled (active)":
      return "text-yellow-600";
    case "expired":
      return "text-red-600";
    case "upcoming":
      return "text-blue-600";
    default:
      return "";
  }
};

const getSubscriptionStatus = (
  startDate: string,
  expiryDate: string,
  isCancelled: boolean
): string => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(expiryDate);

  if (isCancelled && now >= start && now <= end) {
    return "cancelled (active)";
  } else if (now < start) {
    return "upcoming";
  } else if (now >= start && now <= end) {
    return "currently active";
  } else {
    return "expired";
  }
};

const SubscriptionTab = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBilling, setShowBilling] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = () => {
    setLoading(true);
    setError(null);
    authFetch(`http://localhost:8000/subscriptions/user`, {
      
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch payments");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid response format");
        const filtered = data.filter((p) => p.id && p.plan?.id);
        setPayments(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const cancelSubscription = async (paymentId: number) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?"))
      return;
    setActionLoading(true);
    try {
      const res = await authFetch(
        `http://localhost:8000/payments/cancel/${paymentId}`,
        {
          method: "PUT",
        }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.detail || "Failed to cancel subscription");
        return;
      }
      alert("Subscription cancelled successfully");
      fetchPayments();
    } catch {
      alert("Error cancelling subscription");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (payments.length === 0)
    return <p>No subscription plans found for this user.</p>;

  // Sort payments by start date (ascending)
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const now = new Date();

  // Find the first valid active or upcoming subscription (not cancelled and not expired)
  const current = sortedPayments.find((p) => {
    const start = new Date(p.date);
    const end = new Date(p.expiry_date);
    return (!p.deleted_at && p.status !== "cancelled" && now <= end) ||
      (p.deleted_at && now >= start && now <= end);
  }) || sortedPayments[0]; // fallback to first

  const currentStatus = getSubscriptionStatus(
    current.date,
    current.expiry_date,
    current.status === "cancelled" || Boolean(current.deleted_at)
  );

  const currentStatusColor = statusColor(currentStatus);

  return (
    <div className="space-y-4 mt-8">
      <p>
        Plan: <strong>{current.plan.name}</strong>
      </p>
      <p>
        <span className={currentStatusColor}>{currentStatus}</span>{" "}
        {currentStatus !== "expired" && (
          <span className="ml-2 text-sm text-gray-600">
            ({calculateRemainingDays(current.expiry_date)} days remaining)
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
                <strong>Active Plan:</strong> {current.plan.name}
              </p>
              <p>
                <strong>Amount:</strong> Rs. {current.plan.price_rs}
              </p>
              <p>
                <strong>Start:</strong> {formatDate(current.date)}
              </p>
              <p>
                <strong>Expires:</strong> {formatDate(current.expiry_date)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span className={currentStatusColor}>{currentStatus}</span>{" "}
                {currentStatus !== "expired" && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({calculateRemainingDays(current.expiry_date)} days
                    remaining)
                  </span>
                )}
              </p>
              {current.status !== "cancelled" &&
                !current.deleted_at &&
                currentStatus === "currently active" && (
                  <div className="mt-2 space-x-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => cancelSubscription(current.id)}
                      className="px-4 py-2 border border-[#3C5773] text-[#3C5773] rounded hover:bg-[#efefef]"
                    >
                      {actionLoading ? "Processing..." : "Cancel Subscription"}
                    </button>
                  </div>
                )}
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold">Billing History</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 font-semibold text-gray-700">Plan</th>
                    <th className="p-3 font-semibold text-gray-700">Start</th>
                    <th className="p-3 font-semibold text-gray-700">Amount</th>
                    <th className="p-3 font-semibold text-gray-700">Status</th>
                    <th className="p-3 font-semibold text-gray-700">
                      Valid Until
                    </th>
                    <th className="p-3 font-semibold text-gray-700">
                      Remaining
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPayments.map((p) => {
                    const rowStatus = getSubscriptionStatus(
                      p.date,
                      p.expiry_date,
                      p.status === "cancelled" || Boolean(p.deleted_at)
                    );
                    const rowColor = statusColor(rowStatus);
                    return (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">{p.plan.name}</td>
                        <td className="p-3">{formatDate(p.date)}</td>
                        <td className="p-3">Rs. {p.plan.price_rs}</td>
                        <td className={`p-3 font-medium ${rowColor}`}>
                          {rowStatus}
                        </td>
                        <td className="p-3">{formatDate(p.expiry_date)}</td>
                        <td className="p-3">
                          {calculateRemainingDays(p.expiry_date)} days
                        </td>
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
