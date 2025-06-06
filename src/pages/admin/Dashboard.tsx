import  { useState, useMemo } from "react";
import { dateInRange, getDateRange } from "../../utils/daterange";
import UserMetrics from "../../components/admin_components/usermetrics";
import SubscriptionAnalytics from "../../components/admin_components/subscriptionmetrics";
import FinancialMetrics from "../../components/admin_components/financialmetrics";
import SystemUsage from "../../components/admin_components/usage";

// (Keep your MOCK_USERS, MOCK_PAYMENTS, MOCK_RECORDS, utils etc. here unchanged)

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
  const ARPU = totalUsers > 0 ? totalRevenue / totalUsers : 0;

  // System usage
  const recordsInRange = MOCK_RECORDS.filter((r) => dateInRange(r.date, startDate, endDate));
  const totalRecords = MOCK_RECORDS.length;
  const avgUsagePerUser =
    totalUsers > 0 ? (MOCK_RECORDS.length / totalUsers).toFixed(2) + " records/user" : "0";

  const usageOverTime = (() => {
    const usageByDate: Record<string, number> = {};
    for (let d = startDate; d <= endDate; d = new Date(d.getTime() + 86400000)) {
      usageByDate[formatDate(d)] = 0;
    }
    MOCK_RECORDS.forEach(({ date }) => {
      if (dateInRange(date, startDate, endDate)) {
        usageByDate[date] = (usageByDate[date] || 0) + 1;
      }
    });
    return Object.entries(usageByDate)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  })();

  return (
    <div className="p-8">
      <div className="mb-8">
        <label className="mr-4 font-semibold text-[#3C5773]">Date Range:</label>
        <select
          className="border rounded px-2 py-1"
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <UserMetrics
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        inactiveUsers={inactiveUsers}
        newUsers={newUsers}
        dateRange={dateRange}
        growthData={growthData}
      />

      <SubscriptionAnalytics usersPerPlan={usersPerPlan} />

      <FinancialMetrics
        totalRevenue={totalRevenue}
        paymentsCompleted={paymentsCompleted}
        paymentsFailed={paymentsFailed}
        ARPU={ARPU}
        revenueByPlan={revenueByPlan}
      />

      <SystemUsage
        totalRecords={totalRecords}
        avgUsagePerUser={avgUsagePerUser}
        usageOverTime={usageOverTime}
      />
    </div>
  );
}
