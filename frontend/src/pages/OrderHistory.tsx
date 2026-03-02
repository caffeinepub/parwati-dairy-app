import { Package, Calendar, CheckCircle, Clock, XCircle, Truck, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrderHistory, useDeliverySchedule, useIsAdmin, useAllOrders } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import type { Order } from '../backend';

export default function OrderHistory() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  // For non-admin: use customerId = 1 (demo)
  const customerId = 1;
  const { data: myOrders, isLoading: myOrdersLoading, error: myOrdersError } = useOrderHistory(customerId);
  const { data: allOrders, isLoading: allOrdersLoading, error: allOrdersError } = useAllOrders(!!isAdmin);

  const orders = isAdmin ? allOrders : myOrders;
  const isLoading = adminLoading || (isAdmin ? allOrdersLoading : myOrdersLoading);
  const error = isAdmin ? allOrdersError : myOrdersError;

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp / 1_000_000n));
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'placed':
        return <Clock className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'canceled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
      case 'placed':
        return 'default';
      case 'delivered':
        return 'secondary';
      case 'canceled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                <Package className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Order History</h1>
              <p className="text-lg text-muted-foreground">Loading orders...</p>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="text-center">
                  <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-destructive font-semibold mb-2">Error loading order history</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error instanceof Error ? error.message : 'Please try again later.'}
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
              <Package className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Order History</h1>
            <p className="text-lg text-muted-foreground">
              {isAdmin ? 'All customer orders (Admin View)' : 'View all your past orders and their status'}
            </p>
            {isAdmin && (
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-primary/10 rounded-full text-sm text-primary font-medium">
                <ShieldAlert className="h-3.5 w-3.5" />
                Admin View — Showing all orders
              </div>
            )}
          </div>

          {/* Orders List */}
          {!orders || orders.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6">
                  {isAdmin ? 'No orders have been placed yet.' : "You haven't placed any orders yet. Start shopping now!"}
                </p>
                {!isAdmin && (
                  <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={Number(order.id)}
                  order={order}
                  formatDate={formatDate}
                  getStatusIcon={getStatusIcon}
                  getStatusVariant={getStatusVariant}
                  showCustomerId={!!isAdmin}
                />
              ))}
            </div>
          )}

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate({ to: '/delivery-schedule' })}>
              <Truck className="h-4 w-4 mr-2" />
              View Delivery Schedule
            </Button>
            {!isAdmin && (
              <Button onClick={() => navigate({ to: '/order' })}>
                <Package className="h-4 w-4 mr-2" />
                Place New Order
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface OrderCardProps {
  order: Order;
  formatDate: (timestamp: bigint) => string;
  getStatusIcon: (status: string) => React.ReactElement;
  getStatusVariant: (status: string) => 'default' | 'secondary' | 'destructive' | 'outline';
  showCustomerId?: boolean;
}

function OrderCard({ order, formatDate, getStatusIcon, getStatusVariant, showCustomerId }: OrderCardProps) {
  const { data: delivery, isLoading: deliveryLoading } = useDeliverySchedule(order.id);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Order #{Number(order.id)}
            {showCustomerId && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                (Customer #{Number(order.customerId)})
              </span>
            )}
          </CardTitle>
          <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1 w-fit">
            {getStatusIcon(order.status)}
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Product</p>
              <p className="font-semibold text-foreground">{order.product?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Quantity</p>
              <p className="font-semibold text-foreground">{Number(order.quantity)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Date</p>
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(order.orderDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Price</p>
              <p className="font-semibold text-foreground">₹{Number(order.product?.price || 0)}</p>
            </div>
          </div>

          {/* Delivery Schedule Info */}
          {order.status.toLowerCase() === 'placed' && (
            <div className="mt-4 pt-4 border-t border-border">
              {deliveryLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading delivery info...</span>
                </div>
              ) : delivery ? (
                <div className="flex items-start gap-2 bg-primary/5 p-3 rounded-lg">
                  <Truck className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Scheduled Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(delivery.deliveryDate)} at {delivery.deliveryTime}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 bg-muted/50 p-3 rounded-lg">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Delivery Not Scheduled</p>
                    <p className="text-sm text-muted-foreground">Your delivery will be scheduled soon</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
