import { authFetch } from "../utils/authfetch";
import { useAuth } from "../utils/useAuth";

const API_BASE = "http://localhost:8000/resources";

export function useResourceApi() {
  useAuth();
  async function fetchResources() {

    const res = await authFetch(`${API_BASE}/`, {
    });
    if (!res.ok) throw new Error("Failed to fetch resources");
    const data = await res.json();
    return data.map((resource: { authors: any }) => ({
      ...resource,
      authors: resource.authors || [],
    }));
  }

  async function uploadResource(formData: FormData) {
    const res = await authFetch(`${API_BASE}`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload resource");
    return res.json();
  }

  async function updateResource(
    id: number,
    data: {
      title: string;
      authors: Author[];
      file_url: string;
      content: string;
    }
  ) {
    const res = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        authors: data.authors || [],
      }),
    });
    if (!res.ok) throw new Error("Failed to update resource");
    return res.json();
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
  };
}
