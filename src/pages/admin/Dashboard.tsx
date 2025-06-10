import FinancialMetrics from "../../components/admin_components/financialmetrics";
import SubscriptionAnalytics from "../../components/admin_components/subscriptionmetrics";
import SystemUsage from "../../components/admin_components/usage";
import UserMetrics from "../../components/admin_components/usermetrics";

export default function Dashboard() {
  return (
    <div className="space-y-12">
      <UserMetrics />
      <FinancialMetrics />
      <SystemUsage />
      <SubscriptionAnalytics />
    </div>
  );
}
