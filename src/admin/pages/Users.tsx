import { useState } from "react";

interface Subscription {
  plan: string;
  startDate: string;
  expiryDate: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  subscription: Subscription;
}

export default function Users() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Alice",
      email: "alice@example.com",
      status: "active",
      subscription: {
        plan: "Monthly",
        startDate: "2025-04-01",
        expiryDate: "2025-04-30",
      },
    },
    {
      id: 2,
      name: "Bob",
      email: "bob@example.com",
      status: "inactive",
      subscription: {
        plan: "Yearly",
        startDate: "2024-05-01",
        expiryDate: "2025-04-30",
      },
    },
    {
      id: 3,
      name: "Charlie",
      email: "charlie@example.com",
      status: "active",
      subscription: {
        plan: "Monthly",
        startDate: "2025-05-01",
        expiryDate: "2025-05-31",
      },
    },
  ]);

  const [editId, setEditId] = useState<number | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  const plans = ["Monthly", "Yearly", "Weekly", "Trial"];

  const filteredUsers = users.filter((u) =>
    [u.name, u.email, u.status, u.subscription.plan, u.subscription.startDate, u.subscription.expiryDate]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const startEdit = (user: User) => {
    setEditId(user.id);
    setEditedUser({ ...user });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditedUser({});
  };

  const saveEdit = () => {
    setUsers((prev) =>
      prev.map((u) => (u.id === editId ? { ...(editedUser as User) } : u))
    );
    setEditId(null);
    setEditedUser({});
  };

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-semibold mb-4">All Users</h1>

      <input
        type="text"
        placeholder="Search by name, email, status or subscription"
        className="mb-8 w-full p-2 border border-gray-300 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2 text-left">Name</th>
            <th className="border border-gray-300 p-2 text-left">Email</th>
            <th className="border border-gray-300 p-2 text-left">Status</th>
            <th className="border border-gray-300 p-2 text-left">Plan</th>
            <th className="border border-gray-300 p-2 text-left">Start Date</th>
            <th className="border border-gray-300 p-2 text-left">Expiry Date</th>
            <th className="border border-gray-300 p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">
                  {editId === u.id ? (
                    <input
                      className="w-full border p-1 rounded"
                      value={editedUser.name || ""}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, name: e.target.value })
                      }
                    />
                  ) : (
                    u.name
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editId === u.id ? (
                    <input
                      className="w-full border p-1 rounded"
                      value={editedUser.email || ""}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                    />
                  ) : (
                    u.email
                  )}
                </td>
                <td className="border border-gray-300 p-2 capitalize">
                  {editId === u.id ? (
                    <select
                      className="w-full border p-1 rounded"
                      value={editedUser.status || ""}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, status: e.target.value })
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`font-semibold ${
                        u.status === "active"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {u.status}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editId === u.id ? (
                    <select
                      className="w-full border p-1 rounded"
                      value={editedUser.subscription?.plan || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          subscription: {
                            ...(editedUser.subscription || u.subscription),
                            plan: e.target.value,
                          },
                        })
                      }
                    >
                      {plans.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  ) : (
                    u.subscription.plan
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editId === u.id ? (
                    <input
                      type="date"
                      className="w-full border p-1 rounded"
                      value={editedUser.subscription?.startDate || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          subscription: {
                            ...(editedUser.subscription || u.subscription),
                            startDate: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    u.subscription.startDate
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editId === u.id ? (
                    <input
                      type="date"
                      className="w-full border p-1 rounded"
                      value={editedUser.subscription?.expiryDate || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          subscription: {
                            ...(editedUser.subscription || u.subscription),
                            expiryDate: e.target.value,
                          },
                        })
                      }
                    />
                  ) : (
                    u.subscription.expiryDate
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editId === u.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="text-green-600 hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-gray-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => startEdit(u)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center p-4">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
