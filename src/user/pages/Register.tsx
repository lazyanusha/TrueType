import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { termsText } from "../constants/termsInfo";
import Snowing from "../components/Snowing";
import { validateRegistration } from "../utils/ValidateRegistration";
import { motion } from "framer-motion";

interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreed: boolean;
}

export default function RegistrationForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegistrationData>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
  });

  const [errors, setErrors] = useState<
    {
      [K in keyof RegistrationData]?: string;
    } & { form?: string }
  >({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    if (name === "phone") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData((prev) => ({ ...prev, phone: value }));
      }
    } else {
      if (type === "checkbox" && target instanceof HTMLInputElement) {
        setFormData((prev) => ({
          ...prev,
          [name]: target.checked,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const validationErrors = validateRegistration(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        // Prepare payload for FastAPI (transform camelCase to snake_case)
        const payload = {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        };

        const res = await fetch("http://localhost:8000/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || "Registration failed");
        }

        const result = await res.json();
        localStorage.setItem("access_token", result.access_token);

        // Fetch user info using access token
        const userRes = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${result.access_token}`,
          },
        });

        if (!userRes.ok) throw new Error("Failed to fetch user info");

        const userData = await userRes.json();

        setSuccessMessage("Registration successful! Redirecting...");

        // Redirect with user info
        navigate("/payment", {
          state: {
            fromRegister: true,
            user: {
              user_id: userData.id,
              fullName: userData.full_name,
            },
          },
        });
      } catch (err: any) {
        alert(err.message || "Something went wrong");
      }
    }
  };

  return (
    <div>
      <Snowing />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="min-h-screen flex shadow-xl rounded-xl items-center justify-center bg-[#f0f9ff]"
      >
        <div className="max-w-7xl w-full mx-auto relative z-10">
          {successMessage && (
            <p
              className="
                text-green-700 
                bg-green-100 
                border border-green-300 
                rounded-md 
                px-4 
                py-2 
                mb-4 
                text-center 
                shadow-md 
                animate-fadeIn
                max-w-md
                mx-auto
              "
              style={{
                animationDuration: "0.8s",
                animationTimingFunction: "ease-in-out",
              }}
            >
              {successMessage}
            </p>
          )}

          <div className="flex flex-col lg:flex-row w-full bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="w-full lg:w-1/2 bg-gray-50 p-12 px-18">
              <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                Create an Account
              </h2>

              {/* Form-level error */}
              {errors.form && (
                <p className="text-red-600 text-center mb-4">{errors.form}</p>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {["fullName", "email", "phone"].map((field) => (
                  <div key={field}>
                    <label
                      htmlFor={field}
                      className="block text-gray-700 capitalize"
                    >
                      {field.replace(/([A-Z])/g, " $1")}:
                    </label>
                    <input
                      type={
                        field === "email"
                          ? "email"
                          : field === "phone"
                          ? "tel"
                          : "text"
                      }
                      id={field}
                      name={field}
                      value={formData[field as "fullName" | "email" | "phone"]}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md"
                      autoComplete={
                        field === "email"
                          ? "email"
                          : field === "phone"
                          ? "tel"
                          : "name"
                      }
                      required
                    />
                    {errors[field as keyof RegistrationData] && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors[field as keyof RegistrationData]}
                      </p>
                    )}
                  </div>
                ))}

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-gray-700">
                    Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-700"
                  >
                    Confirm Password:
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-2.5 text-gray-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="agreed"
                    checked={formData.agreed}
                    onChange={handleChange}
                    className="mr-2"
                    id="agreed"
                    required
                  />
                  <label htmlFor="agreed" className="text-gray-600 text-sm">
                    I have read and agree to the{" "}
                    <button
                      type="button"
                      className="text-blue-600 underline"
                      onClick={() => setShowTerms(true)}
                    >
                      Terms and Conditions
                    </button>
                  </label>
                </div>
                {errors.agreed && (
                  <p className="text-red-600 text-sm">{errors.agreed}</p>
                )}

                {/* Terms Modal */}
                {showTerms && (
                  <div className="fixed inset-0 bg-gray-600 bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white max-w-lg w-full p-6 rounded shadow-lg">
                      <h2 className="text-xl font-bold mb-4">
                        Terms and Conditions
                      </h2>
                      <div className="overflow-y-auto max-h-80 whitespace-pre-line text-sm text-gray-700">
                        {termsText}
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                          onClick={() => setShowTerms(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[#3C5773] text-white py-3 rounded-md hover:bg-[#4f5d84]"
                  disabled={!!successMessage} // Disable button while showing success message
                >
                  Register
                </button>

                <p className="text-m text-center text-gray-700 mt-4">
                  Already have an account?{" "}
                  <a href="/login" className="text-blue-600 hover:underline">
                    Log In
                  </a>
                </p>
              </form>
            </div>

            {/* Subscription Preview */}
            <div className="w-full lg:w-1/2 bg-[#4f5d84] flex items-center justify-center">
              <div className="bg-white min-w-[27vw] max-w-md px-6 py-2 rounded shadow-md">
                <div className="flex flex-col items-center">
                  <img src="/logo.png" alt="TrueType Logo" className="h-20" />
                </div>
                {[
                  { name: "Weekly", price: "Rs 200/week" },
                  { name: "Monthly", price: "Rs 700/month" },
                  { name: "Yearly", price: "Rs 1450/yearly" },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className="border border-blue-500 rounded-md p-3 mb-4"
                  >
                    <div className="flex justify-between mb-2">
                      <h2 className="text-lg font-medium">{plan.name}</h2>
                      <span className="text-gray-700">{plan.price}</span>
                    </div>
                    <div className="flex justify-between items-start gap-8">
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        <li>Unlimited Reports</li>
                        <li>Multiple File Uploads</li>
                        <li>Citations Check</li>
                        <li>Reports Export</li>
                      </ul>
                      <button
                        onClick={() =>
                          navigate("/payment", { state: { user: formData } })
                        }
                        className="self-start mt-10 py-2 border border-[#3C5773] text-[#3C5773]py-1 px-3 rounded hover:bg-[#eee]"
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
