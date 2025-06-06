import KhaltiCheckout from "khalti-checkout-web";
import { useEffect, useRef, useState } from "react";
import Snowing from "../../components/user_component/Snowing";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type KhaltiPageProps = {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  planName: string;
  amount: number;
  onSuccessCallback: () => void;
};

export default function KhaltiPage({
  user,
  planName,
  amount,
  onSuccessCallback,
}: KhaltiPageProps) {
  const navigate = useNavigate();
  const checkoutRef = useRef<KhaltiCheckout | null>(null);
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000);
    setExpiry(expiryTime.toLocaleString());

    const config = {
      publicKey: "test_public_key_dc74d9f0b57d48b49d9086a15c2e665a",
      productIdentity: user.id.toString(),
      productName: planName,
      productUrl: window.location.origin,
      eventHandler: {
        async onSuccess(payload: any) {
          try {
            const res = await fetch(
              "http://localhost:8000/api/payments/khalti-verify",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token: payload.token,
                  amount: payload.amount,
                  user_id: user.id,
                  plan: planName,
                }),
              }
            );
            const data = await res.json();
            if (data.success) {
              alert("✅ Payment successful!");
              onSuccessCallback();
            } else {
              alert("❌ Payment verification failed.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("❌ Could not verify payment.");
          }
        },
        onError(error: any) {
          console.error("Khalti Payment Error:", error);
          alert("❌ Payment Failed.");
        },
      },
    };

    checkoutRef.current = new KhaltiCheckout(config);
  }, [user, planName]);

  const handlePayment = () => {
    checkoutRef.current?.show({ amount: amount * 100 });
  };

  const handleCancel = () => {
    navigate("/subscription");
  };

  return (
    <div className="bg-[#f0f9ff] min-h-[90vh] flex items-center justify-center px-4 py-10">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-2xl"
      >
        <div className="bg-white border border-gray-300 rounded-xl p-10 shadow-lg min-h-[600px] flex flex-col justify-start gap-5">
          <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">
            Khalti Payment
          </h1>

          <p className="text-sm text-center text-gray-500 mb-8">
            This payment link will expire on <strong>{expiry}</strong>
          </p>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-600 mb-2">
              Billed To
            </h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex gap-5">
                <span className="font-medium">Name:</span>
                <span>{user.name}</span>
              </div>
              <div className="flex gap-5">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex gap-5">
                <span className="font-medium">Phone:</span>
                <span>{user.phone}</span>
              </div>
              <div className="flex gap-5">
                <span className="font-medium">Plan:</span>
                <span>{planName}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-b py-4 mb-6 text-sm">
            <div className="flex justify-between font-semibold">
              <span>Total Payable Amount</span>
              <span>Rs {amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handlePayment}
              className="flex-1 py-3 bg-[#5C2D91] text-white font-semibold rounded-md hover:bg-[#4b2781] transition"
            >
              Pay with Khalti
            </button>

            <button
              onClick={handleCancel}
              className="flex-1 py-3 border border-gray-400 text-gray-700 font-semibold rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
            <div>Payment Powered by</div>
            <div className="text-[#5C2D91] font-medium">Khalti</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
