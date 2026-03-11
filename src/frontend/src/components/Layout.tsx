import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  History,
  Home,
  Menu,
  Phone,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/products", label: "Products", icon: ShoppingBag },
    { path: "/order-history", label: "Order History", icon: History },
    { path: "/delivery-schedule", label: "Delivery", icon: Truck },
    { path: "/regular-customers", label: "Regular Customers", icon: Users },
    { path: "/contact", label: "Contact", icon: Phone },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              type="button"
              onClick={() => navigate({ to: "/" })}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src="/assets/uploads/f05fb620-dd02-4626-b224-3dc8d1958cf2-1-1.jpg"
                alt="Parwati Dairy"
                className="h-12 sm:h-14 w-auto object-contain rounded-full"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = "1";
                    img.src =
                      "/assets/generated/parwati-dairy-logo.dim_800x800.png";
                  }
                }}
              />
              <div className="text-left">
                <h1 className="text-lg font-bold text-foreground">
                  Parwati Dairy
                </h1>
                <p className="text-xs text-muted-foreground hindi-text">
                  शुद्ध दूध • पनीर • देसी घी
                </p>
              </div>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => navigate({ to: item.path })}
                    data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t border-border">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => {
                      navigate({ to: item.path });
                      setMobileMenuOpen(false);
                    }}
                    data-ocid={`nav.${item.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              © {new Date().getFullYear()} Parwati Dairy. All rights reserved.
            </p>
            <p>
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? window.location.hostname
                    : "parwati-dairy",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
