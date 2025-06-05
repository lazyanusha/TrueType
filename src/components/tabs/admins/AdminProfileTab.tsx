import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminProfileTab() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        setFormData({
          full_name: res.data.full_name,
          email: res.data.email,
          phone: res.data.phone || "",
          password: "",
        });
      })
      .catch(() => setMessage("Failed to fetch profile"));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    try {
      await axios.patch(`/api/users/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Update failed");
    }
  };

  return (
    <div className="p-6 space-y-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold">My Profile</h2>
      <div className="grid gap-4 max-w-md">
        <input
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Full Name"
          className="p-2 border border-gray-300 rounded"
        />
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="p-2 border border-gray-300 rounded"
        />
        <input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="p-2 border border-gray-300 rounded"
        />
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="New Password"
          className="p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Profile
        </button>
        {message && <p className="text-sm text-gray-600">{message}</p>}
      </div>
    </div>
  );
}
