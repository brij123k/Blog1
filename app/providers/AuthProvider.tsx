"use client";

import { useAuth } from "../hooks/useAuth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useAuth();

  if (loading) {
    return <>Loading...</>;
  }

  return children;
}