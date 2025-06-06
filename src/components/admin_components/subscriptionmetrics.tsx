import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#4f46e5", "#22c55e", "#facc15", "#ef4444"];

export default function SubscriptionAnalytics({
  usersPerPlan,
}: {
  usersPerPlan: { name: string; value: number }[];
}) {
  return (
    <section>
      <h2 className="text-2xl mt-8 font-semibold mb-8 border-b pb-2 text-[#3C5773]">
        Subscription / Plan Analytics
      </h2>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
