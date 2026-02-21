import { useNavigate } from '@tanstack/react-router';
import { Milk, Package, Droplet, Phone } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const products = [
    {
      name: 'Milk Order',
      icon: Milk,
      path: '/order',
      search: { product: 'Milk' },
      gradient: 'from-amber-100 to-orange-100',
    },
    {
      name: 'Paneer Order',
      icon: Package,
      path: '/order',
      search: { product: 'Paneer' },
      gradient: 'from-yellow-100 to-amber-100',
    },
    {
      name: 'Ghee Order',
      icon: Droplet,
      path: '/order',
      search: { product: 'Ghee' },
      gradient: 'from-orange-100 to-yellow-100',
    },
    {
      name: 'Contact',
      icon: Phone,
      path: '/contact',
      gradient: 'from-amber-100 to-yellow-100',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <img
              src="/assets/generated/parwati-dairy-logo.dim_800x800.png"
              alt="Parwati Dairy Logo"
              className="max-w-xs sm:max-w-sm md:max-w-md mx-auto mb-6 w-full h-auto object-contain"
            />
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Parwati Dairy
            </h1>
            <p className="text-2xl md:text-3xl text-muted-foreground hindi-text mb-6">
              शुद्ध दूध • पनीर • देसी घी
            </p>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Fresh, pure dairy products delivered to your doorstep. Quality you can trust, taste you'll love.
            </p>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {products.map((product) => {
                const Icon = product.icon;
                return (
                  <button
                    key={product.name}
                    onClick={() =>
                      navigate({
                        to: product.path,
                        search: product.search,
                      })
                    }
                    className={`group relative overflow-hidden bg-gradient-to-br ${product.gradient} rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-warm transition-all duration-300 hover:scale-105 border-2 border-border/50`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-4">
                      <div className="p-4 bg-white/80 rounded-full shadow-md group-hover:scale-110 transition-transform">
                        <Icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground">
                        {product.name}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose Parwati Dairy?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                <div className="text-4xl mb-4">🥛</div>
                <h3 className="text-xl font-bold mb-2">100% Pure</h3>
                <p className="text-muted-foreground">
                  No additives, no preservatives. Just pure, natural dairy.
                </p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                <div className="text-4xl mb-4">🚚</div>
                <h3 className="text-xl font-bold mb-2">Home Delivery</h3>
                <p className="text-muted-foreground">
                  Fresh products delivered right to your doorstep.
                </p>
              </div>
              <div className="text-center p-6 bg-card rounded-xl shadow-sm">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
                <p className="text-muted-foreground">
                  Traditional methods, modern hygiene standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
