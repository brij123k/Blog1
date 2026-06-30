"use client";

import { useEffect } from "react";
import { loginWithShopify }
from "../lib/auth";

export function useShopifyAuth() {
  useEffect(() => {
    const token =
      localStorage.getItem(
        "blog1_token"
      );

    if (token) {
      return;
    }

    loginWithShopify()
      .catch(console.error);
  }, []);
}