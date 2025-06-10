import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatCard } from "../publilc/statscard";

const COLORS = ["#3C5773", "#557A95", "#8196AB", "#A7B8C7"];

// Custom tooltip formatter for Rs
const formatCurrency = (value: number) => `Rs ${value.toFixed(2)}`;

export default function FinancialMetrics() {
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [paymentsCompleted, setPaymentsCompleted] = useState(0);
  const [paymentsFailed, setPaymentsFailed] = useState(0);
  const [ARPU, setARPU] = useState(0);
  const [revenueByPlan, setRevenueByPlan] = useState<
    { name: string; revenue: number }[]
  >([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const resFinancial = await fetch(
          "http://localhost:8000/financial/metrics",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!resFinancial.ok)
          throw new Error("Failed to load financial metrics");
        const dataFinancial = await resFinancial.json();

        setTotalRevenue(dataFinancial.total_revenue || 0);
        setPaymentsCompleted(dataFinancial.payments_completed || 0);
        setPaymentsFailed(dataFinancial.payments_failed || 0);
        setARPU(dataFinancial.arpu || 0);
        setRevenueByPlan(dataFinancial.revenue_by_plan || []);

        setError(null);
      } catch (err: any) {
        setError(err.message || "Error fetching financial metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);

  if (loading)
    return <p className="text-center py-10">Loading financial metrics...</p>;

  if (error)
    return <p className="text-center py-10 text-red-600">Error: {error}</p>;

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-8 border-b pb-2 text-[#3C5773]">
        Financial Metrics
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Revenue"
          value={`Rs ${totalRevenue.toFixed(2)}`}
        />
        <StatCard title="Payments Completed" value={paymentsCompleted} />
        <StatCard
          title="Payments Cancelled"
          value={paymentsFailed}
          tooltip="These are successful payments that were later cancelled (soft-deleted)."
        />{" "}
        <StatCard title="ARPU" value={`Rs ${ARPU.toFixed(2)}`} />
      </div>

      <div
        style={{
          display: "flex",
          gap: "40px", // space between charts
          flexWrap: "wrap", // wrap on small screens
          justifyContent: "center",
        }}
      >
        {/* Bar chart for revenue by plan */}
        <div
          style={{
            flex: "1 1 500px",
            height: 450,
            minWidth: 300,
            marginTop: 80,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByPlan} margin={{ bottom: 60 }}>
              <XAxis
                dataKey="name"
                interval={0}
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 14, fill: "#333" }}
                height={60}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fontSize: 14, fill: "#333" }}
                width={100}
              />
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value)/100)}
              />
              <Legend wrapperStyle={{ fontSize: 16 }} />
              <Bar dataKey="revenue" fill="#3C5773" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart for revenue distribution by plan */}
        <div style={{ flex: "1 1 400px", height: 450, minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={revenueByPlan}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#557A95"
                label
              >
                {revenueByPlan.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => formatCurrency(Number(value)/100)}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
