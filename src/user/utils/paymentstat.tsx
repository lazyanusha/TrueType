import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Parse query params
    const query = new URLSearchParams(location.search);
    const user_id = query.get("user_id");
    const plan = query.get("plan");
    const amount = query.get("amount");
    const pid = query.get("pid");

    // Call backend to verify and save payment
    if (user_id && plan && amount && pid) {
      fetch("/api/payments/esewa-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, plan, amount, pid }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Verification failed");
          return res.json();
        })
        .then((data) => {
          alert("Payment successful and verified! Payment ID: " + data.id);
          navigate("/"); // or wherever
        })
        .catch(() => {
          alert("Payment verification failed. Please contact support.");
          navigate("/");
        });
    } else {
      alert("Invalid payment data.");
      navigate("/");
    }
  }, [location, navigate]);

  return <div>Processing your payment... Please wait.</div>;
}

export function PaymentFailurePage() {
  return (
    <div className="text-center mt-20 text-red-600">
      Payment failed or cancelled. Please try again.
    </div>
  );
}
