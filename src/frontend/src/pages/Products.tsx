import { useNavigate } from "@tanstack/react-router";
import { Droplet, Milk, Package } from "lucide-react";

export default function Products() {
  const navigate = useNavigate();

  const products = [
    {
      name: "Milk",
      nameHindi: "दूध",
      price: 60,
      unit: "Litre",
      icon: Milk,
      description: "Fresh, pure cow milk delivered daily",
      gradient: "from-blue-50 to-cyan-50",
    },
    {
      name: "Paneer",
      nameHindi: "पनीर",
      price: 400,
      unit: "Kg",
      icon: Package,
      description: "Soft, fresh homemade paneer",
      gradient: "from-amber-50 to-yellow-50",
    },
    {
      name: "Ghee",
      nameHindi: "देसी घी",
      price: 1500,
      unit: "Kg",
      icon: Droplet,
      description: "Pure desi ghee made from cow milk",
      gradient: "from-orange-50 to-amber-50",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Image */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="/assets/generated/hero.dim_1200x600.png"
          alt="Fresh Dairy Products"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground">
              Our Products
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mt-2">
              Premium quality dairy products at your service
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {products.map((product) => {
                const Icon = product.icon;
                return (
                  <div
                    key={product.name}
                    className="bg-card rounded-2xl shadow-lg overflow-hidden border border-border hover:shadow-warm transition-all duration-300 hover:scale-105"
                  >
                    <div
                      className={`bg-gradient-to-br ${product.gradient} p-8 flex justify-center`}
                    >
                      <div className="p-6 bg-white/80 rounded-full shadow-md">
                        <Icon className="h-16 w-16 text-primary" />
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {product.name}
                      </h3>
                      <p className="text-lg text-muted-foreground hindi-text mb-3">
                        {product.nameHindi}
                      </p>
                      <p className="text-muted-foreground mb-4">
                        {product.description}
                      </p>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-3xl font-bold text-primary">
                          ₹{product.price}
                        </span>
                        <span className="text-lg text-muted-foreground">
                          / {product.unit}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/order",
                            search: { product: product.name },
                          })
                        }
                        className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Price Summary */}
      <section className="py-12 md:py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-card rounded-2xl shadow-lg p-8 border border-border">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
              Price List
            </h2>
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div>
                    <span className="font-semibold text-lg">
                      {product.name}
                    </span>
                    <span className="text-muted-foreground hindi-text ml-2">
                      ({product.nameHindi})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-primary">
                      ₹{product.price}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      / {product.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
