import { authFetch } from "../utils/authfetch";
import { useAuth } from "../utils/useAuth";

const API_BASE = "http://localhost:8000/resources";

export function useResourceApi() {
  useAuth();

  async function fetchResources() {
    const res = await authFetch(`${API_BASE}/`, {});
    if (!res.ok) throw new Error("Failed to fetch resources");
    const data = await res.json();
    return data.map((resource: { authors: any }) => ({
      ...resource,
      authors: resource.authors || [],
    }));
  }

  const getResourceById = async (id: number) => {
    const res = await authFetch(`${API_BASE}/${id}`, {});
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.detail || "Failed to fetch resource");
    }
    return {
      ...data,
      authors: data?.authors || [],
    };
  };

  
  async function uploadResource(formData: FormData) {
    const res = await authFetch(`${API_BASE}`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.detail || "Failed to upload resource");
    return data;
  }

  async function updateResource(id: number, data: FormData) {
    const res = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      body: data,
    });
    const responseData = await res.json().catch(() => null);
    if (!res.ok)
      throw new Error(responseData?.detail || "Failed to update resource");
    return responseData;
  }

  async function deleteResource(id: number) {
    const res = await authFetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete resource");
    return res.json();
  }

  return {
    fetchResources,
    uploadResource,
    updateResource,
    deleteResource,
    getResourceById,
  };
}
