export function getAuthHeaders() {
  const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
  return {
    Authorization: `Bearer ${token}`,
  };
}
