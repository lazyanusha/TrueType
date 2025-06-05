import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "../../utils/useAuth";

interface User {
  id: number;
  full_name: string;
  email: string;
  subscription_status: string;
  subscription_start: string | null;
  subscription_expiry: string | null;
  plan_name: string | null;
}

interface Plan {
  id: number;
  name: string;
}

const USERS_PER_PAGE = 20;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [updatedUser, setUpdatedUser] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { user, loading } = useAuth();
  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const fetchUsers = async () => {
    if (!token || !user || user.roles !== "admin") return;
    try {
      const res = await fetch("http://localhost:8000/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchPlans = async () => {
    if (!token || !user || user.roles !== "admin") return;
    try {
      const res = await fetch("http://localhost:8000/plans/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPlans(data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  useEffect(() => {
    if (!loading && user?.roles === "admin") {
      fetchUsers();
      fetchPlans();
    }
  }, [loading, user]);

  const handleEditClick = (user: User) => {
    setEditId(user.id);
    setUpdatedUser({ ...user });
  };

  const saveEdit = async () => {
    try {
      const selectedPlan = plans.find(
        (plan) => plan.name === updatedUser.plan_name
      );
      const expiryDate =
        updatedUser.subscription_expiry &&
        updatedUser.subscription_expiry !== ""
          ? new Date(updatedUser.subscription_expiry).toISOString()
          : null;

      const payload = {
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        subscription_status: updatedUser.subscription_status,
        subscription_expiry: expiryDate,
        plan_id: selectedPlan ? selectedPlan.id : null,
      };

      const res = await fetch(`http://localhost:8000/users/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        console.error("Update failed:", errorData);

        // Log missing fields more clearly
        if (errorData.detail) {
          errorData.detail.forEach((err: any) => {
            console.error("Missing field:", err.loc?.[1], "|", err.msg);
          });
        }
      }
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editId
              ? {
                  ...u,
                  ...payload,
                  plan_name: selectedPlan ? selectedPlan.name : null,
                }
              : u
          )
        );
        setEditId(null);
      } else {
        const errorData = await res.json();
        console.error("Update failed:", errorData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => setEditId(null);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user || user.roles !== "admin") return <p>Unauthorized</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Manage Users</h1>

      <input
        type="text"
        placeholder="Search by name or email"
        className="border border-gray-300 rounded-md p-2 mb-4 w-full max-w-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-blue-100 text-gray-700 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="px-6">Plan</th>
              <th className="p-2 px-6">Status</th>
              <th className="p-2 px-8">Start</th>
              <th className="p-2 px-8">Expiry</th>
              <th className="pl-14">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr
                key={user.id}
                className={`transition ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-blue-50`}
              >
                {editId === user.id ? (
                  <>
                    <td className="p-2">
                      <input
                        className="w-full"
                        value={updatedUser.full_name}
                        onChange={(e) =>
                          setUpdatedUser({
                            ...updatedUser,
                            full_name: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <input
                        className="w-full"
                        value={updatedUser.email}
                        onChange={(e) =>
                          setUpdatedUser({
                            ...updatedUser,
                            email: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="p-2 px-6">
                      <select
                        className="w-full px-3 py-1 rounded"
                        value={updatedUser.plan_name || ""}
                        onChange={(e) =>
                          setUpdatedUser({
                            ...updatedUser,
                            plan_name: e.target.value,
                          })
                        }
                      >
                        <option value="">None</option>
                        {plans.map((plan) => (
                          <option key={plan.id} value={plan.name}>
                            {plan.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 px-6">
                      <select
                        className="w-full px-3 py-1 rounded "
                        value={updatedUser.subscription_status}
                        onChange={(e) =>
                          setUpdatedUser({
                            ...updatedUser,
                            subscription_status: e.target.value,
                          })
                        }
                      >
                        <option value="inactive">Inactive</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="none">None</option>
                      </select>
                    </td>
                    <td className="p-2 px-8">
                      {updatedUser.subscription_start
                        ? format(
                            new Date(updatedUser.subscription_start),
                            "yyyy-MM-dd"
                          )
                        : "-"}
                    </td>
                    <td className="p-2 px-8">
                      <input
                        type="date"
                        className="w-full px-3 py-1 rounded"
                        value={updatedUser.subscription_expiry || ""}
                        onChange={(e) =>
                          setUpdatedUser({
                            ...updatedUser,
                            subscription_expiry: e.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="p-2">
                      <button
                        onClick={saveEdit}
                        className="text-blue-500 pr-6 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-600 pl-8 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{user.full_name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="px-6">{user.plan_name || "None"}</td>
                    <td className="p-2 px-6">{user.subscription_status}</td>
                    <td className="p-2 px-8">
                      {user.subscription_start
                        ? format(
                            new Date(user.subscription_start),
                            "yyyy-MM-dd"
                          )
                        : "-"}
                    </td>
                    <td className="p-2 px-8">
                      {user.subscription_expiry
                        ? format(
                            new Date(user.subscription_expiry),
                            "yyyy-MM-dd"
                          )
                        : "-"}
                    </td>
                    <td className="p-2 space-x-2">
                      <button
                        onClick={() => handleEditClick(user)}
                        className="text-green-500 pr-6 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 py-1 pl-8 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-1 rounded ${
                currentPage === num
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
