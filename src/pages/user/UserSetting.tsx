import { useState, useEffect } from "react";

import { BellIcon, FileTextIcon } from "lucide-react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "../../components/user_component/Tabs";
import Snowing from "../../components/user_component/Snowing";
import { motion } from "framer-motion";

// Dummy UI components for illustration — replace with your actual components or UI library
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {children}
  </label>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full border border-gray-300 rounded px-3 py-2"
  />
);
const Button = ({
  children,
  variant,
  className,
  ...props
}: {
  children: React.ReactNode;
  variant?: "outline" | "destructive";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const base = "px-4 py-2 rounded text-sm font-medium focus:outline-none";
  const variants = {
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      className={`${base} ${
        variant ? variants[variant] : "bg-blue-600 text-white hover:bg-blue-700"
      } ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
};
const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onCheckedChange(e.target.checked)}
    className="h-5 w-9 rounded-full cursor-pointer"
  />
);

const UserSettingsPage = () => {
  const [userData, setUserData] = useState({
    email: "",
    fullName: "",
    password: "",
    citationStyle: "APA",
    darkMode: false,
    emailNotifications: true,
    reportAlerts: true,
  });

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Your report is ready.",
      date: "May 30, 2025",
      read: false,
    },
    {
      id: 2,
      message: "New feature: Citation Checker!",
      date: "May 28, 2025",
      read: false,
    },
    {
      id: 3,
      message: "Subscription renewed.",
      date: "May 20, 2025",
      read: true,
    },
  ]);

  const [reports] = useState([
    { id: 101, title: "Plagiarism Report - Essay 1", date: "May 29, 2025" },
    {
      id: 102,
      title: "Plagiarism Report - Research Paper",
      date: "May 21, 2025",
    },
  ]);

  useEffect(() => {
    const fetchUserData = async () => {
      // Simulate API call
      const fetchedData = {
        email: "user@example.com",
        fullName: "John Doe",
        citationStyle: "APA",
        darkMode: false,
        emailNotifications: true,
        reportAlerts: true,
      };
      setUserData((prev) => ({ ...prev, ...fetchedData }));
    };

    fetchUserData();
  }, []);

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setUserData({ ...userData, [field]: e.target.value });
    };

  const handleSwitchChange = (field: string) => (value: boolean) => {
    setUserData({ ...userData, [field]: value });
  };

  const handleSave = () => {
    console.log("Saving user settings:", userData);
    // TODO: API call to save user data
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className=" w-full shadow-xl rounded-xl p-8 md:p-10"
      >
        <h1 className="text-3xl font-semibold mb-6">User Settings</h1>
        <Tabs defaultValue="account">
          <TabsList className="grid grid-cols-5 w-full mb-6 gap-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="space-y-8 mt-8">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userData.email}
                  onChange={handleInputChange("email")}
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  value={userData.fullName}
                  onChange={handleInputChange("fullName")}
                />
              </div>
              <div>
                <Label>Change Password</Label>
                <Input
                  type="password"
                  placeholder="New Password"
                  value={userData.password}
                  onChange={handleInputChange("password")}
                />
              </div>
              <Button className="mt-4" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="subscription">
            <div className="space-y-4">
              <p>
                Plan: <strong>Pro</strong>
              </p>
              <p>
                Status: <span className="text-green-600">Active</span>
              </p>
              <Button>Manage Billing</Button>
            </div>
          </TabsContent>

          <TabsContent value="preferences">
            <div className="space-y-4">
              <div>
                <Label>Preferred Citation Style</Label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={userData.citationStyle}
                  onChange={handleInputChange("citationStyle")}
                >
                  <option>APA</option>
                  <option>MLA</option>
                  <option>Chicago</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Dark Mode</Label>
                <Switch
                  checked={userData.darkMode}
                  onCheckedChange={handleSwitchChange("darkMode")}
                />
              </div>
              <Button className="mt-4" onClick={handleSave}>
                Save Preferences
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Email Notifications</Label>
                  <Switch
                    checked={userData.emailNotifications}
                    onCheckedChange={handleSwitchChange("emailNotifications")}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Receive Report Alerts</Label>
                  <Switch
                    checked={userData.reportAlerts}
                    onCheckedChange={handleSwitchChange("reportAlerts")}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
                  <BellIcon className="w-5 h-5" /> Recent Notifications
                </h2>
                {notifications.length === 0 ? (
                  <p className="text-gray-500">No notifications.</p>
                ) : (
                  <ul className="space-y-3 max-h-64 overflow-auto">
                    {notifications.map((notif) => (
                      <li
                        key={notif.id}
                        className={`border rounded border-gray-300 px-4 py-2 shadow-sm ${
                          notif.read ? "bg-gray-100" : "bg-white"
                        }`}
                      >
                        <p className="text-sm">{notif.message}</p>
                        <span className="text-xs text-gray-500">
                          {notif.date}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-4 mt-4">
                  <Button variant="outline" onClick={markAllAsRead}>
                    Mark All as Read
                  </Button>
                  <Button variant="destructive" onClick={clearNotifications}>
                    Clear All
                  </Button>
                </div>
              </div>

              <Button className="mt-6" onClick={handleSave}>
                Update Notifications
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="reports">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileTextIcon className="w-5 h-5" /> Past Reports
              </h2>
              <ul className="space-y-3 max-h-64 overflow-auto">
                {reports.map((report) => (
                  <li
                    key={report.id}
                    className="border rounded border-gray-300 px-4 py-2 bg-white shadow-sm"
                  >
                    <p className="font-medium">{report.title}</p>
                    <span className="text-xs text-gray-500">{report.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default UserSettingsPage;
