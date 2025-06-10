import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "../publilc/statscard";

export default function SystemUsage() {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [avgUsagePerUser, setAvgUsagePerUser] = useState(0);
  const [usageOverTime, setUsageOverTime] = useState<
    { date: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("http://localhost:8000/financial/metrics/usage", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data.success) {
          const m = data.data;
          setTotalRecords(m.total_records);
          setAvgUsagePerUser(m.avg_usage_per_user);
          setUsageOverTime(m.usage_over_time); // should be an array of { date, count }
        } else {
          setError("Failed to fetch usage metrics.");
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [token]);

  if (loading) return <p>Loading usage data...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-[#3C5773]">
        System Usage / Engagement
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <StatCard title="Total Records Uploaded" value={totalRecords} />
        <StatCard
          title="Average Usage Per User"
          value={avgUsagePerUser.toFixed(2)}
        />
      </div>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <AreaChart data={usageOverTime}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3C5773"
              fill="#CBD5E1"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
