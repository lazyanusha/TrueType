import { useEffect, useState } from "react";
import AccountTab from "../../components/tabs/users/AccountTab";
import SubscriptionPlansTab from "../../components/tabs/admins/SubscriptionTab";

type UserDataType = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};

export default function AdminProfileTab() {
  const [userData, setUserData] = useState<UserDataType>({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [userId, setUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

    fetch("http://localhost:8000/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => {
        setUserId(data.id);
        setUserData({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || "",
          password: "",
        });
      })
      .catch((err) => {
        console.error(err);
        alert("Could not load profile");
      });
  }, []);

  if (userId === null) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-6 bg-white rounded shadow mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Admin Settings</h1>

      <div className="flex space-x-10 border-b mb-6">
        <button
          className={`pb-2 ${
            activeTab === "profile"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("profile")}
        >
          My Profile
        </button>
        <button
          className={`pb-2 ${
            activeTab === "subscriptions"
              ? "border-b-2 border-blue-500 font-semibold"
              : "text-gray-600"
          }`}
          onClick={() => setActiveTab("subscriptions")}
        >
          Subscription Plans
        </button>
      </div>

      {activeTab === "profile" && (
        <AccountTab
          userData={userData}
          setUserData={setUserData}
          userId={userId}
        />
      )}

      {activeTab === "subscriptions" && <SubscriptionPlansTab />}
    </div>
  );
}
