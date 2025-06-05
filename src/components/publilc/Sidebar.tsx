import { useState } from "react";
import { Link, Outlet, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../utils/useAuth";

export default function Sidebar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, loading , setUser} = useAuth();

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-[#3C5773]">
        Loading...
      </div>
    );
  }

  if (!user || !user.roles?.includes("admin")) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;

    const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");
    if (!token) {
      console.error("No token found in storage");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/users/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Remove tokens with correct keys
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("user");

        // Clear user from context to update UI
        setUser(null);

        navigate("/");
      } else {
        const error = await res.json();
        console.error("Failed to logout:", error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <aside
        className="fixed top-0 left-0 h-screen bg-[#3C5773] text-white px-8 flex flex-col justify-between"
        style={{ width: "300px" }}
      >
        <div>
          <div className="mb-6">
            <Link to="/admin" className="flex items-center">
              <img src="/logo2.png" alt="Logo" className="w-50 h-auto -mt-10" />
            </Link>
            <p className="-mt-14 text-lg font-semibold pl-6">
              Welcome, {user?.full_name}
            </p>
          </div>

          <nav className="flex flex-col pt-6 space-y-2 pl-4 pr-2">
            {[
              { to: "/admin/users", label: "Users" },
              { to: "/admin/payments", label: "Payments" },
              { to: "/admin/resources", label: "Resources" },
              { to: "/admin/tests", label: "Test Records" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-2 rounded-md transition duration-300 ease-in-out text-white hover:bg-[#2e455d] hover:translate-x-1"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <main className="ml-[300px] bg-gray-50 min-h-screen flex flex-col">
        <div className="flex justify-between items-center py-8 px-14 border-b bg-white">
          <h1 className="text-xl font-bold text-[#3C5773]">
            Administration Console
          </h1>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <span>{user?.email}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 py-2 bg-white border rounded-md shadow-md z-50">
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 w-full text-center text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block px-4 py-2 w-full text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-14 py-10 bg-[#f0f9ff] flex-grow overflow-auto">
          <Outlet />
        </div>
      </main>
    </>
  );
}
