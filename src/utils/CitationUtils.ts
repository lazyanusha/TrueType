// utils/citationUtils.ts
export const normalizeCitationStatus = (status: string) => {
  switch (status) {
    case "properly_cited":
      return "Proper";
    case "partially_cited":
      return "Partial";
    case "mismatched":
      return "False";
    case "poorly_cited":
      return "Poor";
    case "uncited":
      return "None";
    default:
      return status; 
  }
};
