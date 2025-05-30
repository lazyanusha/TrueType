import { useState } from "react";

interface AuditLogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  status: "Success" | "Failure";
}

export default function AdminSettings() {
  const tabs = ["Profile", "General", "Billing", "Security", "System"];
  const [activeTab, setActiveTab] = useState("General");

  const [settings, setSettings] = useState({
    defaultPlan: "Monthly",
    trialDays: 7,
    gracePeriod: 3,
    autoRenewal: true,
    maintenanceMode: false,
  });

  const [admin, setAdmin] = useState({
    name: "Admin User",
    email: "admin@example.com",
    password: "",
  });

  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const handleChange = (field: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  async function fetchAuditLogs() {
    setLoadingLogs(true);
    setShowAuditLogs(true);
    // Simulate fetching logs
    await new Promise((r) => setTimeout(r, 1200));
    setAuditLogs([
      {
        id: 1,
        timestamp: "2025-05-30 09:15:32",
        user: "Admin User",
        action: "Logged in",
        status: "Success",
      },
      {
        id: 2,
        timestamp: "2025-05-29 17:45:10",
        user: "System",
        action: "Cleared cache",
        status: "Success",
      },
      {
        id: 3,
        timestamp: "2025-05-28 12:10:05",
        user: "Admin User",
        action: "Updated subscription plan defaults",
        status: "Success",
      },
      {
        id: 4,
        timestamp: "2025-05-27 14:03:22",
        user: "Admin User",
        action: "Restarted services",
        status: "Success",
      },
      {
        id: 5,
        timestamp: "2025-05-26 08:27:43",
        user: "System",
        action: "Backup completed",
        status: "Success",
      },
    ]);
    setLoadingLogs(false);
  }

  return (
    <div className=" mx-auto ">
      <h1 className="text-2xl font-semibold mb-6">Admin Settings</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 -mb-px font-medium border-b-2 transition ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "Profile" && (
        <div className="bg-white p-6 rounded shadow border  border-gray-300/30 grid gap-4">
          <label className="block">
            <span className="text-gray-700">Full Name</span>
            <input
              type="text"
              value={admin.name}
              onChange={(e) => setAdmin({ ...admin, name: e.target.value })}
              className="mt-1 block w-full p-2 border border-gray-300/30 rounded"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Email</span>
            <input
              type="email"
              value={admin.email}
              onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
              className="mt-2 mb-2 block w-full p-2 border  border-gray-300 rounded"
            />
          </label>

          <label className="block">
            <span className="text-gray-700">Change Password</span>
            <input
              type="password"
              placeholder="New Password"
              value={admin.password}
              onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
            />
          </label>
        </div>
      )}

      {/* General, Billing, Security, System */}
      {activeTab !== "Profile" && (
        <div className="bg-white p-6 rounded shadow border border-gray-300/30">
          {activeTab === "General" && (
            <div className="grid gap-4">
              <label className="block">
                <span className="text-gray-700">Default Subscription Plan</span>
                <select
                  value={settings.defaultPlan}
                  onChange={(e) => handleChange("defaultPlan", e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded"
                >
                  <option value="Trial">Trial</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </label>

              <label className="block">
                <span className="text-gray-700">Trial Duration (days)</span>
                <input
                  type="number"
                  value={settings.trialDays}
                  onChange={(e) =>
                    handleChange("trialDays", Number(e.target.value))
                  }
                  className="mt-2 mb-2 block w-full p-2 border border-gray-300 rounded"
                />
              </label>

              <label className="block">
                <span className="text-gray-700">Grace Period (days)</span>
                <input
                  type="number"
                  value={settings.gracePeriod}
                  onChange={(e) =>
                    handleChange("gracePeriod", Number(e.target.value))
                  }
                  className="mt-1 block w-full p-2  border-gray-300 border rounded"
                />
              </label>
            </div>
          )}

          {activeTab === "Billing" && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoRenewal}
                onChange={() =>
                  handleChange("autoRenewal", !settings.autoRenewal)
                }
                id="autoRenewal"
                className="cursor-pointer"
              />
              <label
                htmlFor="autoRenewal"
                className="text-gray-700 cursor-pointer"
              >
                Enable Auto-Renewal by Default
              </label>
            </div>
          )}

          {activeTab === "Security" && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={() =>
                  handleChange("maintenanceMode", !settings.maintenanceMode)
                }
                id="maintenanceMode"
                className="cursor-pointer"
              />
              <label
                htmlFor="maintenanceMode"
                className="text-gray-700 cursor-pointer"
              >
                Enable Maintenance Mode (used for platform downtime)
              </label>
            </div>
          )}

          {activeTab === "System" && (
            <div className="grid gap-4 text-gray-700">
              <SystemActionButton
                label="Clear Cache"
                onAction={async () => {
                  console.log("Clearing cache...");
                  await simulateAction();
                }}
              />
              <SystemActionButton
                label="Restart Services"
                onAction={async () => {
                  console.log("Restarting services...");
                  await simulateAction();
                }}
              />
              <SystemActionButton
                label="Backup Data"
                onAction={async () => {
                  console.log("Backing up data...");
                  await simulateAction();
                }}
              />
              <SystemActionButton
                label="View Audit Logs"
                onAction={fetchAuditLogs}
              />
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      <div className="text-right mt-6">
        <button
          onClick={() => {
            console.log("Saving settings:", settings);
            alert("Settings saved successfully!");
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition"
        >
          Save Settings
        </button>
      </div>

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          aria-modal="true"
          role="dialog"
          aria-labelledby="audit-logs-title"
          onClick={() => setShowAuditLogs(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="audit-logs-title"
              className="text-xl font-semibold mb-4 text-gray-800"
            >
              Audit Logs
            </h2>

            {loadingLogs ? (
              <p className="text-center text-gray-600">Loading logs...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-center text-gray-600">No audit logs found.</p>
            ) : (
              <table className="w-full text-left border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2">Timestamp</th>
                    <th className="border border-gray-300 p-2">User</th>
                    <th className="border border-gray-300 p-2">Action</th>
                    <th className="border border-gray-300 p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2 font-mono text-sm">
                        {log.timestamp}
                      </td>
                      <td className="border border-gray-300 p-2">{log.user}</td>
                      <td className="border border-gray-300 p-2">
                        {log.action}
                      </td>
                      <td
                        className={`border border-gray-300 p-2 font-semibold ${
                          log.status === "Success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {log.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <button
              onClick={() => setShowAuditLogs(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 font-bold text-lg"
              aria-label="Close audit logs"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SystemActionButton({
  label,
  onAction,
}: {
  label: string;
  onAction: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleClick = async () => {
    setLoading(true);
    setStatus("idle");
    try {
      await onAction();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="flex items-center justify-between border border-gray-300/30 p-3 rounded-md shadow-sm">
      <span>{label}</span>
      <div className="flex items-center gap-3">
        {status === "success" && <span className="text-green-600">✓ Done</span>}
        {status === "error" && <span className="text-red-600">✕ Failed</span>}
        <button
          onClick={handleClick}
          disabled={loading}
          className={`px-4 py-1 text-sm rounded ${
            loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Working..." : "Run"}
        </button>
      </div>
    </div>
  );
}

async function simulateAction() {
  return new Promise<void>((resolve) => setTimeout(resolve, 1000));
}
