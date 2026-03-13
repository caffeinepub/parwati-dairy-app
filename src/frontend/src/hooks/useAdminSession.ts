import React, { createContext, useContext } from "react";

// Login page has been removed. Admin dashboard is accessible directly.
// All admin operations use a fixed bypass token since isValidAdmin always returns true on the backend.
const BYPASS_TOKEN = "admin";

interface AdminSessionContextValue {
  isAdminLoggedIn: boolean;
  adminPassword: string;
  adminUsername: string;
  loginAdmin: (username: string, password: string) => void;
  logoutAdmin: () => void;
}

const AdminSessionContext = createContext<AdminSessionContextValue>({
  isAdminLoggedIn: true,
  adminPassword: BYPASS_TOKEN,
  adminUsername: "admin",
  loginAdmin: () => {},
  logoutAdmin: () => {},
});

interface AdminSessionProviderProps {
  children: React.ReactNode;
}

export function AdminSessionProvider({
  children,
}: AdminSessionProviderProps): React.ReactElement {
  return React.createElement(
    AdminSessionContext.Provider,
    {
      value: {
        isAdminLoggedIn: true,
        adminPassword: BYPASS_TOKEN,
        adminUsername: "admin",
        loginAdmin: () => {},
        logoutAdmin: () => {},
      },
    },
    children,
  );
}

export function useAdminSession(): AdminSessionContextValue {
  return useContext(AdminSessionContext);
}
