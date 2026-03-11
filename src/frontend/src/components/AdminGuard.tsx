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
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Loader2,
  LogIn,
  LogOut,
  RefreshCw,
  RotateCcw,
  Shield,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useAdminSession } from "../hooks/useAdminSession";
import { useAdminLogin, useResetAdminPassword } from "../hooks/useQueries";

interface AdminGuardProps {
  children: React.ReactNode;
  showLogout?: boolean;
}

// ─── Connection Banner ────────────────────────────────────────────────────
function ConnectionBanner() {
  const { actor, isFetching, isError, retryActor } = useActor();

  if (actor) return null;

  if (isError) {
    return (
      <Alert
        variant="destructive"
        className="mb-4"
        data-ocid="admin.connection.error_state"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Server connection failed.</span>
          <Button
            size="sm"
            variant="outline"
            className="ml-2 h-7 text-xs"
            onClick={retryActor}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (isFetching) {
    return (
      <div
        className="flex items-center gap-2 text-xs text-muted-foreground rounded-md border bg-muted/40 p-2 mb-4"
        data-ocid="admin.connection.loading_state"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Connecting to server...</span>
      </div>
    );
  }

  // Actor not loaded but not fetching or error — try reloading
  return (
    <div className="flex items-center gap-2 text-xs text-amber-700 rounded-md border border-amber-300 bg-amber-50 p-2 mb-4">
      <AlertCircle className="h-3.5 w-3.5" />
      <span>Not connected.</span>
      <Button
        size="sm"
        variant="outline"
        className="ml-auto h-7 text-xs"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Reload
      </Button>
    </div>
  );
}

// ─── Reset Password Form ────────────────────────────────────────────────
function ResetPasswordForm({
  onSuccess,
  onBack,
}: {
  onSuccess: (username: string, password: string) => void;
  onBack: () => void;
}) {
  const resetPassword = useResetAdminPassword();
  const { actor } = useActor();

  const [code, setCode] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!actor) {
      setError("Not connected to server yet. Please wait and try again.");
      return;
    }
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const ok = await resetPassword.mutateAsync({
        verificationCode: code.trim(),
        newUsername: newUsername.trim(),
        newPassword,
      });
      if (ok) {
        onSuccess(newUsername.trim(), newPassword);
      } else {
        setError(
          "Invalid verification code. The code is the last 4 digits of the business phone.",
        );
      }
    } catch {
      setError("Reset failed. Please wait and try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.reset_password.dialog"
    >
      <ConnectionBanner />
      <div className="space-y-1.5">
        <Label htmlFor="reset-code">Verification Code</Label>
        <Input
          id="reset-code"
          placeholder="e.g. 5714"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={10}
          required
          data-ocid="admin.reset_password.input"
        />
        <p className="text-xs text-muted-foreground">
          Last 4 digits of the business phone number.
        </p>
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
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
        <Label htmlFor="reset-confirm">Confirm Password</Label>
        <Input
          id="reset-confirm"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat password"
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
          onClick={onBack}
          data-ocid="admin.reset_password.cancel_button"
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={resetPassword.isPending || !actor}
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
              Reset
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── Reset Success Screen ────────────────────────────────────────────────
function ResetSuccessScreen({
  username,
  password,
  onLogin,
}: { username: string; password: string; onLogin: () => void }) {
  return (
    <div className="space-y-5" data-ocid="admin.reset_success.panel">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="p-2 rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <p className="font-semibold text-green-700">
          Password reset successful!
        </p>
      </div>
      <div className="rounded-lg border border-green-300 bg-green-50 p-4 space-y-2">
        <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">
          Your new credentials
        </p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-700">Username:</span>
          <code className="font-mono font-bold text-green-900 bg-green-100 px-2 py-0.5 rounded">
            {username}
          </code>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-green-700">Password:</span>
          <code className="font-mono font-bold text-green-900 bg-green-100 px-2 py-0.5 rounded">
            {password}
          </code>
        </div>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        Save these credentials. Click below to log in now.
      </p>
      <Button
        className="w-full"
        onClick={onLogin}
        data-ocid="admin.reset_success.submit_button"
      >
        <LogIn className="h-4 w-4 mr-2" />
        Log In Now
      </Button>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────
function LoginForm({
  onForgotPassword,
  prefillUsername,
  prefillPassword,
}: {
  onForgotPassword: () => void;
  prefillUsername?: string;
  prefillPassword?: string;
}) {
  const { loginAdmin } = useAdminSession();
  const adminLogin = useAdminLogin();
  const { actor } = useActor();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState(prefillUsername ?? "");
  const [password, setPassword] = useState(prefillPassword ?? "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const pendingRef = useRef<{ username: string; password: string } | null>(
    null,
  );
  const [isPending, setIsPending] = useState(false);

  // Auto-submit when actor becomes available
  useEffect(() => {
    if (actor && pendingRef.current) {
      const creds = pendingRef.current;
      pendingRef.current = null;
      void doLogin(creds.username, creds.password);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor]);

  useEffect(() => {
    if (prefillUsername) setUsername(prefillUsername);
    if (prefillPassword) setPassword(prefillPassword);
  }, [prefillUsername, prefillPassword]);

  const doLogin = async (u: string, p: string) => {
    setIsPending(true);
    setError("");
    try {
      const ok = await adminLogin.mutateAsync({ username: u, password: p });
      if (ok) {
        await queryClient.invalidateQueries({
          queryKey: ["hasAdminCredentials"],
        });
        loginAdmin(u, p);
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    if (!actor) {
      // Queue login — will fire automatically when actor is ready
      pendingRef.current = { username: username.trim(), password };
      setIsPending(true);
      return;
    }
    await doLogin(username.trim(), password);
  };

  const fillDefaults = () => {
    setUsername("pratap");
    setPassword("Dairy@2024");
    setError("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.login.dialog"
    >
      <ConnectionBanner />
      <div
        className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-blue-700"
        data-ocid="admin.login.panel"
      >
        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        <div className="flex-1">
          <span>
            <strong>Default credentials</strong> (restored after each new
            deployment): username{" "}
            <code className="font-mono font-semibold">pratap</code> / password{" "}
            <code className="font-mono font-semibold">Dairy@2024</code>
          </span>
          <button
            type="button"
            onClick={fillDefaults}
            className="block mt-1 text-blue-600 font-semibold hover:underline"
          >
            Fill defaults
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-username">Username</Label>
        <Input
          id="login-username"
          autoComplete="username"
          placeholder="Enter username"
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
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
        disabled={isPending || adminLogin.isPending}
        data-ocid="admin.login.submit_button"
      >
        {isPending || adminLogin.isPending ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {!actor ? "Waiting for server..." : "Logging in..."}
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

// ─── AdminGuard ──────────────────────────────────────────────────────────────
export default function AdminGuard({
  children,
  showLogout = false,
}: AdminGuardProps) {
  const { isAdminLoggedIn, loginAdmin, logoutAdmin } = useAdminSession();
  const [view, setView] = useState<"login" | "reset" | "reset_success">(
    "login",
  );
  const [resetCreds, setResetCreds] = useState<{
    username: string;
    password: string;
  } | null>(null);

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

  const cardTitle =
    view === "reset"
      ? "Reset Password"
      : view === "reset_success"
        ? "Password Reset"
        : "Admin Login";
  const cardDescription =
    view === "reset"
      ? "Enter the verification code to reset your password."
      : view === "reset_success"
        ? "Your password has been reset successfully."
        : "Enter your admin credentials to access this section.";
  const cardIcon =
    view === "reset" ? (
      <RotateCcw className="h-8 w-8 text-primary" />
    ) : view === "reset_success" ? (
      <CheckCircle2 className="h-8 w-8 text-green-600" />
    ) : (
      <Shield className="h-8 w-8 text-primary" />
    );

  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <Card className="w-full max-w-sm border-border shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div
              className={`p-3 rounded-full ${view === "reset_success" ? "bg-green-100" : "bg-primary/10"}`}
            >
              {cardIcon}
            </div>
          </div>
          <CardTitle className="text-xl">{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          {view === "reset" ? (
            <ResetPasswordForm
              onSuccess={(username, password) => {
                setResetCreds({ username, password });
                setView("reset_success");
              }}
              onBack={() => setView("login")}
            />
          ) : view === "reset_success" && resetCreds ? (
            <ResetSuccessScreen
              username={resetCreds.username}
              password={resetCreds.password}
              onLogin={() =>
                loginAdmin(resetCreds.username, resetCreds.password)
              }
            />
          ) : (
            <LoginForm
              onForgotPassword={() => setView("reset")}
              prefillUsername={resetCreds?.username}
              prefillPassword={resetCreds?.password}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
