import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ["#4f46e5", "#22c55e", "#facc15"];

type PlanData = {
  name: string;
  value: number;
};

export default function SubscriptionAnalytics() {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const [usersPerPlan, setUsersPerPlan] = useState<PlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/financial/metrics/subscription", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setUsersPerPlan(data.data.users_per_plan);
        } else {
          setError("Failed to fetch subscription metrics.");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const allZero = usersPerPlan.every((plan) => plan.value === 0);

  if (loading)
    return (
      <p className="text-center py-10 text-gray-600">Loading subscription data...</p>
    );

  if (error)
    return (
      <p className="text-center py-10 text-red-600">Error: {error}</p>
    );

  return (
    <section className="mx-auto py-8">
      <h2 className="text-2xl mt-8 font-semibold mb-6 border-b pb-2 text-[#3C5773]">
        Subscription / Plan Analytics
      </h2>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {usersPerPlan.map((plan, index) => (
          <div
            key={plan.name}
            className="bg-white shadow rounded p-4 flex flex-col items-center justify-center"
          >
            <div
              className="w-12 h-12 rounded-full mb-2"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            ></div>
            <h3 className="text-lg font-medium text-gray-700">{plan.name}</h3>
            <p className="text-3xl font-bold text-gray-900">{plan.value}</p>
            <p className="text-sm text-gray-500">Users</p>
          </div>
        ))}
      </div>

      {/* Pie chart or no data message */}
      {allZero ? (
        <p className="text-center py-20 text-gray-600 text-lg">
          No users subscribed to any plans yet.
        </p>
      ) : (
        <div className="max-w-md mx-auto" style={{ height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={usersPerPlan}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) =>
                  `${name.charAt(0).toUpperCase() + name.slice(1)} ${(percent * 100).toFixed(0)}%`
                }
              >
                {usersPerPlan.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
