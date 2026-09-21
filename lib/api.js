// Helper function to get Auth Header
const getAuthHeaders = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("medicare_token");
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return {
    "Content-Type": "application/json",
  };
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith("/api")
    ? endpoint
    : `/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`[API Fetch Error] ${endpoint}:`, error.message);
    throw error;
  }
};

export const apiGet = (endpoint) => apiFetch(endpoint, { method: "GET" });

export const apiPost = (endpoint, body) =>
  apiFetch(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiPut = (endpoint, body) =>
  apiFetch(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const apiDelete = (endpoint) => apiFetch(endpoint, { method: "DELETE" });
