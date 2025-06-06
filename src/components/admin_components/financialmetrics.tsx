import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { StatCard } from "../publilc/statscard";

export default function FinancialMetrics({
  totalRevenue,
  paymentsCompleted,
  paymentsFailed,
  ARPU,
  revenueByPlan,
}: {
  totalRevenue: number;
  paymentsCompleted: number;
  paymentsFailed: number;
  ARPU: number;
  revenueByPlan: { name: string; revenue: number }[];
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-8 border-b pb-2 text-[#3C5773]">Financial Metrics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} />
        <StatCard title="Payments Completed" value={paymentsCompleted} />
        <StatCard title="Payments Failed" value={paymentsFailed} />
        <StatCard title="ARPU" value={`$${ARPU.toFixed(2)}`} />
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={revenueByPlan}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#3C5773" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
