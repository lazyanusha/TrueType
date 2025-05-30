import { useLocation } from "react-router-dom";
import Snowing from "../components/Snowing";

export default function PaymentPage() {
  const location = useLocation();
  const { fullName, email, subscriptionPlans = [] } = location.state || {};

  const handleBuy = (planName: string) => {
    alert(`Buying ${planName} plan for ${fullName}`);
    // payment logic here
  };

  const plans = subscriptionPlans.length
    ? subscriptionPlans
    : [
        { name: "Weekly", price: "Rs 200/week" },
        { name: "Monthly", price: "Rs 700/month" },
        { name: "Yearly", price: "Rs 1450/yearly" },
      ];

  return (
    <div className="min-h-[60vh] bg-[#f0f9ff] flex flex-col justify-center items-center pt-30 px-6 sm:px-10 lg:px-16">
        <Snowing/>
      <h1 className="text-4xl font-extrabold text-[#3C5773] mb-6 text-center">
        Choose a Subscription
      </h1>
      <p className="text-lg text-gray-700 mb-12 max-w-xl text-center">
        Welcome, <span className="font-semibold text-blue-700">{fullName}</span>{" "}
        ({email})
      </p>

      <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-3 max-w-7xl w-full">
        {plans.map((plan: any) => (
          <div
            key={plan.name}
            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
          >
            <div className="p-8 flex flex-col flex-grow">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {plan.name}
                </h2>
                <span className="text-xl font-semibold text-blue-600">
                  {plan.price}
                </span>
              </div>

              <ul className="flex flex-col gap-3 text-gray-600 text-sm mb-auto">
                <li className="border-b border-gray-200 pb-2">
                  Unlimited Reports
                </li>
                <li className="border-b border-gray-200 pb-2">
                  Multiple File Uploads
                </li>
                <li className="border-b border-gray-200 pb-2">
                  Citations Check
                </li>
                <li>Reports Export</li>
              </ul>
            </div>
            <button
              onClick={() => handleBuy(plan.name)}
              style={{ borderColor: "#3C5773", color: "#3C5773" }}
              className=" self-start ml-4 py-2 rounded-[10px] border-1 w-64 mb-8 font-semibold text-lg hover:bg-[#eee]
              transition-colors duration-300 shadow-sm hover:shadow-md"
            >
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
