
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get tokens from localStorage/sessionStorage
  const getAccessToken = () =>
    localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

  const getRefreshToken = () =>
    localStorage.getItem("refresh_token") || sessionStorage.getItem("refresh_token");

  const storeTokens = (access: string, refresh: string, rememberMe: boolean) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("access_token", access);
    storage.setItem("refresh_token", refresh);
  };

  const clearTokens = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch("http://localhost:8000/auth/refresh", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });
      if (!res.ok) throw new Error("Failed to refresh token");
      const data = await res.json();
      const access_token = data?.access_token;
      if (!access_token) throw new Error("Access token missing in response");
      const rememberMe = !!localStorage.getItem("refresh_token");
      storeTokens(access_token, refreshToken, rememberMe);
      return access_token;
    } catch {
      return null;
    }
  };

  const isTokenExpired = (token: string) => {
    try {
      const [, payloadBase64] = token.split(".");
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < now;
    } catch {
      return true;
    }
  };

  let accessToken = getAccessToken();

  // Refresh if expired or missing
  if (!accessToken || isTokenExpired(accessToken)) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      clearTokens();
      // We cannot call logout here since no access to context, 
      // so just throw to let caller handle logout (or redirect)
      throw new Error("Unauthorized: Access token expired and refresh failed");
    }
  }

  // Add Authorization header
  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
  };

  options.headers = {
    ...(options.headers || {}),
    ...authHeaders,
  };

  return fetch(url, options);
}
