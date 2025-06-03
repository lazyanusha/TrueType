// src/pages/login.tsx

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/auth_context";
import Snowing from "../components/Snowing";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { fetchUserProfile, loginUser } from "../../api/login";

const LoginPage: React.FC = () => {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const { access_token, refresh_token } = await loginUser(
        formData.email,
        formData.password,
        formData.rememberMe
      );

      const storage = formData.rememberMe ? localStorage : sessionStorage;
      storage.setItem("access_token", access_token);
      storage.setItem("refresh_token", refresh_token);

      const userData = await fetchUserProfile(access_token);
      setUser(userData);

      // Redirect based on role
      if (userData.roles?.toLowerCase() === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred");
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="min-h-[calc(90vh-100px)] bg-[#f0f9ff] flex items-center justify-center">
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 md:p-10"
      >
        <div className="text-center mb-8">
          <img src="logo.png" alt="TrueType Logo" className="mx-auto h-24" />
          <p className="text-lg text-gray-600">Welcome to TrueType</p>
          <p className="text-sm text-gray-500">
            Sign in or create a new account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between mt-2">
              <label className="flex items-center text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="mr-2 rounded border-gray-300 text-blue-600"
                />
                Remember Me
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium shadow-md transition"
          >
            Log In
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            New here?{" "}
            <a href="/register" className="text-blue-600 hover:underline font-medium">
              Sign Up
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
