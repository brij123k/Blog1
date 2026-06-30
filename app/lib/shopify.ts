export interface ShopifyAuthData {
  shop: string;
  host: string;
  idToken: string;
}

export function getShopifyData(): ShopifyAuthData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params = new URLSearchParams(window.location.search);

  const shop = params.get("shop");
  const host = params.get("host");
  const idToken = params.get("id_token");

  if (!shop || !host || !idToken) {
    return null;
  }

  return {
    shop,
    host,
    idToken,
  };
}