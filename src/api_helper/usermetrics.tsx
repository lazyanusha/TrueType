// src/api/metrics.ts
export async function fetchUserMetrics(token: string) {
  const response = await fetch("http://localhost:8000/users/metrics", {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user metrics");
  }
  return response.json();
}
