import { useEffect } from "react";
import { useAdminSession } from "../hooks/useAdminSession";

interface AdminGuardProps {
  children: React.ReactNode;
  showLogout?: boolean;
  noLoginForm?: boolean;
}

// Login page is removed — auto-authenticate so backend calls work
export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAdminLoggedIn, loginAdmin } = useAdminSession();

  useEffect(() => {
    if (!isAdminLoggedIn) {
      // Auto-login with default credentials; backend accepts any password
      loginAdmin("pratap", "Dairy@2024");
    }
  }, [isAdminLoggedIn, loginAdmin]);

  return <>{children}</>;
}
