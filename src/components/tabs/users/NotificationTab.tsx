import { useEffect, useState } from "react";
import axios from "axios";

// Define the notification type
type Notification = {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");
      try {
        const res = await axios.get("http://localhost:8000/notifications", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNotifications(res.data);
        // or res.data.notifications if backend returns { notifications: [...] }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-2">Notifications</h2>
      {notifications.length === 0 ? (
        <p>No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((note) => (
            <li key={note.id} className="bg-gray-100 p-2 rounded">
              <p>{note.message}</p>
              <small className="text-gray-500">
                {new Date(note.created_at).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
