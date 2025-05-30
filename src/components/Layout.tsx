import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Footer from "./Footer";

const Layout = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f9ff] text-gray-800">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Left - Logo */}
            <div className="flex items-center text-blue-600 hover:text-blue-500 transition">
              <Link to="/" className="flex items-center">
                <img
                  src="logo.png"
                  alt="TrueType Logo"
                  className="h-16 w-auto"
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

            {/* Right - Auth links */}
            <div className="hidden md:flex space-x-8 text-lg font-medium">
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
                { to: "/login", label: "Log In" },
                { to: "/register", label: "Register" },
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
