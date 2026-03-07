import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Calendar,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import type { Order } from "../backend";
import { useDeliverySchedule, useOrderHistory } from "../hooks/useQueries";

export default function DeliverySchedule() {
  const navigate = useNavigate();
  // For demo purposes, using customerId = 1
  // In production, this would come from authenticated user context
  const customerId = 1;
  const { data: orders, isLoading, error } = useOrderHistory(customerId);

  const formatDate = (timestamp: bigint) => {
    try {
      // Convert nanoseconds to milliseconds
      const date = new Date(Number(timestamp / 1_000_000n));
      return date.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      console.error("Error formatting date:", e);
      return "Invalid date";
    }
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Filter pending orders only
  const pendingOrders =
    orders?.filter((order) => order.status.toLowerCase() === "placed") || [];

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header Skeleton */}
            <div className="text-center mb-8">
              <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-10 w-64 mx-auto mb-2" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>

            {/* Cards Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
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
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-destructive/10 rounded-full">
                    <XCircle className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-destructive">
                      Error Loading Schedule
                    </CardTitle>
                    <CardDescription>
                      Unable to fetch your delivery schedule. Please try again
                      later.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                >
                  Retry
                </Button>
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

          {/* Delivery Schedule Cards */}
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-muted rounded-full mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Pending Deliveries
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any scheduled deliveries at the moment.
                  </p>
                  <Button onClick={() => navigate({ to: "/products" })}>
                    Browse Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <DeliveryCard
                  key={order.id}
                  order={order}
                  formatDate={formatDate}
                  formatTime={formatTime}
                />
              ))}
            </div>
          )}

          {/* Delivery Guidelines */}
          <Card className="mt-8 bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Delivery Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Please ensure someone is available at the delivery address
                    during the scheduled time.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    Our delivery personnel will contact you 30 minutes before
                    arrival.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    For any changes to your delivery schedule, please contact us
                    at 8553965714.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>
                    All dairy products should be refrigerated immediately upon
                    delivery.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Back to Orders */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate({ to: "/order-history" })}
              className="text-primary hover:underline font-medium"
            >
              ← Back to Order History
            </button>
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
  const { data: delivery, isLoading: deliveryLoading } = useDeliverySchedule(
    order.id,
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">
              Order #{order.id.toString()}
            </CardTitle>
            <CardDescription>
              {order.product.name} - {order.quantity.toString()}{" "}
              {order.product.name === "Milk" ? "Litre" : "Kg"}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20"
          >
            {order.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Date */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Order Date</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(order.orderDate)}
              </p>
            </div>
          </div>

          {/* Delivery Date - from Order.deliveryDate or Delivery record */}
          {deliveryLoading ? (
            <div className="flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ) : (
            <>
              {/* Show delivery date from Order.deliveryDate if available */}
              {order.deliveryDate && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Scheduled Delivery Date
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.deliveryDate)}
                    </p>
                  </div>
                </div>
              )}

              {/* Show delivery schedule details if available */}
              {delivery ? (
                <>
                  {/* Only show this if we haven't already shown order.deliveryDate, or show time separately */}
                  {!order.deliveryDate && (
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Truck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Scheduled Delivery Date
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(delivery.deliveryDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delivery Time */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-accent rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Delivery Time
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(delivery.deliveryTime)}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                !order.deliveryDate && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Delivery Date
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Not scheduled yet
                      </p>
                    </div>
                  </div>
                )
              )}
            </>
          )}

          {/* Product Details */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Product</span>
              <span className="font-medium text-foreground">
                {order.product.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium text-foreground">
                {order.quantity.toString()}{" "}
                {order.product.name === "Milk" ? "Litre" : "Kg"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Total Amount</span>
              <span className="font-semibold text-primary">
                ₹
                {(
                  Number(order.product.price) * Number(order.quantity)
                ).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
