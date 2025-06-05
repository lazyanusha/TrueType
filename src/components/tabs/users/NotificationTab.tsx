import React from "react";
import { BellIcon } from "lucide-react";

type Notification = {
  id: number;
  message: string;
  date: string;
  read: boolean;
};

type Props = {
  userData: {
    emailNotifications: boolean;
    reportAlerts: boolean;
  };
  setUserData: React.Dispatch<
    React.SetStateAction<{
      emailNotifications: boolean;
      reportAlerts: boolean;
    }>
  >;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
};

const NotificationsTab = ({
  userData,
  setUserData,
  notifications,
  setNotifications,
}: Props) => {
  const handleToggle =
    (field: "emailNotifications" | "reportAlerts") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUserData((prev) => ({ ...prev, [field]: e.target.checked }));
    };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const handleSave = () => {
    console.log("Saving notification settings:", userData);
    // TODO: API call
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="font-medium text-gray-700">Email Notifications</label>
          <input
            type="checkbox"
            checked={userData.emailNotifications}
            onChange={handleToggle("emailNotifications")}
            className="h-5 w-9 rounded-full cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="font-medium text-gray-700">Receive Report Alerts</label>
          <input
            type="checkbox"
            checked={userData.reportAlerts}
            onChange={handleToggle("reportAlerts")}
            className="h-5 w-9 rounded-full cursor-pointer"
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
                <span className="text-xs text-gray-500">{notif.date}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-4 mt-4">
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
          >
            Mark All as Read
          </button>
          <button
            onClick={clearNotifications}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Clear All
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Update Notifications
      </button>
    </div>
  );
};

export default NotificationsTab;
