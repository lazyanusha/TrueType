import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentStatus() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const token = params.get("token");
    const amount = params.get("amount");
    const authToken =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (!token || !amount) {
      setStatus("Invalid payment response.");
      return;
    }

    fetch("http://localhost:8000/payments/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, amount: Number(amount) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to verify payment");
        return res.json();
      })
      .then((data) => {
        if (data.status === "Completed") {
          setStatus("✅ Payment Successful! 🎉 You can now use your plan.");
          setTimeout(() => navigate("/"), 4000);
        } else {
          setStatus(`❌ Payment ${data.status}. Please try again.`);
        }
      })
      .catch(() => {
        setStatus("❌ Error verifying payment.");
      });
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
        <p>{status}</p>
      </div>
    </div>
  );
}
