import React, { createContext, useContext, useState, useEffect } from "react";

const SESSION_KEY = "admin_session";
const SESSION_PASSWORD_KEY = "admin_session_password";
const SESSION_USERNAME_KEY = "admin_session_username";

interface AdminSessionContextValue {
  isAdminLoggedIn: boolean;
  adminPassword: string;
  adminUsername: string;
  loginAdmin: (username: string, password: string) => void;
  logoutAdmin: () => void;
}

const AdminSessionContext = createContext<AdminSessionContextValue>({
  isAdminLoggedIn: false,
  adminPassword: "",
  adminUsername: "",
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

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return sessionStorage.getItem(SESSION_PASSWORD_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const [adminUsername, setAdminUsername] = useState<string>(() => {
    try {
      return sessionStorage.getItem(SESSION_USERNAME_KEY) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    const handleStorage = () => {
      try {
        setIsAdminLoggedIn(sessionStorage.getItem(SESSION_KEY) === "true");
        setAdminPassword(sessionStorage.getItem(SESSION_PASSWORD_KEY) ?? "");
        setAdminUsername(sessionStorage.getItem(SESSION_USERNAME_KEY) ?? "");
      } catch {
        setIsAdminLoggedIn(false);
        setAdminPassword("");
        setAdminUsername("");
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const loginAdmin = (username: string, password: string) => {
    try {
      sessionStorage.setItem(SESSION_KEY, "true");
      sessionStorage.setItem(SESSION_PASSWORD_KEY, password);
      sessionStorage.setItem(SESSION_USERNAME_KEY, username);
    } catch {
      // sessionStorage unavailable
    }
    setIsAdminLoggedIn(true);
    setAdminPassword(password);
    setAdminUsername(username);
  };

  const logoutAdmin = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_PASSWORD_KEY);
      sessionStorage.removeItem(SESSION_USERNAME_KEY);
    } catch {
      // ignore
    }
    setIsAdminLoggedIn(false);
    setAdminPassword("");
    setAdminUsername("");
  };

  return React.createElement(
    AdminSessionContext.Provider,
    {
      value: {
        isAdminLoggedIn,
        adminPassword,
        adminUsername,
        loginAdmin,
        logoutAdmin,
      },
    },
    children,
  );
}

export function useAdminSession(): AdminSessionContextValue {
  return useContext(AdminSessionContext);
}
