import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { StatCard } from "../publilc/statscard";

export default function SystemUsage({
  totalRecords,
  avgUsagePerUser,
  usageOverTime,
}: {
  totalRecords: number;
  avgUsagePerUser: number;
  usageOverTime: { date: string; count: number }[];
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-[#3C5773]">
        System Usage / Engagement
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <StatCard title="Total Records Uploaded" value={totalRecords} />
        <StatCard title="Average Usage Per User" value={avgUsagePerUser.toFixed(2)} />
      </div>

      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <AreaChart data={usageOverTime}>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="count" stroke="#3C5773" fill="#CBD5E1" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
