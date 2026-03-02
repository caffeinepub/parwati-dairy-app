import { Shield, LogIn, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useQueries';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { login, loginStatus, identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  // Show loading while initializing identity or checking admin status
  if (isInitializing || (isAuthenticated && adminLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] px-4">
        <Card className="w-full max-w-sm border-border shadow-lg">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-5 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Admin Access Required</h2>
              <p className="text-sm text-muted-foreground">
                Please log in with your admin account to view this section.
              </p>
            </div>
            <Button
              onClick={() => login()}
              disabled={isLoggingIn}
              className="w-full"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] px-4">
        <Card className="w-full max-w-sm border-destructive/40 shadow-lg">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-5 text-center">
            <div className="p-4 bg-destructive/10 rounded-full">
              <Shield className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Unauthorized</h2>
              <p className="text-sm text-muted-foreground">
                Your account does not have admin privileges to access this section.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
