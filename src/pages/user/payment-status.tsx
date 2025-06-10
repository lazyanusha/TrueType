import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Snowing from "../../components/user_component/Snowing";

function useQuery() {
  const { search } = useLocation();
  return new URLSearchParams(search);
}

type PaymentData = {
  transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  subscription_plan?: string;
  user_email?: string;
};

export default function PaymentStatus() {
  const query = useQuery();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  );
  const [message, setMessage] = useState<string>("Verifying payment...");
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);

  const pidx = query.get("pidx");
  const transaction_id = query.get("transaction_id");

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (!token) {
      setStatus("failed");
      setMessage("You must be logged in to verify payment.");
      return;
    }

    if (!pidx || !transaction_id) {
      setStatus("failed");
      setMessage("Invalid payment response. Missing parameters.");
      return;
    }

    fetch("http://localhost:8000/payments/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx, transaction_id }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Payment verification failed");
        }
        return res.json();
      })
      .then((data) => {
        if (["Completed", "Already Confirmed"].includes(data.status)) {
          setStatus("success");
          setMessage("Payment successful! Thank you for subscribing.");
          setPaymentData({
            transaction_id: data.transaction_id || transaction_id, // fallback
            amount: data.amount / 100, // convert paisa to rupees
            currency: data.currency,
            status: data.status,
            date: new Date().toISOString(),
            subscription_plan: data.subscription_plan,
            user_email: data.user_email,
          });
        } else {
          setStatus("failed");
          setMessage("Payment verification failed or payment incomplete.");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Payment verification failed. Please try again.");
      });
  }, [query]);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? "Invalid Date"
      : d.toLocaleString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  }

  function formatCurrency(amount: number) {
    return `Rs. ${amount.toLocaleString("en-NP")}`;
  }

  return (
    <div className="min-h-[80vh] bg-[#f0f9ff] flex flex-row items-center justify-center p-6">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className={`w-7xl flex flex-row items-center justify-center `}
      >
        {status === "pending" && (
          <div className="flex items-center space-x-3">
            <svg
              className="animate-spin h-6 w-6 text-blue-600"
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
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="text-blue-600 text-lg font-medium">{message}</span>
          </div>
        )}

        {(status === "failed" || status === "success") && (
          <div
            className={`bg-white p-10 rounded-lg shadow-md max-w-md w-full font-sans text-gray-800`}
          >
            {status === "failed" && (
              <p className="text-red-600 font-semibold mb-6">{message}</p>
            )}

            {status === "success" && paymentData && (
              <>
                <h1 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">
                  Payment Receipt
                </h1>
                <p className="mb-4 font-medium text-green-600">{message}</p>

                <div className="mb-6 space-y-3">
                  <div>
                    <h3 className="font-semibold">Transaction ID</h3>
                    <p className="select-all">{paymentData.transaction_id}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Date</h3>
                    <p>{formatDate(paymentData.date)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Amount Paid</h3>
                    <p>{formatCurrency(paymentData.amount)}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Status</h3>
                    <p className="capitalize">{paymentData.status}</p>
                  </div>
                  {paymentData.subscription_plan && (
                    <div>
                      <h3 className="font-semibold">Subscription Plan</h3>
                      <p>{paymentData.subscription_plan}</p>
                    </div>
                  )}
                  {paymentData.user_email && (
                    <div>
                      <h3 className="font-semibold">User Email</h3>
                      <p>{paymentData.user_email}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              onClick={() => {
                navigate("/", { replace: true });
                window.location.reload();
              }}
              className={`w-full py-3 font-semibold rounded transition-colors ${
                status === "success"
                  ? "bg-[#3C5773] text-white hover:bg-[#5C5773]"
                  : "bg-red-500 text-white hover:bg-red-600"
              }`}
            >
              Back to Home Page
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
