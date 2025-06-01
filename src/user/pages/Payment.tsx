import { useLocation, useNavigate } from "react-router-dom";
import Snowing from "../components/Snowing";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Plan {
  name: string;
  price: string;
}

interface PaymentCreatePayload {
  user_id: number;
  plan: string;
  amount: number;
  date: string;
}

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<{ user_id?: number; fullName?: string }>({});

  // Load user info from location.state or localStorage on mount
  useEffect(() => {
    if (location.state && location.state.user_id && location.state.fullName) {
      setUser({
        user_id: location.state.user_id,
        fullName: location.state.fullName,
      });
      // Save to localStorage for persistence
      localStorage.setItem("user_id", String(location.state.user_id));
      localStorage.setItem("fullName", location.state.fullName);
    } else {
      // Try to load from localStorage
      const storedUserId = localStorage.getItem("user_id");
      const storedFullName = localStorage.getItem("fullName");
      if (storedUserId && storedFullName) {
        setUser({
          user_id: Number(storedUserId),
          fullName: storedFullName,
        });
      } else {
        // No user info found, optionally redirect to register
        // navigate("/register");
      }
    }
  }, [location.state]);

  // Example plans (can be passed from props or location.state)
  const subscriptionPlans: Plan[] = [
    { name: "Weekly", price: "200" }, // price as number string for backend
    { name: "Monthly", price: "700" },
    { name: "Yearly", price: "1450" },
  ];

  // Send payment POST request
  const handleBuy = async (planName: string) => {
    if (!user.user_id || !user.fullName) {
      alert("You must be logged in or register first to buy a plan.");
      return;
    }

    // Find the price by planName
    const plan = subscriptionPlans.find((p) => p.name === planName);
    if (!plan) {
      alert("Invalid plan selected.");
      return;
    }

    // Prepare payload
    const paymentPayload: PaymentCreatePayload = {
      user_id: user.user_id,
      plan: planName,
      amount: Number(plan.price),
      date: new Date().toISOString(), // current date-time in ISO format
    };

    try {
      const res = await fetch("/api/payments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentPayload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(`Payment failed: ${errorData.detail || res.statusText}`);
        return;
      }

      const data = await res.json();
      alert(
        `Successfully bought ${planName} plan for ${user.fullName}!\nPayment ID: ${data.id}`
      );
      // Optionally redirect to dashboard or receipt page here
      // navigate("/dashboard");
    } catch (error) {
      alert("Payment failed: Network or server error.");
      console.error("Payment error:", error);
    }
  };

  return (
    <div className="min-h-[60vh] bg-[#f0f9ff] flex flex-col justify-center items-center pt-30 px-6 sm:px-10 lg:px-16">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-7xl"
      >
        {user.user_id && user.fullName ? (
          <>
            <h1 className="text-4xl font-extrabold text-[#3C5773] mb-4 text-center">
              Welcome, {user.fullName}!
            </h1>
            <h2 className="text-xl text-center mb-8 text-[#3C5773]">
              Choose a Subscription Plan:
            </h2>
            <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-3 max-w-7xl w-full">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.name}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {plan.name}
                      </h2>
                      <span className="text-xl font-semibold text-blue-600">
                        Rs {plan.price}
                      </span>
                    </div>

                    <ul className="flex flex-col gap-3 text-gray-600 text-sm mb-auto">
                      <li className="border-b border-gray-200 pb-2">
                        Unlimited Reports
                      </li>
                      <li className="border-b border-gray-200 pb-2">
                        Multiple File Uploads
                      </li>
                      <li className="border-b border-gray-200 pb-2">
                        Citations Check
                      </li>
                      <li>Reports Export</li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleBuy(plan.name)}
                    style={{ borderColor: "#3C5773", color: "#3C5773" }}
                    className="self-start ml-4 py-2 rounded-[10px] border-1 w-64 mb-8 font-semibold text-lg hover:bg-[#eee] transition-colors duration-300 shadow-sm hover:shadow-md"
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-red-600 text-lg font-semibold mt-10">
            You must be logged in or register first to buy a plan.
            <br />
            <button
              onClick={() => navigate("/register")}
              className="mt-4 underline text-blue-600"
            >
              Go to Registration
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
