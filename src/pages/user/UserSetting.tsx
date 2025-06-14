import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import Snowing from "../../components/user_component/Snowing";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/user_component/Tabs";
import AccountTab from "../../components/tabs/users/AccountTab";
import { useAuth } from "../../utils/useAuth";
import SubscriptionTab from "../../components/tabs/users/SubscriptionTab";
import NotificationsTab from "../../components/tabs/users/NotificationTab";
import ReportsTab from "../../components/tabs/users/ReportTab";

const UserSettingsPage = () => {
  const { user } = useAuth(); // contains id, roles, etc.

  const [userData, setUserData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const token =
          localStorage.getItem("access_token") ||
          sessionStorage.getItem("access_token");
        const res = await fetch(`http://localhost:8000/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user");

        const data = await res.json();

        setUserData({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
          password: "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-10">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full shadow-2xl rounded-2xl p-8 md:p-12 bg-white border border-gray-100"
      >
        <h1 className="text-4xl font-bold mb-8 text-gray-800">User Settings</h1>

        <Tabs defaultValue="account">
          <TabsList className="grid grid-cols-4 w-full mb-8 gap-4">
            <TabsTrigger
              value="account"
              className="py-3 text-lg font-medium rounded-xl shadow-md bg-gray-50 hover:bg-gray-100 transition-all"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="py-3 text-lg font-medium rounded-xl shadow-md bg-gray-50 hover:bg-gray-100 transition-all"
            >
              Subscription
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="py-3 text-lg font-medium rounded-xl shadow-md bg-gray-50 hover:bg-gray-100 transition-all"
            >
              Notifications
            </TabsTrigger>

            <TabsTrigger
              value="reports"
              className="py-3 text-lg font-medium rounded-xl shadow-md bg-gray-50 hover:bg-gray-100 transition-all"
            >
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="mt-6">
            <AccountTab
              userData={userData}
              setUserData={setUserData}
              userId={user?.id ?? 0}
            />
          </TabsContent>

          <TabsContent value="subscription" className="mt-6">
            <SubscriptionTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default UserSettingsPage;
