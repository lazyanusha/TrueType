import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// Mock data (same as before)
const MOCK_USERS = [
  { id: 1, active: true, registeredAt: "2025-05-10", plan: "free" },
  { id: 2, active: false, registeredAt: "2025-04-15", plan: "monthly" },
  { id: 3, active: true, registeredAt: "2025-05-02", plan: "yearly" },
  { id: 4, active: true, registeredAt: "2025-03-20", plan: "monthly" },
  { id: 5, active: false, registeredAt: "2025-01-10", plan: "free" },
  { id: 6, active: true, registeredAt: "2025-05-20", plan: "weekly" },
  { id: 7, active: true, registeredAt: "2025-05-22", plan: "monthly" },
  { id: 8, active: true, registeredAt: "2025-02-10", plan: "yearly" },
  { id: 9, active: false, registeredAt: "2025-04-25", plan: "weekly" },
  { id: 10, active: true, registeredAt: "2025-05-25", plan: "monthly" },
];

const MOCK_PAYMENTS = [
  { userId: 2, status: "completed", amount: 20, plan: "monthly", date: "2025-05-01" },
  { userId: 3, status: "completed", amount: 200, plan: "yearly", date: "2025-05-02" },
  { userId: 4, status: "failed", amount: 20, plan: "monthly", date: "2025-05-03" },
  { userId: 6, status: "completed", amount: 5, plan: "weekly", date: "2025-05-20" },
  { userId: 7, status: "completed", amount: 20, plan: "monthly", date: "2025-05-22" },
  { userId: 8, status: "completed", amount: 200, plan: "yearly", date: "2025-04-10" },
  { userId: 10, status: "completed", amount: 20, plan: "monthly", date: "2025-05-25" },
];

const MOCK_RECORDS = [
  { id: 1, userId: 1, createdAt: "2025-05-10" },
  { id: 2, userId: 2, createdAt: "2025-05-12" },
  { id: 3, userId: 3, createdAt: "2025-05-13" },
  { id: 4, userId: 4, createdAt: "2025-05-14" },
  { id: 5, userId: 6, createdAt: "2025-05-20" },
  { id: 6, userId: 7, createdAt: "2025-05-22" },
  { id: 7, userId: 10, createdAt: "2025-05-25" },
  { id: 8, userId: 1, createdAt: "2025-05-25" },
  { id: 9, userId: 3, createdAt: "2025-05-26" },
];

// Utils
function getDateRange(range: string) {
  const now = new Date();
  switch (range) {
    case "week":
      return [new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now];
    case "month":
      return [new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now];
    case "year":
      return [new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000), now];
    case "all":
    default:
      return [new Date("1970-01-01"), now];
  }
}
function dateInRange(dateStr: string, start: Date, end: Date) {
  const d = new Date(dateStr);
  return d >= start && d <= end;
}
function formatDate(date: Date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

// COLORS
const COLORS = ["#4f46e5", "#22c55e", "#facc15", "#ef4444"];

// Card component
function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded p-4 flex flex-col items-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-semibold text-[#3C5773]">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");

  const [startDate, endDate] = useMemo(() => getDateRange(dateRange), [dateRange]);

  const usersInRange = useMemo(
    () => MOCK_USERS.filter((u) => dateInRange(u.registeredAt, startDate, endDate)),
    [startDate, endDate]
  );

  const totalUsers = MOCK_USERS.length;
  const activeUsers = MOCK_USERS.filter((u) => u.active).length;
  const inactiveUsers = totalUsers - activeUsers;
  const newUsers = usersInRange.length;

  // User Growth Data for line chart
  const growthData = useMemo(() => {
    if (dateRange === "all") {
      const monthCounts: Record<string, number> = {};
      MOCK_USERS.forEach(({ registeredAt }) => {
        const month = registeredAt.slice(0, 7); // YYYY-MM
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });
      return Object.entries(monthCounts)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([date, users]) => ({ date, users }));
    } else {
      const dayCounts: Record<string, number> = {};
      for (let d = startDate; d <= endDate; d = new Date(d.getTime() + 86400000)) {
        dayCounts[formatDate(d)] = 0;
      }
      MOCK_USERS.forEach(({ registeredAt }) => {
        if (dateInRange(registeredAt, startDate, endDate)) {
          dayCounts[registeredAt] = (dayCounts[registeredAt] || 0) + 1;
        }
      });
      return Object.entries(dayCounts)
        .sort(([a], [b]) => (a < b ? -1 : 1))
        .map(([date, users]) => ({ date, users }));
    }
  }, [dateRange, startDate, endDate]);

  // Plan analytics
  const plans = ["free", "weekly", "monthly", "yearly"];
  const usersPerPlan = plans.map((plan) => ({
    name: plan,
    value: MOCK_USERS.filter((u) => u.plan === plan).length,
  }));

  // Payments filtering and metrics
  const paymentsInRange = MOCK_PAYMENTS.filter((p) => dateInRange(p.date, startDate, endDate));
  const totalRevenue = paymentsInRange
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const revenueByPlan = plans.map((plan) => ({
    name: plan,
    revenue: paymentsInRange
      .filter((p) => p.plan === plan && p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
  }));

  const paymentsCompleted = paymentsInRange.filter((p) => p.status === "completed").length;
  const paymentsFailed = paymentsInRange.filter((p) => p.status === "failed").length;

  const ARPU = activeUsers === 0 ? 0 : totalRevenue / activeUsers;

  // System usage data (records uploaded)
  const recordsInRange = MOCK_RECORDS.filter((r) => dateInRange(r.createdAt, startDate, endDate));
  const totalRecords = recordsInRange.length;
  const avgUsagePerUser = totalUsers === 0 ? 0 : totalRecords / totalUsers;

  // Usage over time for area chart (by day)
  const usageOverTime = useMemo(() => {
    const usageCounts: Record<string, number> = {};
    for (let d = startDate; d <= endDate; d = new Date(d.getTime() + 86400000)) {
      usageCounts[formatDate(d)] = 0;
    }
    recordsInRange.forEach(({ createdAt }) => {
      usageCounts[createdAt] = (usageCounts[createdAt] || 0) + 1;
    });
    return Object.entries(usageCounts)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }, [recordsInRange, startDate, endDate]);

  return (
    <div className=" mx-auto">
      {/* Date Range Selector */}
      <div className="flex justify-end mb-6">
        <select
          className="border rounded p-2"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          aria-label="Select date range"
        >
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* User Metrics Cards */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 border-b pb-2 text-[#3C5773]">User Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
          <StatCard title="Total Users" value={totalUsers} />
          <StatCard title="Active Users" value={activeUsers} />
          <StatCard title="Inactive Users" value={inactiveUsers} />
          <StatCard title={`New Users (${dateRange})`} value={newUsers} />
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

      {/* Subscription / Plan Analytics */}
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

      {/* Financial Metrics */}
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

      {/* System Usage / Engagement */}
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
    </div>
  );
}
