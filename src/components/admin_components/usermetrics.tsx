import  { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "../publilc/statscard";
import { fetchUserMetrics } from "../../api_helper/usermetrics";

type MetricsData = {
  total_users: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  new_users_last_7_days: number;
  new_users_last_30_days: number;
  // roles_distribution and plan_distribution are also available if needed
};

export default function UserMetrics({ dateRange }: { dateRange: string }) {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // You will need to provide the admin token here (e.g. from context or props)
  // For example purposes, I'll assume it's passed via props or from localStorage
  const token = localStorage.getItem("token") || "";

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchUserMetrics(token);
        if (response.success) {
          setMetrics(response.data);
        } else {
          setError("Failed to fetch metrics");
        }
      } catch (e: any) {
        setError(e.message || "Failed to fetch metrics");
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [token]);

  if (loading) {
    return <p>Loading user metrics...</p>;
  }
  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }
  if (!metrics) {
    return null;
  }

  // For growthData, you might want to create a dummy or extend your API to return it
  // For now, let's just create a simple dummy array for last 7 days
  const growthData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return { date: date.toISOString().slice(0, 10), users: Math.floor(metrics.new_users_last_7_days / 7) };
  });

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-[#3C5773]">User Metrics</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Users" value={metrics.total_users} />
        <StatCard title="Active Users" value={metrics.active_subscriptions} />
        <StatCard title="Inactive Users" value={metrics.expired_subscriptions} />
        <StatCard title={`New Users (${dateRange})`} value={metrics.new_users_last_30_days} />
      </div>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={growthData}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#3C5773" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
