import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  RotateCcw,
  Shield,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { useAdminSession } from "../hooks/useAdminSession";
import {
  hashPassword,
  useAdminLogin,
  useHasAdminCredentials,
  useResetAdminPassword,
  useSetAdminCredentials,
} from "../hooks/useQueries";

interface AdminGuardProps {
  children: React.ReactNode;
  /** When true, shows a small logout button within the admin content area */
  showLogout?: boolean;
}

// ─── Setup Form (first-time) ──────────────────────────────────────────────────
function SetupForm() {
  const { loginAdmin } = useAdminSession();
  const setAdminCredentials = useSetAdminCredentials();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const hash = await hashPassword(password);
      const ok = await setAdminCredentials.mutateAsync({
        username: username.trim(),
        passwordHash: hash,
      });
      if (ok) {
        await queryClient.invalidateQueries({
          queryKey: ["hasAdminCredentials"],
        });
        loginAdmin();
      } else {
        setError("Setup failed. Admin credentials may already exist.");
      }
    } catch {
      setError("Failed to set up admin. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.setup.dialog"
    >
      <div className="space-y-1.5">
        <Label htmlFor="setup-username">Username</Label>
        <Input
          id="setup-username"
          autoComplete="username"
          placeholder="e.g. parwati_admin"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          data-ocid="admin.setup.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="setup-password">Password</Label>
        <div className="relative">
          <Input
            id="setup-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="setup-confirm">Confirm Password</Label>
        <Input
          id="setup-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <Alert variant="destructive" data-ocid="admin.setup.error_state">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={setAdminCredentials.isPending}
        data-ocid="admin.setup.submit_button"
      >
        {setAdminCredentials.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Admin Account
          </>
        )}
      </Button>
    </form>
  );
}

// ─── Forgot / Reset Password Form ────────────────────────────────────────────
function ResetPasswordForm({
  onBack,
}: { onBack: (successMsg?: string) => void }) {
  const resetPassword = useResetAdminPassword();

  const [code, setCode] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const hash = await hashPassword(newPassword);
      const ok = await resetPassword.mutateAsync({
        verificationCode: code.trim(),
        newUsername: newUsername.trim(),
        newPasswordHash: hash,
      });
      if (ok) {
        onBack(
          "Password reset successfully! Please log in with your new username and password.",
        );
      } else {
        setError(
          "Invalid verification code. Please enter the correct code to reset.",
        );
      }
    } catch {
      setError("Reset failed. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.reset_password.dialog"
    >
      <div className="space-y-1.5">
        <Label htmlFor="reset-code">Verification Code</Label>
        <Input
          id="reset-code"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={10}
          required
          data-ocid="admin.reset_password.input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reset-username">New Username</Label>
        <Input
          id="reset-username"
          autoComplete="username"
          placeholder="Set a new username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          required
          data-ocid="admin.reset_password.username_input"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reset-new-password">New Password</Label>
        <div className="relative">
          <Input
            id="reset-new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reset-confirm-password">Confirm New Password</Label>
        <Input
          id="reset-confirm-password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <Alert
          variant="destructive"
          data-ocid="admin.reset_password.error_state"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => onBack()}
          data-ocid="admin.reset_password.cancel_button"
        >
          Back to Login
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={resetPassword.isPending}
          data-ocid="admin.reset_password.submit_button"
        >
          {resetPassword.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Resetting...
            </>
          ) : (
            <>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────
function LoginForm({ onForgotPassword }: { onForgotPassword: () => void }) {
  const { loginAdmin } = useAdminSession();
  const adminLogin = useAdminLogin();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      const hash = await hashPassword(password);
      const ok = await adminLogin.mutateAsync({
        username: username.trim(),
        passwordHash: hash,
      });
      if (ok) {
        loginAdmin();
      } else {
        setError("Invalid username or password. Please try again.");
      }
    } catch {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.login.dialog"
    >
      <div className="space-y-1.5">
        <Label htmlFor="login-username">Username</Label>
        <Input
          id="login-username"
          autoComplete="username"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          data-ocid="admin.login.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" data-ocid="admin.login.error_state">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={adminLogin.isPending}
        data-ocid="admin.login.submit_button"
      >
        {adminLogin.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Logging in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Log In
          </>
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-primary hover:underline underline-offset-2"
          data-ocid="admin.forgot_password.button"
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
}

// ─── AdminGuard ───────────────────────────────────────────────────────────────
export default function AdminGuard({
  children,
  showLogout = false,
}: AdminGuardProps) {
  const { isAdminLoggedIn, logoutAdmin } = useAdminSession();
  const { data: hasCredentials, isLoading } = useHasAdminCredentials();
  const [view, setView] = useState<"login" | "reset">("login");
  const [resetSuccessMsg, setResetSuccessMsg] = useState("");

  // Loading while checking backend
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-[40vh]"
        data-ocid="admin.loading_state"
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Already logged in — show protected content
  if (isAdminLoggedIn) {
    return (
      <>
        {showLogout && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={logoutAdmin}
              className="text-muted-foreground"
              data-ocid="admin.logout.button"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Logout Admin
            </Button>
          </div>
        )}
        {children}
      </>
    );
  }

  // Not logged in — show setup, login, or reset form
  const isFirstTime = !hasCredentials;

  const cardTitle = isFirstTime
    ? "Admin Setup"
    : view === "reset"
      ? "Reset Password"
      : "Admin Login";

  const cardDescription = isFirstTime
    ? "Create your admin username and password to get started."
    : view === "reset"
      ? "Enter the verification code to reset your password."
      : "Enter your admin credentials to access this section.";

  const cardIcon = isFirstTime ? (
    <KeyRound className="h-8 w-8 text-primary" />
  ) : view === "reset" ? (
    <RotateCcw className="h-8 w-8 text-primary" />
  ) : (
    <Shield className="h-8 w-8 text-primary" />
  );

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <Card className="w-full max-w-sm border-border shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-primary/10 rounded-full">{cardIcon}</div>
          </div>
          <CardTitle className="text-xl">{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {resetSuccessMsg && view === "login" && (
            <Alert
              className="mb-4 border-green-500 bg-green-50 text-green-800"
              data-ocid="admin.login.success_state"
            >
              <AlertDescription>{resetSuccessMsg}</AlertDescription>
            </Alert>
          )}
          {isFirstTime ? (
            <SetupForm />
          ) : view === "reset" ? (
            <ResetPasswordForm
              onBack={(msg) => {
                setView("login");
                if (msg) setResetSuccessMsg(msg);
              }}
            />
          ) : (
            <LoginForm
              onForgotPassword={() => {
                setResetSuccessMsg("");
                setView("reset");
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
