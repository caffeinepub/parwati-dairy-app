import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  IndianRupee,
  QrCode,
  Send,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { sendWhatsAppOrder } from "../utils/whatsapp";

interface OrderFormData {
  name: string;
  phone: string;
  address: string;
  product: string;
  quantity: string;
}

// Product prices mapping
const PRODUCT_PRICES: Record<string, number> = {
  Milk: 60,
  Paneer: 400,
  Ghee: 1500,
};

export default function OrderForm() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { product?: string };

  const [formData, setFormData] = useState<OrderFormData>({
    name: "",
    phone: "",
    address: "",
    product: search.product || "",
    quantity: "",
  });

  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [errors, setErrors] = useState<
    Partial<OrderFormData & { deliveryDate?: string }>
  >({});

  useEffect(() => {
    if (search.product) {
      setFormData((prev) => ({ ...prev, product: search.product || "" }));
    }
  }, [search.product]);

  const products = [
    { value: "Milk", label: "Milk (₹60/Litre)", unit: "Litre" },
    { value: "Paneer", label: "Paneer (₹400/Kg)", unit: "Kg" },
    { value: "Ghee", label: "Ghee (₹1500/Kg)", unit: "Kg" },
  ];

  // Calculate total amount in real-time
  const totalAmount = useMemo(() => {
    if (!formData.product || !formData.quantity) return 0;
    const quantity = Number.parseFloat(formData.quantity);
    if (Number.isNaN(quantity) || quantity <= 0) return 0;
    const price = PRODUCT_PRICES[formData.product] || 0;
    return price * quantity;
  }, [formData.product, formData.quantity]);

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData & { deliveryDate?: string }> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.product) {
      newErrors.product = "Please select a product";
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = "Quantity is required";
    } else if (
      Number.isNaN(Number(formData.quantity)) ||
      Number(formData.quantity) <= 0
    ) {
      newErrors.quantity = "Please enter a valid quantity";
    }

    if (!deliveryDate) {
      newErrors.deliveryDate = "Please select a delivery date";
    } else {
      // Check if the selected date is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(deliveryDate);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.deliveryDate = "Delivery date cannot be in the past";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      sendWhatsAppOrder(formData, deliveryDate);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof OrderFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleQRCodeClick = () => {
    // Detect if user is on mobile device
    const isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    if (isMobile) {
      // Construct PhonePe UPI deep link with payment parameters
      // Using format: phonepe://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=CURRENCY
      const upiId = "parwatidairy@sbi"; // Replace with actual UPI ID from QR code
      const merchantName = "Parwati Dairy";
      const amount = totalAmount > 0 ? totalAmount.toString() : "1"; // Use calculated total or default to 1
      const currency = "INR";
      const transactionNote = formData.product
        ? `Order for ${formData.product}`
        : "Parwati Dairy Order";

      // Construct the deep link URL
      const phonePeDeepLink = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=${currency}&tn=${encodeURIComponent(transactionNote)}`;

      // Fallback URL if app is not installed
      const fallbackUrl = "https://www.phonepe.com/";

      // Track if app opened successfully
      let appOpened = false;
      const startTime = Date.now();

      // Listen for visibility change (indicates app opened)
      const visibilityHandler = () => {
        if (document.hidden) {
          appOpened = true;
        }
      };
      document.addEventListener("visibilitychange", visibilityHandler);

      // Try to open the PhonePe app
      window.location.href = phonePeDeepLink;

      // Check after a delay if app didn't open
      setTimeout(() => {
        document.removeEventListener("visibilitychange", visibilityHandler);

        const timeElapsed = Date.now() - startTime;

        // If less than 2 seconds passed and page is still visible, app likely didn't open
        if (!appOpened && timeElapsed < 2000 && !document.hidden) {
          // Show error and offer fallback
          toast.error("PhonePe app not found", {
            description:
              "Please install PhonePe app or scan the QR code manually from within the PhonePe app.",
            duration: 5000,
            action: {
              label: "Open PhonePe Website",
              onClick: () => window.open(fallbackUrl, "_blank"),
            },
          });
        } else if (appOpened || document.hidden) {
          toast.success("Opening PhonePe...", {
            description: `Please complete the payment of ₹${amount} in the PhonePe app.`,
            duration: 3000,
          });
        }
      }, 1500);
    } else {
      // On desktop, show a message that this feature is for mobile
      toast.info("Mobile feature", {
        description:
          "Please scan this QR code using your PhonePe mobile app to make the payment.",
        duration: 4000,
      });
    }
  };

  const selectedProduct = products.find((p) => p.value === formData.product);

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Place Your Order
            </h1>
            <p className="text-lg text-muted-foreground">
              Fill in the details below and we'll contact you on WhatsApp
            </p>
          </div>

          {/* Order Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border"
          >
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? "border-destructive" : "border-input"
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? "border-destructive" : "border-input"
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors`}
                  placeholder="Enter 10-digit mobile number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Delivery Address <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.address ? "border-destructive" : "border-input"
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none`}
                  placeholder="Enter your complete delivery address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Product */}
              <div>
                <label
                  htmlFor="product"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Product <span className="text-destructive">*</span>
                </label>
                <select
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.product ? "border-destructive" : "border-input"
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors`}
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.value} value={product.value}>
                      {product.label}
                    </option>
                  ))}
                </select>
                {errors.product && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.product}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Quantity {selectedProduct && `(${selectedProduct.unit})`}{" "}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0.5"
                  step="0.5"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.quantity ? "border-destructive" : "border-input"
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors`}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Delivery Date Picker */}
              <div>
                <label
                  htmlFor="deliveryDate"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Preferred Delivery Date{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal px-4 py-3 h-auto",
                        !deliveryDate && "text-muted-foreground",
                        errors.deliveryDate && "border-destructive",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate ? (
                        format(deliveryDate, "PPP")
                      ) : (
                        <span>Pick a delivery date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={(date) => {
                        setDeliveryDate(date);
                        if (errors.deliveryDate) {
                          setErrors((prev) => ({
                            ...prev,
                            deliveryDate: undefined,
                          }));
                        }
                      }}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.deliveryDate && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.deliveryDate}
                  </p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Select your preferred delivery date (today or any future date)
                </p>
              </div>

              {/* Total Amount Display */}
              {totalAmount > 0 && (
                <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-primary/20 rounded-full">
                        <IndianRupee className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Total Amount
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          ₹{totalAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>
                        {formData.quantity} {selectedProduct?.unit}
                      </p>
                      <p>
                        @ ₹{PRODUCT_PRICES[formData.product]}/
                        {selectedProduct?.unit}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment QR Code Section */}
              <div className="pt-4 border-t border-border">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Scan to Pay with PhonePe
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click the QR code to open PhonePe app
                  </p>
                </div>
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    onClick={handleQRCodeClick}
                    className="relative bg-white p-4 rounded-xl shadow-md border-2 border-primary/20 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 group"
                    aria-label="Click to open PhonePe app for payment"
                  >
                    <img
                      src="/assets/IMG_3581-1.jpeg"
                      alt="State Bank of India PhonePe Payment QR Code"
                      className="w-56 h-56 md:w-64 md:h-64 object-contain pointer-events-none"
                      onError={(e) => {
                        console.error("QR code image failed to load");
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    {/* Mobile indicator overlay */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 rounded-xl transition-colors flex items-center justify-center pointer-events-none">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Open PhonePe
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="bg-accent/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-foreground text-center">
                    <strong>Payment Instructions:</strong>
                    <br />
                    1. Click on the QR code above to open PhonePe app
                    <br />
                    2. Complete the payment using the QR code
                    <br />
                    3. After payment, click the button below to send your order
                    details
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                <Send className="h-5 w-5" />
                Send Order on WhatsApp
              </button>

              <p className="text-sm text-muted-foreground text-center">
                Your order will be sent via WhatsApp to Parwati Dairy
              </p>
            </div>
          </form>

          {/* Back to Products */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate({ to: "/products" })}
              className="text-primary hover:underline font-medium"
            >
              ← Back to Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
