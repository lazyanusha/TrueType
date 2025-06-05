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
        const res = await fetch(`http://localhost:8000/users/${user.id}`, {
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
    <div className="max-w-7xl  mx-auto px-4 py-10">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="w-full shadow-xl min-h-[600px] rounded-xl p-8 md:p-10 bg-white"
      >
        <h1 className="text-3xl font-semibold mb-6">User Settings</h1>
        <Tabs defaultValue="account">
          <TabsList className="grid grid-cols-1 w-full mb-6 gap-2">
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <AccountTab
              userData={userData}
              setUserData={setUserData}
              userId={user?.id ?? 0}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default UserSettingsPage;
