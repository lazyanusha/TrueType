import { useEffect, useState } from "react";

interface Plan {
  id: number;
  name: string;
  price_rs: number;
}

const SubscriptionTab = () => {
  const [, setLoadingPlans] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

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
  return (
    <div className="space-y-4 mt-8">
      {plans.map((plan) => (
        <p>
          Plan: <strong> key={plan.id}</strong>
        </p>
      ))}
      <p>
        Status: <span className="text-green-600">Active</span>
      </p>
      <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Manage Billing
      </button>
    </div>
  );
};

export default SubscriptionTab;
