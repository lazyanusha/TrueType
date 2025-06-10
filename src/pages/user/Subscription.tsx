import { useNavigate, useLocation } from "react-router-dom";
import Snowing from "../../components/user_component/Snowing";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Plan {
  id: number;
  name: string;
  price_rs: number;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
}

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRegister = location.state?.fromRegister;

  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      return;
    }

    fetch("http://localhost:8000/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      mode: "cors",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);
      })
      .catch(() => setUser(null));
  }, [fromRegister]);

  useEffect(() => {
    fetch("http://localhost:8000/plans")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch plans");
        const data = await res.json();
        setPlans(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingPlans(false));
  }, []);

  useEffect(() => {
    if (location.state?.paymentSuccess) {
      setPaymentCompleted(true);
      window.history.replaceState({}, document.title); // Clear state
    }
  }, [location.state]);

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      setSelectedPlan(plan);
      setShowModal(true);
      return;
    }

    try {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        alert("Authentication token missing.");
        return;
      }

      const response = await fetch("http://localhost:8000/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: plan.price_rs * 100, // Khalti uses paisa
          user_id: user.id,
          plan_id: plan.id,
          plan_name: plan.name,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone || "",
        }),
      });

      if (!response.ok) throw new Error("Failed to initiate payment");

      const data = await response.json();

      if (data.payment_url) {
        // Redirect to Khalti payment gateway
        window.location.href = data.payment_url;
      } else {
        // Mock success fallback
        setPaymentCompleted(true);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error initiating payment. Please try again.");
    }
  };

  const staticFeatures: Record<string, string[]> = {
    Basic: [
      "5 uploads/day",
      "Documents < 1000 words",
      "Only .docx files supported",
    ],
    Weekly: [
      "7-day access",
      "Unlimited Reports",
      "Multiple File Uploads",
      "Basic Citations Check",
      "Reports Export",
    ],
    Monthly: [
      "30-day access",
      "Unlimited Reports",
      "Multiple File Uploads",
      "Reports Export",
      "Basic Citations Check",
      "Save ~37% compared to weekly",
    ],
    Yearly: [
      "1-year access",
      "Unlimited Reports",
      "Multiple File Uploads",
      "Reports Export",
      "Basic Citations Check",
      "Save over 50% annually",
    ],
  };

  if (loadingPlans)
    return <div className="text-center mt-20 text-gray-600">Loading...</div>;
  if (error)
    return <div className="text-center mt-20 text-red-600">Error: {error}</div>;

  return (
    <div className="relative min-h-[60vh] bg-[#f0f9ff] flex flex-col justify-center items-center py-20 px-6 sm:px-10 lg:px-16">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className={`w-7xl ${showModal ? "blur-sm brightness-75" : ""}`}
      >
        <h1 className="text-4xl font-extrabold text-[#3C5773] mb-4 text-center">
          {user ? `Welcome, ${user.full_name}!` : "Choose a Subscription Plan"}
        </h1>
        <h2 className="text-xl text-center mb-8 text-[#3C5773]">
          Pick the right plan for your usage
        </h2>
        <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-3 max-w-7xl w-full">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {plan.name}
                  </h2>
                  <span className="text-xl font-semibold text-blue-600">
                    Rs {plan.price_rs}
                  </span>
                </div>
                <ul className="flex flex-col gap-3 text-gray-600 text-sm mb-auto">
                  {(staticFeatures[plan.name] || []).map((feature, index) => (
                    <li
                      key={index}
                      className="border-b border-gray-200 pb-2 last:border-b-0"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={plan.name === "Basic"}
                className={`bg-transparent border border-gray-300 rounded-md px-5 py-3 mb-6 mx-4 font-semibold 
                  ${
                    plan.name === "Basic"
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-gray-100"
                  }`}
              >
                Choose Plan
              </button>
              {plan.name === "Basic" && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Basic plan is free and active by default.
                </p>
              )}
            </div>
          ))}
        </div>

        {paymentCompleted && (
          <div className="mt-10 text-center text-green-600 font-semibold">
            Payment successful! Thank you for subscribing.
          </div>
        )}
      </motion.div>

      {/* Modal for login */}
      {showModal && (
        <div
          className="fixed inset-0 bg-gray-300 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center text-[#3C5773]">
              Login Required
            </h2>
            <p className="text-center text-gray-600 mb-6">
              You need to be logged in to purchase a subscription plan.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-300 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Go to Login
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
