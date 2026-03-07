import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  const phoneNumbers = [
    { number: "8553965714", primary: true },
    { number: "6205017829", primary: false },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Get in touch with Parwati Dairy
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Address Card */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Our Location
                  </h3>
                  <address className="not-italic text-muted-foreground leading-relaxed">
                    <strong className="text-foreground block mb-2">
                      Parwati Dairy
                    </strong>
                    Srirampath Kadma Road
                    <br />
                    Ramnagar, Hazaribagh
                    <br />
                    Jharkhand – 825301
                  </address>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    Call Us
                  </h3>
                  <div className="space-y-3">
                    {phoneNumbers.map((phone) => (
                      <a
                        key={phone.number}
                        href={`tel:+91${phone.number}`}
                        className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors group"
                      >
                        <span className="text-2xl">📞</span>
                        <span className="text-lg font-semibold group-hover:underline">
                          {phone.number}
                        </span>
                        {phone.primary && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                            Primary
                          </span>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Contact Card */}
          <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/20 rounded-2xl shadow-lg p-8 md:p-12 border border-border">
            <div className="text-center mb-8">
              <img
                src="/assets/generated/logo.dim_256x256.png"
                alt="Parwati Dairy"
                className="h-20 w-20 mx-auto mb-4 rounded-full shadow-warm object-cover"
              />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Parwati Dairy
              </h2>
              <p className="text-xl text-muted-foreground hindi-text">
                शुद्ध दूध • पनीर • देसी घी
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card/80 backdrop-blur rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Quick Contact
                </h3>
                <div className="space-y-2">
                  {phoneNumbers.map((phone) => (
                    <a
                      key={phone.number}
                      href={`tel:+91${phone.number}`}
                      className="block text-primary hover:underline font-medium"
                    >
                      +91 {phone.number}
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Visit Us
                </h3>
                <p className="text-muted-foreground">
                  Srirampath Kadma Road
                  <br />
                  Ramnagar, Hazaribagh
                  <br />
                  Jharkhand – 825301
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground mb-4">
                Have questions? We're here to help!
              </p>
              <a
                href={`https://wa.me/918553965714?text=${encodeURIComponent(
                  "Hello Parwati Dairy, I have a question about your products.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                <Phone className="h-5 w-5" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
