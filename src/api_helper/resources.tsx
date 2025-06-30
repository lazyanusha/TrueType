import { useCallback } from "react";
import { authFetch } from "../utils/authfetch";

const API_BASE = "http://localhost:8000/resources";

export function useResourceApi() {
	const fetchResources = useCallback(async () => {
		const res = await authFetch(`${API_BASE}/`, {});
		if (!res.ok) throw new Error("Failed to fetch resources");
		const data = await res.json();
		return data.map((resource: { authors: any }) => ({
			...resource,
			authors: resource.authors || [],
		}));
	}, []);

	const getResourceById = useCallback(async (id: number) => {
		const res = await authFetch(`${API_BASE}/${id}`, {});
		const data = await res.json().catch(() => null);
		if (!res.ok) {
			throw new Error(data?.detail || "Failed to fetch resource");
		}
		return {
			...data,
			authors: data?.authors || [],
		};
	}, []);

	const uploadResource = useCallback(async (formData: FormData) => {
		const res = await authFetch(`${API_BASE}`, {
			method: "POST",
			body: formData,
		});
		const data = await res.json().catch(() => null);
		if (!res.ok) throw new Error(data?.detail || "Failed to upload resource");
		return data;
	}, []);

	const updateResource = useCallback(async (id: number, data: FormData) => {
		const res = await authFetch(`${API_BASE}/${id}`, {
			method: "PATCH",
			body: data,
		});
		const responseData = await res.json().catch(() => null);
		if (!res.ok)
			throw new Error(responseData?.detail || "Failed to update resource");
		return responseData;
	}, []);

	const deleteResource = useCallback(async (id: number) => {
		const res = await authFetch(`${API_BASE}/${id}`, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error("Failed to delete resource");
		// Sometimes DELETE returns empty body, so safely try json or just return nothing
		try {
			return await res.json();
		} catch {
			return null;
		}
	}, []);

	return {
		fetchResources,
		uploadResource,
		updateResource,
		deleteResource,
		getResourceById,
	};
}
