import React, { useState } from "react";

export function StatCard({
  title,
  value,
  tooltip,
}: {
  title: string;
  value: React.ReactNode;
  tooltip?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col items-center relative">
      <div className="flex items-center space-x-1">
        <p className="text-gray-500 text-sm">{title}</p>
        {tooltip && (
          <div
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="relative cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M12 18a6 6 0 100-12 6 6 0 000 12z"
              />
            </svg>
            {showTooltip && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 p-2 bg-gray-700 text-white text-xs rounded z-10">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-[#3C5773]">{value}</p>
    </div>
  );
}
