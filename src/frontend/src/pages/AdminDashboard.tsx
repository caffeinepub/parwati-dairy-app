import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  IndianRupee,
  KeyRound,
  Loader2,
  LogOut,
  Package,
  Shield,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Order } from "../backend";
import AdminGuard from "../components/AdminGuard";
import { useAdminSession } from "../hooks/useAdminSession";
import {
  hashPassword,
  useAllOrders,
  useChangeAdminCredentials,
  useRegularCustomers,
} from "../hooks/useQueries";

// ─── Product prices for total calculation ─────────────────────────────────────
const PRODUCT_PRICES: Record<string, number> = {
  Milk: 60,
  Paneer: 400,
  Ghee: 1500,
};

function getOrderTotal(order: Order): number {
  const price =
    PRODUCT_PRICES[order.product?.name] ?? Number(order.product?.price ?? 0);
  return price * Number(order.quantity);
}

function formatDate(ts: bigint | undefined): string {
  if (!ts) return "—";
  try {
    // ICP timestamps are in nanoseconds
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toLowerCase()) {
    case "delivered":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

// ─── All Orders Tab ───────────────────────────────────────────────────────────
function AllOrdersTab() {
  const { isAdminLoggedIn } = useAdminSession();
  const { data: orders, isLoading, error } = useAllOrders(isAdminLoggedIn);

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="orders.loading_state">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" data-ocid="orders.error_state">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load orders. Please refresh.
        </AlertDescription>
      </Alert>
    );
  }

  const sorted = orders
    ? [...orders].sort((a, b) => Number(b.orderDate) - Number(a.orderDate))
    : [];

  if (sorted.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="orders.empty_state"
      >
        <ShoppingBag className="h-14 w-14 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No orders yet</p>
        <p className="text-sm mt-1">
          Orders will appear here once customers place them.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Total:{" "}
        <span className="font-semibold text-foreground">{sorted.length}</span>{" "}
        order{sorted.length !== 1 ? "s" : ""}
      </p>
      <ScrollArea
        className="border border-border rounded-lg"
        data-ocid="orders.table"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order #</TableHead>
              <TableHead>Customer Phone</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Qty</TableHead>
              <TableHead className="text-right">Total (₹)</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Delivery Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((order, idx) => (
              <TableRow
                key={Number(order.id)}
                data-ocid={`orders.item.${idx + 1}`}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  #{Number(order.id)}
                </TableCell>
                <TableCell className="font-medium">
                  {order.phoneNumber || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-sm">
                      {order.product?.name ?? "—"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">
                  {Number(order.quantity)}
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  ₹{getOrderTotal(order).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDate(order.orderDate)}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatDate(
                    order.deliveryDate ?? order.requestedDeliveryDate,
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusBadgeVariant(order.status)}
                    className="text-xs capitalize"
                  >
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

// ─── Customer Records Tab (summary) ──────────────────────────────────────────
function CustomerRecordsTab() {
  const { data: customers, isLoading, error } = useRegularCustomers();

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="customers.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" data-ocid="customers.error_state">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load customers. Please refresh.
        </AlertDescription>
      </Alert>
    );
  }

  const list = customers ?? [];

  if (list.length === 0) {
    return (
      <div
        className="text-center py-16 text-muted-foreground"
        data-ocid="customers.empty_state"
      >
        <Users className="h-14 w-14 mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No customers yet</p>
        <p className="text-sm mt-1">
          Go to{" "}
          <a
            href="/regular-customers"
            className="text-primary underline underline-offset-2"
          >
            Regular Customers
          </a>{" "}
          to add them.
        </p>
      </div>
    );
  }

  const activeCount = list.filter((c) => c.isActive).length;
  const totalDue = list.reduce(
    (s, c) => s + (c.totalAmountDue - c.amountReceived),
    0,
  );

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-foreground">{list.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total Customers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active</p>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-4 pb-4 text-center">
            <p
              className={`text-2xl font-bold ${totalDue > 0 ? "text-destructive" : "text-green-600"}`}
            >
              ₹{totalDue.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Balance Due</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer table */}
      <ScrollArea
        className="border border-border rounded-lg"
        data-ocid="customers.table"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="text-right">Daily Qty (L)</TableHead>
              <TableHead className="text-right">Rate (₹/L)</TableHead>
              <TableHead className="text-right">Total Due (₹)</TableHead>
              <TableHead className="text-right">Received (₹)</TableHead>
              <TableHead className="text-right">Balance (₹)</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((c, idx) => {
              const balance = c.totalAmountDue - c.amountReceived;
              return (
                <TableRow
                  key={Number(c.customerId)}
                  data-ocid={`customers.item.${idx + 1}`}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.phone}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[140px] truncate">
                    {c.address || "—"}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {c.dailyMilkQuantity}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    ₹{c.pricePerLitre}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    ₹{c.totalAmountDue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-sm text-green-600">
                    ₹{c.amountReceived.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold text-sm ${balance > 0 ? "text-destructive" : "text-green-600"}`}
                  >
                    ₹{balance.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {c.lastPaymentDate || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={c.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}

// ─── Change Password Section ──────────────────────────────────────────────────
function ChangePasswordSection() {
  const changeCredentials = useChangeAdminCredentials();
  const [oldPassword, setOldPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!oldPassword || !newUsername.trim() || !newPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      const [oldHash, newHash] = await Promise.all([
        hashPassword(oldPassword),
        hashPassword(newPassword),
      ]);
      const ok = await changeCredentials.mutateAsync({
        oldPasswordHash: oldHash,
        newUsername: newUsername.trim(),
        newPasswordHash: newHash,
      });
      if (ok) {
        setSuccess(true);
        setOldPassword("");
        setNewUsername("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError("Current password is incorrect.");
      }
    } catch {
      setError("Failed to update credentials. Please try again.");
    }
  };

  return (
    <Card data-ocid="admin.change_password.card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-5 w-5 text-primary" />
          Change Admin Credentials
        </CardTitle>
        <CardDescription>
          Update your admin username and password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="cp-old">Current Password</Label>
            <div className="relative">
              <Input
                id="cp-old"
                type={showPasswords ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="pr-10"
                data-ocid="admin.change_password.input"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPasswords((v) => !v)}
                tabIndex={-1}
              >
                {showPasswords ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-username">New Username</Label>
            <Input
              id="cp-username"
              autoComplete="username"
              placeholder="New username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-new">New Password</Label>
            <Input
              id="cp-new"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-confirm">Confirm New Password</Label>
            <Input
              id="cp-confirm"
              type={showPasswords ? "text" : "password"}
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
              data-ocid="admin.change_password.error_state"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert
              data-ocid="admin.change_password.success_state"
              className="border-green-500 bg-green-50 text-green-800"
            >
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                Credentials updated successfully!
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={changeCredentials.isPending}
            data-ocid="admin.change_password.submit_button"
          >
            {changeCredentials.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4 mr-2" />
                Update Credentials
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { logoutAdmin } = useAdminSession();

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Page header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-6 w-6 text-primary" />
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  Manage customer records and view all order details.
                </p>
              </div>
              {/* Logout shown outside AdminGuard for dashboard-level access */}
            </div>
          </div>

          <AdminGuard>
            <div className="space-y-8">
              {/* Logout button */}
              <div className="flex justify-end">
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

              {/* Main tabs */}
              <Tabs defaultValue="customers">
                <TabsList className="mb-6" data-ocid="admin.tab">
                  <TabsTrigger
                    value="customers"
                    className="flex items-center gap-1.5"
                    data-ocid="admin.customers.tab"
                  >
                    <Users className="h-4 w-4" />
                    Customer Records
                  </TabsTrigger>
                  <TabsTrigger
                    value="orders"
                    className="flex items-center gap-1.5"
                    data-ocid="admin.orders.tab"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    All Orders
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-1.5"
                    data-ocid="admin.settings.tab"
                  >
                    <KeyRound className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="customers">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">
                        Regular Customer Records
                      </h2>
                    </div>
                    <CustomerRecordsTab />
                  </div>
                </TabsContent>

                <TabsContent value="orders">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">
                        All Customer Orders
                      </h2>
                    </div>
                    <AllOrdersTab />
                  </div>
                </TabsContent>

                <TabsContent value="settings">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold text-foreground">
                        Admin Settings
                      </h2>
                    </div>
                    <ChangePasswordSection />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </AdminGuard>
        </div>
      </div>
    </div>
  );
}
