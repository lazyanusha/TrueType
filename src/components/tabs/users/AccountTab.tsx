import { useState, type Dispatch, type SetStateAction } from "react";

type UserDataType = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};

type AccountTabProps = {
  userData: UserDataType;
  setUserData: Dispatch<SetStateAction<UserDataType>>;
  userId: number;
};

const AccountTab = ({ userData, setUserData, userId }: AccountTabProps) => {
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Basic validation functions
  const validate = (field: string, value: string) => {
    switch (field) {
      case "email":
        if (!value) return "Email is required";
        // Simple email regex
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
        return "";
      case "full_name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Full name must be at least 3 characters";
        return "";
      case "phone":
        if (!value.trim()) return "Phone is required";
        // Example: only digits and + allowed
        if (!/^[\d+\s-]{7,15}$/.test(value))
          return "Invalid phone number format";
        return "";
      case "password":
        if (!value) return ""; // password optional
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate the field on change
    const errorMsg = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));

    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    // Check all validations
    const currentErrors: { [key: string]: string } = {};

    ["email", "full_name", "phone", "password"].forEach((field) => {
      const errorMsg = validate(field, userData[field as keyof UserDataType]);
      if (errorMsg) currentErrors[field] = errorMsg;
    });

    setErrors(currentErrors);

    return Object.keys(currentErrors).length === 0;
  };

  const handleSave = async () => {
    if (!userId) {
      alert("User ID not found");
      return;
    }

    if (!isFormValid()) {
      alert("Please fix the errors before saving.");
      return;
    }

    setSaving(true);
    try {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");
      const res = await fetch(`http://localhost:8000/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: userData.full_name,
          email: userData.email,
          phone: userData.phone,
          ...(userData.password ? { password: userData.password } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Status:", res.status);
        console.error("Backend validation error:", data);
        alert(data.detail || "Update failed");
        return;
      }

      alert("Profile updated successfully");
      setUserData((prev) => ({ ...prev, password: "" })); // clear password after save
      setEditMode(false); // exit edit mode on success
    } catch (error) {
      console.error(error);
      alert("Error updating user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {!editMode ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="px-3 py-2 border border-gray-300 rounded bg-gray-50">
              {userData.email}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <p className="px-3 py-2 border border-gray-300 rounded bg-gray-50">
              {userData.full_name}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <p className="px-3 py-2 border border-gray-300 rounded bg-gray-50">
              {userData.phone}
            </p>
          </div>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium focus:outline-none hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              name="full_name"
              type="text"
              value={userData.full_name}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                errors.full_name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Full Name"
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              name="phone"
              type="text"
              value={userData.phone}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Phone"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Change Password
            </label>
            <input
              name="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              className={`w-full border rounded px-3 py-2 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="New Password (leave empty to keep old)"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex space-x-4 mt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium focus:outline-none hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setEditMode(false);
                setUserData((prev) => ({ ...prev, password: "" })); // clear password
                setErrors({});
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded text-sm font-medium focus:outline-none hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AccountTab;
