import { useEffect, useState } from "react";

type Plan = {
  id: number;
  name: string;
  description: string;
  price_rs: number;
  duration_days: number;
};

const emptyPlan: Plan = {
  id: 0,
  name: "",
  description: "",
  price_rs: 0,
  duration_days: 0,
};

const SubscriptionPlansTab = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] = useState<Plan>(emptyPlan);
  const [editingId, setEditingId] = useState<number | null>(null);

  const token =
    localStorage.getItem("access_token") ||
    sessionStorage.getItem("access_token");

  const fetchPlans = async () => {
    const res = await fetch("http://localhost:8000/plans", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setPlans(data);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price_rs" || name === "duration_days" ? +value : value,
    }));
  };

  // Create new plan (POST)
  const createPlan = async () => {
    await fetch("http://localhost:8000/plans", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        price_rs: formData.price_rs,
        duration_days: formData.duration_days,
      }),
    });
    fetchPlans();
  };

  // Update existing plan (PATCH)
  const updatePlan = async () => {
    if (!editingId) return;
    await fetch(`http://localhost:8000/plans/${editingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description,
        price_rs: formData.price_rs,
        duration_days: formData.duration_days,
      }),
    });
    fetchPlans();
  };

  // Delete a plan (DELETE)
  const deletePlan = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    await fetch(`http://localhost:8000/plans/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // If we were editing this plan, cancel editing
    if (editingId === id) {
      cancelEditing();
    }
    fetchPlans();
  };

  // Cancel editing and reset form
  const cancelEditing = () => {
    setFormData(emptyPlan);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updatePlan();
    } else {
      await createPlan();
    }
    setFormData(emptyPlan);
    setEditingId(null);
  };

  const handleEdit = (plan: Plan) => {
    setFormData(plan);
    setEditingId(plan.id);
  };

  return (
    <div className="space-y-6 mx-auto bg-white">
      <div className="space-y-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border border-gray-300 rounded-md p-4 bg-gray-50 hover:shadow-sm transition flex justify-between items-start"
          >
            <div>
              <h3 className="font-semibold text-lg">{plan.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
              <p className="text-sm text-gray-700">
                Rs. {plan.price_rs} for {plan.duration_days} days
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(plan)}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => deletePlan(plan.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6">
        <h3 className="text-xl font-medium text-gray-700 mb-4">
          {editingId ? "Edit Plan" : "Add New Plan"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Plan Name
            </label>
            <input
              id="name"
              name="name"
              placeholder="Plan Name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="price_rs"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price (Rs.)
            </label>
            <input
              id="price_rs"
              name="price_rs"
              type="number"
              placeholder="e.g. 500"
              value={formData.price_rs}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="duration_days"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (days)
            </label>
            <input
              id="duration_days"
              name="duration_days"
              type="number"
              placeholder="e.g. 30"
              value={formData.duration_days}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded-md w-full"
            />
          </div>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded-md col-span-1 md:col-span-2"
          />
        </div>

        <div className="mt-4 flex space-x-3">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-md"
          >
            {editingId ? "Update Plan" : "Add Plan"}
          </button>

          {editingId && (
            <button
              onClick={cancelEditing}
              className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-5 py-2 rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansTab;
