import React, { createContext, useContext, useState, useEffect } from "react";

const SESSION_KEY = "admin_session";

interface AdminSessionContextValue {
  isAdminLoggedIn: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
}

const AdminSessionContext = createContext<AdminSessionContextValue>({
  isAdminLoggedIn: false,
  loginAdmin: () => {},
  logoutAdmin: () => {},
});

interface AdminSessionProviderProps {
  children: React.ReactNode;
}

export function AdminSessionProvider({
  children,
}: AdminSessionProviderProps): React.ReactElement {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Keep sessionStorage in sync if storage changes externally (e.g. other tabs)
  useEffect(() => {
    const handleStorage = () => {
      try {
        setIsAdminLoggedIn(sessionStorage.getItem(SESSION_KEY) === "true");
      } catch {
        setIsAdminLoggedIn(false);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loginAdmin = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
    } catch {
      // sessionStorage unavailable — still update state
    }
    setIsAdminLoggedIn(true);
  };

  const logoutAdmin = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    setIsAdminLoggedIn(false);
  };

  return React.createElement(
    AdminSessionContext.Provider,
    { value: { isAdminLoggedIn, loginAdmin, logoutAdmin } },
    children,
  );
}

export function useAdminSession(): AdminSessionContextValue {
  return useContext(AdminSessionContext);
}
