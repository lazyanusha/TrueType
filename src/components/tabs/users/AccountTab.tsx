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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Changing:", e.target.name, e.target.value);
    setUserData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  const handleSave = async () => {
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

      if (!res.ok) {
        // Read error JSON from backend
        const errorData = await res.json();
        console.error("Backend validation error:", errorData);
        throw new Error("Update failed");
      }

      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert("Error updating user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          name="email"
          type="email"
          value={userData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Email"
        />
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
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Full Name"
        />
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
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="Phone"
        />
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
          className="w-full border border-gray-300 rounded px-3 py-2"
          placeholder="New Password (leave empty to keep old)"
        />
      </div>
      <button
        onClick={handleSave}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium focus:outline-none hover:bg-blue-700"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default AccountTab;
