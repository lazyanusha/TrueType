import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

interface Subscription {
  plan_name: string;
  start_date: string;
  expiry_date: string;
  status: string; 
}

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  roles: string;
  subscription_status: string;
  subscriptions?: Subscription[];
}

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    roles: "",
    subscription_status: "",
  });

  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  useEffect(() => {
    if (!id) return;
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`http://localhost:8000/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData: User = res.data;
        setUser(userData);
        setFormData({
          full_name: userData.full_name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          roles: userData.roles || "",
          subscription_status: userData.subscription_status || "",
        });
      } catch (err) {
        setError("Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setError(null);
    try {
      await axios.patch(
        `http://localhost:8000/users/${id}`,
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          roles: formData.roles,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser((prev) => (prev ? { ...prev, ...formData } : prev));
      setEditing(false);
    } catch (err) {
      setError("Failed to update user");
    }
  };

  const handleDelete = async () => {
    setError(null);
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:8000/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User deleted");
      navigate(-1);
    } catch (err) {
      setError("Failed to delete user");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!user) return <div className="p-4">No user found</div>;

  return (
    <div className="mx-auto">
      <button
        onClick={() => navigate("/admin/users")}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Users List
      </button>
      <h1 className="text-2xl font-bold mb-4">User Details</h1>

      <div className="space-y-4">
        {["full_name", "email", "phone", "roles", "subscription_status"].map(
          (field) => (
            <div key={field}>
              <label className="block text-m font-medium text-gray-700 capitalize">
                {field.replace(/_/g, " ")}
              </label>
              {editing && field !== "subscription_status" ? (
                <input
                  id={field}
                  name={field}
                  type={field === "email" ? "email" : "text"}
                  value={formData[field as keyof typeof formData] || ""}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {formData[field as keyof typeof formData]}
                </p>
              )}
            </div>
          )
        )}

        <div className="flex gap-4 mt-4">
          {editing ? (
            <>
              <button
                onClick={handleUpdate}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded ml-8"
          >
            Delete
          </button>
        </div>
      </div>

      {user.subscriptions && user.subscriptions.length > 0 && (
        <div className="mt-6 max-w-5xl">
          <h3 className="text-xl font-semibold mb-4">Subscriptions</h3>
          <ul className="space-y-4">
            {user.subscriptions.map((sub, i) => {
              const start = new Date(sub.start_date);
              const end = new Date(sub.expiry_date);

              // Color classes based on backend-provided status
              let statusClasses = "";
              if (sub.status === "currently active") {
                statusClasses =
                  "text-green-700 border border-green-300 bg-green-50";
              } else if (sub.status === "upcoming") {
                statusClasses =
                  "text-blue-700 border border-blue-300 bg-blue-50";
              } else {
                statusClasses =
                  "text-gray-600 border border-gray-300 bg-gray-50";
              }

              return (
                <li
                  key={i}
                  className={`p-4 rounded-md shadow-sm bg-white border ${statusClasses} flex justify-between gap-1`}
                >
                  <div className="flex flex-col gap-4">
                    <p>
                      <strong>Plan: </strong> {sub.plan_name}
                    </p>
                    <p>
                      <strong>Start: </strong> {start.toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Expiry: </strong> {end.toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="inline-block text-sm font-semibold px-3 py-1 rounded-full">
                        {sub.status.charAt(0).toUpperCase() +
                          sub.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
