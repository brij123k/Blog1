import { storage } from "./storage";

// export  const API = "http://localhost:5000";
export const API = "https://hammerhead-app-7hn5u.ondigitalocean.app";

export async function api(
  endpoint: string,
  options: RequestInit = {},
) {
  const token = storage.getToken();

  const response = await fetch(
    `${API}${endpoint}`,
    {
      ...options,

      headers: {
        Authorization: `Bearer ${token}`,

        "Content-Type": "application/json",

        ...(options.headers || {}),
      },
    },
  );

  return response.json();
}