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
  subscription_status?: string;
}

interface PaymentCreatePayload {
  user_id: number;
  plan: string;
  amount: number;
  date: string;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromRegister = location.state?.fromRegister;

  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user info
  useEffect(() => {
    if (fromRegister) {
      alert("Registration successful! Choose a subscription plan to continue.");
    }

    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    if (!token) {
      setLoadingUser(false);
      setUser(null);
      return;
    }

    fetch("http://localhost:8000/users/me", {
      method: "GET",
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
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  // Fetch plans from backend
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

  const handleBuy = async (planName: string) => {
    if (!user) {
      if (
        window.confirm(
          "You must be logged in to buy a plan. Do you want to go to login?"
        )
      ) {
        navigate("/login");
      }
      return;
    }

    const plan = plans.find((p) => p.name === planName);
    if (!plan) {
      alert("Invalid plan selected.");
      return;
    }

    const paymentPayload: PaymentCreatePayload = {
      user_id: user.id,
      plan: planName,
      amount: Number(plan.price_rs),
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch("http://localhost:8000/khalti/verify-payment", {
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
        `Successfully bought ${planName} plan for ${user.full_name}!\nPayment ID: ${data.id}`
      );
      // Optionally navigate somewhere
    } catch (error) {
      alert("Payment failed: Network or server error.");
      console.error("Payment error:", error);
    }
  };

  if (loadingUser || loadingPlans) {
    return (
      <div className="text-center mt-20 text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-600">
        Error loading plans: {error}
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-[#f0f9ff] flex flex-col justify-center items-center pt-30 px-6 sm:px-10 lg:px-16">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-7xl"
      >
        <>
          <h1 className="text-4xl font-extrabold text-[#3C5773] mb-4 text-center">
            Welcome, {user ? user.full_name : "User"}!
          </h1>
          <h2 className="text-xl text-center mb-8 text-[#3C5773]">
            Choose a Subscription Plan to proceed further:
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
      </motion.div>
    </div>
  );
}
