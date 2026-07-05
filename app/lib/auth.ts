import { getShopifyData } from "./shopify";
import { storage } from "./storage";

// const API = "http://localhost:5000";
const API = "https://hammerhead-app-7hn5u.ondigitalocean.app";

export async function authenticateShopify() {
  const shopify = getShopifyData();

  // Shopify hasn't injected the parameters yet
  if (!shopify) {
    console.log("Waiting for Shopify authentication...");
    return null;
  }

  try {
    console.log("Authenticating Shopify...");
    console.log(shopify);

    const response = await fetch(`${API}/api/v1/auth/shopify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shopify),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend Error:", data);
      throw new Error(data.message || "Authentication failed");
    }

    storage.setToken(data.accessToken);

    if (data.user) {
      storage.setUser(data.user);
    }

    console.log("Authentication Success");

    return data;
  } catch (error) {
    console.error("Authentication Error:", error);
    return null;
  }
}