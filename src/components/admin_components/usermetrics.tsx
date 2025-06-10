import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "../publilc/statscard";

// Utility fetch with error handling
async function fetchJson(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return await res.json();
}

const fetchUserMetrics = (token: string) =>
  fetchJson("http://localhost:8000/users/metrics", token);

const fetchUserGrowth = (token: string, start: string, end: string) =>
  fetchJson(
    `http://localhost:8000/users/growth?start_date=${start}&end_date=${end}`,
    token
  );

type MetricsData = {
  total_users: number;
  active_subscriptions: number;
  expired_subscriptions: number;
  new_users_last_7_days: number;
  new_users_last_30_days: number;
};

export default function UserMetrics() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [growthData, setGrowthData] = useState<
    { date: string; users: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Date range for growth chart
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date.toISOString().slice(0, 10);
  });

  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  useEffect(() => {
    const storedToken =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    setToken(storedToken || null);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        const [metricsRes, growthRes] = await Promise.all([
          fetchUserMetrics(token),
          fetchUserGrowth(token, startDate, endDate),
        ]);

        if (metricsRes.success) {
          setMetrics(metricsRes.data);
        } else {
          setError("Failed to fetch metrics.");
        }

        if (growthRes.success) {
          setGrowthData(growthRes.data);
        } else {
          setError("Failed to fetch growth data.");
        }
      } catch (e: any) {
        setError(e.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, startDate, endDate]);

  const handleQuickRange = (days: number) => {
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(new Date().toISOString().slice(0, 10));
  };

  if (loading) return <p>Loading user metrics...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!metrics) return null;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-[#3C5773]">
        User Metrics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Users" value={metrics.total_users} />
        <StatCard title="Active Users" value={metrics.active_subscriptions} />
        <StatCard
          title="Inactive Users"
          value={metrics.expired_subscriptions}
        />
        <StatCard
          title={`New Users (30d)`}
          value={metrics.new_users_last_30_days}
        />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <span className="font-medium">Growth Range:</span>
        <button
          className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => handleQuickRange(7)}
        >
          Last 7 Days
        </button>
        <button
          className="px-3 py-1 border rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => handleQuickRange(30)}
        >
          Last 30 Days
        </button>
        <label className="ml-4">
          From:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-2 py-1 rounded"
          />
        </label>
      </div>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={growthData}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#3C5773"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
