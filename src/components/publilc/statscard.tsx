import React from "react";

export function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <div className="bg-white shadow rounded p-4 flex flex-col items-center">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-semibold text-[#3C5773]">{value}</p>
    </div>
  );
}
