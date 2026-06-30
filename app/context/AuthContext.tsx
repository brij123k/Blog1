"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext =
  createContext<any>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState(null);

  const [store, setStore] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const user =
      localStorage.getItem(
        "blog1_user"
      );

    const store =
      localStorage.getItem(
        "blog1_store"
      );

    if (user) {
      setUser(JSON.parse(user));
    }

    if (store) {
      setStore(JSON.parse(store));
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        store,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);