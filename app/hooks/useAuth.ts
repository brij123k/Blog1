"use client";

import { useEffect, useState } from "react";
import { authenticateShopify } from "../lib/auth";
import { storage } from "../lib/storage";

export function useAuth() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const login = async () => {
      try {
        if (storage.getToken()) {
          setLoading(false);
          return;
        }

        await authenticateShopify();

        setLoading(false);
      } catch (err) {
        console.error(err);
      }finally{
        setLoading(false);
      }
    };

    login();
  }, []);

  return {
    loading,
    user: storage.getUser(),
  };
}