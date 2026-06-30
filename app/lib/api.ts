import { storage } from "./storage";

const API = "http://localhost:5000";

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