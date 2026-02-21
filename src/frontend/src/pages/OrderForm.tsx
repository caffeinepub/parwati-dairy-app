import { useState, useEffect } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { ShoppingCart, Send } from 'lucide-react';
import { sendWhatsAppOrder } from '../utils/whatsapp';

interface OrderFormData {
  name: string;
  phone: string;
  address: string;
  product: string;
  quantity: string;
}

export default function OrderForm() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { product?: string };

  const [formData, setFormData] = useState<OrderFormData>({
    name: '',
    phone: '',
    address: '',
    product: search.product || '',
    quantity: '',
  });

  const [errors, setErrors] = useState<Partial<OrderFormData>>({});

  useEffect(() => {
    if (search.product) {
      setFormData((prev) => ({ ...prev, product: search.product || '' }));
    }
  }, [search.product]);

  const products = [
    { value: 'Milk', label: 'Milk (₹60/Litre)', unit: 'Litre' },
    { value: 'Paneer', label: 'Paneer (₹400/Kg)', unit: 'Kg' },
    { value: 'Ghee', label: 'Ghee (₹1500/Kg)', unit: 'Kg' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<OrderFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.product) {
      newErrors.product = 'Please select a product';
    }

    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Please enter a valid quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      sendWhatsAppOrder(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof OrderFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
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
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-lg p-6 md:p-8 border border-border">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
                  Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.name ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-foreground mb-2">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.phone ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors`}
                  placeholder="Enter 10-digit mobile number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-foreground mb-2">
                  Delivery Address <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.address ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none`}
                  placeholder="Enter your complete delivery address"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-destructive">{errors.address}</p>
                )}
              </div>

              {/* Product */}
              <div>
                <label htmlFor="product" className="block text-sm font-semibold text-foreground mb-2">
                  Product <span className="text-destructive">*</span>
                </label>
                <select
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.product ? 'border-destructive' : 'border-input'
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
                  <p className="mt-1 text-sm text-destructive">{errors.product}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-foreground mb-2">
                  Quantity {selectedProduct && `(${selectedProduct.unit})`}{' '}
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
                    errors.quantity ? 'border-destructive' : 'border-input'
                  } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors`}
                  placeholder="Enter quantity"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-destructive">{errors.quantity}</p>
                )}
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
              onClick={() => navigate({ to: '/products' })}
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
