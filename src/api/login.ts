// src/api/auth/login.ts

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
}

export const loginUser = async (
  email: string,
  password: string,
  rememberMe: boolean
): Promise<LoginResponse> => {
  const res = await fetch("http://localhost:8000/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, remember_me: rememberMe }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || "Login failed");
  }

  return await res.json();
};

export const fetchUserProfile = async (access_token: string) => {
  const res = await fetch("http://localhost:8000/users/me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch user");

  return await res.json();
};
