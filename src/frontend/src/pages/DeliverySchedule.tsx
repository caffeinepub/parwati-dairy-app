import { Truck, Calendar, Clock, Package, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useOrderHistory, useDeliverySchedule } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import type { Order } from '../backend';

export default function DeliverySchedule() {
  const navigate = useNavigate();
  // For demo purposes, using customerId = 1
  // In production, this would come from authenticated user context
  const customerId = 1;
  const { data: orders, isLoading, error } = useOrderHistory(customerId);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Filter pending orders only
  const pendingOrders = orders?.filter(order => order.status.toLowerCase() === 'placed') || [];

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                <Truck className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Delivery Schedule
              </h1>
              <p className="text-lg text-muted-foreground">Loading delivery information...</p>
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
                <p className="text-destructive text-center">
                  Error loading delivery schedule. Please try again later.
                </p>
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
              <Truck className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Delivery Schedule
            </h1>
            <p className="text-lg text-muted-foreground">
              Track your upcoming deliveries
            </p>
          </div>

          {/* Delivery Schedule List */}
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No Pending Deliveries
                </h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any pending deliveries at the moment.
                </p>
                <Button onClick={() => navigate({ to: '/order' })}>
                  Place New Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <DeliveryCard
                  key={Number(order.id)}
                  order={order}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Delivery Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Deliveries are made between 6 AM to 10 AM for morning orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Please ensure someone is available to receive the delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Contact us on WhatsApp if you need to reschedule</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/order-history' })}
            >
              <Package className="h-4 w-4 mr-2" />
              View Order History
            </Button>
            <Button onClick={() => navigate({ to: '/contact' })}>
              <Clock className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DeliveryCardProps {
  order: Order;
  formatDate: (timestamp: bigint) => string;
  formatTime: (timeString: string) => string;
}

function DeliveryCard({ order, formatDate, formatTime }: DeliveryCardProps) {
  const { data: delivery, isLoading } = useDeliverySchedule(order.id);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Order #{Number(order.id)}
          </CardTitle>
          <Badge variant="default" className="flex items-center gap-1 w-fit">
            <Clock className="h-4 w-4" />
            Pending
          </Badge>
        </div>
        <CardDescription className="mt-2">
          {order.product.name} - Quantity: {Number(order.quantity)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading delivery schedule...</span>
          </div>
        ) : delivery ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-lg">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivery Date</p>
                  <p className="font-semibold text-foreground">
                    {formatDate(delivery.deliveryDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-primary/5 p-4 rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Delivery Time</p>
                  <p className="font-semibold text-foreground">
                    {formatTime(delivery.deliveryTime)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
              <Truck className="h-4 w-4" />
              <span>Your order will be delivered fresh on the scheduled date</span>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2 bg-muted/50 p-4 rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Delivery Not Scheduled Yet
              </p>
              <p className="text-sm text-muted-foreground">
                We'll schedule your delivery soon and notify you via WhatsApp
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
