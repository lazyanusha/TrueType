import { citationInfo } from "../constants/citationInfo";

export const getCitationStyles = (status: keyof typeof citationInfo) => {
  switch (status) {
    case "Proper":
      return "bg-green-50 border-green-500 text-green-700";
    case "Partial":
      return "bg-yellow-50 border-yellow-500 text-yellow-700";
    case "False":
      return "bg-red-50 border-red-500 text-red-700";
    case "Poor":
      return "bg-orange-50 border-orange-500 text-orange-700";
    case "None":
      return "bg-gray-50 border-gray-500 text-gray-700";
    default:
      return "bg-gray-100 border-gray-300 text-gray-600";
  }
};
