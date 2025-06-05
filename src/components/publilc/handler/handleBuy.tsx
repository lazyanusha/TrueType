// import KhaltiCheckout from "khalti-checkout-web";
import { useEffect } from "react";

export default function KhaltiButton({ user, amount }: { user: any, amount: number }) {
  const config = {
    publicKey: "test_public_key_dc74d9f0b57d48b49d9086a15c2e665a",
    productIdentity: user.id.toString(),
    productName: "Subscription Plan",
    productUrl: "http://localhost:3000/payment",
    eventHandler: {
      onSuccess(payload: any) {
        // Send token and amount to backend
        fetch("http://localhost:8000/api/payments/khalti-verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: payload.token,
            amount: payload.amount,
            user_id: user.id,
            plan: "Monthly",
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            alert("Payment successful!");
          })
          .catch(() => alert("Payment verification failed"));
      },
      onError(error: any) {
        console.error("Khalti Payment Error:", error);
        alert("Payment Failed");
      },
    },
  };

  useEffect(() => {
    const checkout = new KhaltiCheckout(config);
    const btn = document.getElementById("khalti-btn");
    if (btn) {
      btn.onclick = () => checkout.show({ amount: amount * 100 });
    }
  }, []);

  return <button id="khalti-btn" className="bg-purple-600 text-white px-4 py-2 rounded">Pay with Khalti</button>;
}
