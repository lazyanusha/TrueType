import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const adminEmail = "admin@example.com";

  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      // Clear auth tokens, etc.
      // localStorage.removeItem("authToken");
      alert("Logging out...");
      navigate("/");
    }
  };

  return (
    <>
      {/* Sidebar - fixed on left */}
      <aside
        className="fixed top-0 left-0 h-screen bg-[#3C5773] text-white px-8 flex flex-col justify-between"
        style={{ width: "300px" }} // fixed width to match your design
      >
        <div>
          {/* Logo & Welcome */}
          <div className="mb-6">
            <Link to="/admin" className="flex items-center">
              <img src="/logo2.png" alt="Logo" className="w-50 h-auto -mt-10" />
            </Link>
            <p className="-mt-14 text-lg font-semibold pl-6">Welcome, Admin</p>
          </div>

          {/* Navigation */}
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

      {/* Main Content */}
      <main className="ml-[300px] bg-gray-50 min-h-screen flex flex-col">
        {/* Topbar */}
        <div className="flex justify-between items-center py-8 px-14 border-b bg-white">
          <h1 className="text-xl font-bold text-[#3C5773]">
           Administration Console
          </h1>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <span>{adminEmail}</span>
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
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="px-14 py-10 bg-[#f0f9ff] flex-grow overflow-auto">
          <Outlet />
        </div>
      </main>
      
    </>
  );
}
