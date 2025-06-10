import { useEffect, useState } from "react";
import { useAuth } from "../../utils/useAuth";

interface User {
  id: number;
  full_name: string;
  email: string;
  subscription_status: string;
  subscription_start: string | null;
  subscription_expiry: string | null;
  plan_name: string | null;
  phone: string | null;
}

interface Plan {
  id: number;
  name: string;
}

const USERS_PER_PAGE = 20;

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [, setPlans] = useState<Plan[]>([]);
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
    <div>
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
              <th className="p-2">S.No</th>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="px-2">Phone Number</th>
              <th className="px-6">Plan</th>
              <th className="p-2 px-6">Status</th>
              <th className="pl-14" colSpan={3}>
                Actions
              </th>
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
                <td className="px-3 py-2 text-center">
                  {(currentPage - 1) * USERS_PER_PAGE + index + 1}
                </td>
                <td className="p-2">{user.full_name}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.phone}</td>
                <td className="px-6">{user.plan_name || "None"}</td>
                <td className="p-2 px-6">
                  {user.subscription_status
                    ? user.subscription_status.charAt(0).toUpperCase() +
                      user.subscription_status.slice(1)
                    : "-"}
                </td>
                <td className="p-2 text-center" colSpan={3}>
                  <a
                    href={`users/${user.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </td>
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
