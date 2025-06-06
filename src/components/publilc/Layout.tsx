import { useState, useEffect, useRef, useContext } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { AuthContext } from "../../auth/auth_context";

const Layout = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[#f0f9ff] text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b py-2 border-gray-200">
        <div className="max-w-7xl mx-auto sm:pr-4 lg:pr-4">
          <div className="flex justify-between items-center h-20">
            {/* Left - Logo */}
            <div className="flex items-center text-blue-600 hover:text-blue-500 transition">
              <Link to="/" className="flex items-center">
                <img
                  src="logo.png"
                  alt="TrueType Logo"
                  className="h-19 w-auto"
                />
              </Link>
            </div>

            {/* Center nav links */}
            <div className="hidden md:flex space-x-12 text-lg font-medium">
              {[
                { to: "/", label: "Home" },
                { to: "/features", label: "Features" },
                { to: "/how-it-works", label: "How It Works" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="relative text-gray-700 hover:text-blue-600 transition-colors duration-300"
                >
                  {label}
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-blue-600 scale-x-0 origin-left transition-transform duration-300 hover:scale-x-100"></span>
                </Link>
              ))}
            </div>

            {/* Right - Auth links or user dropdown */}
            <div className="hidden md:flex space-x-8 text-lg font-medium relative">
              {user && user.roles?.toLowerCase() !== "admin" ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none"
                  >
                    <span>{user.email}</span>
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-50">
                      <Link
                        to="/usersetting"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-600 hover:text-white"
                      >
                        Settings
                      </Link>
                      <Link
                        to="/subscription"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-600 hover:text-white"
                      >
                        Payment
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-600 hover:text-white"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="text-gray-700 hover:text-blue-600 transition-colors duration-300"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
              aria-label="Toggle menu"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col space-y-3 p-4 text-gray-700 font-semibold">
              {[
                { to: "/", label: "Home" },
                { to: "/features", label: "Features" },
                { to: "/how-it-works", label: "How It Works" },
                { to: "/contact", label: "Contact" },
                ...(user && user.roles?.toLowerCase() !== "admin"
                  ? [{ to: "/usersetting", label: "Settings" }]
                  : [
                      { to: "/login", label: "Log In" },
                      { to: "/register", label: "Register" },
                    ]),
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              {/* Show logout button if user logged in */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-left hover:text-blue-600 transition-colors duration-200"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
