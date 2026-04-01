"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
};

const services = [
  {
    name: "Luxury Skin Consultation",
    duration: "45 min",
    description: "A deep skin assessment and treatment roadmap tailored to your glow goals.",
  },
  {
    name: "Signature Silk Press",
    duration: "90 min",
    description: "Heat-protected smoothing and precision styling with a mirror-finish shine.",
  },
  {
    name: "Royal Bridal Glam",
    duration: "2.5 hrs",
    description: "Full makeup artistry and finishing touches for unforgettable bridal moments.",
  },
  {
    name: "Brow Architecture",
    duration: "30 min",
    description: "Professional shaping and tinting to define your natural facial structure.",
  },
];

const products: Product[] = [
  {
    id: 1,
    name: "Rose Velvet Cleanser",
    description: "Creamy cleanser with rose water and ceramides for daily softness.",
    price: 34,
  },
  {
    id: 2,
    name: "Pink Quartz Serum",
    description: "Brightening serum to revive dull skin and lock in hydration.",
    price: 48,
  },
  {
    id: 3,
    name: "Silk Finish Hair Oil",
    description: "Nourishing blend for smooth, frizz-free shine and protection.",
    price: 29,
  },
  {
    id: 4,
    name: "Glow Ritual Mask",
    description: "Weekend recovery mask with gentle exfoliating botanicals.",
    price: 39,
  },
];

const testimonials = [
  {
    name: "Amina R.",
    role: "Bridal Client",
    quote:
      "The consultation was detailed and warm. My bridal look lasted all day and photographed beautifully.",
  },
  {
    name: "Sharon K.",
    role: "Monthly Member",
    quote:
      "Zuri Luxe made my skincare routine simple and effective. The Pink Quartz Serum is now a staple.",
  },
  {
    name: "Linet M.",
    role: "Haircare Client",
    quote:
      "I love the atmosphere and professionalism. My silk press stays smooth for days with zero frizz.",
  },
];

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#products", label: "Products" },
  { href: "#contact", label: "Contact" },
];

type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
};

const initialBookingData: BookingFormData = {
  name: "",
  email: "",
  phone: "",
  service: "",
};

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [bookingData, setBookingData] = useState<BookingFormData>(initialBookingData);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const raw = window.localStorage.getItem("zuri-cart");
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const restored: Record<number, number> = {};

      for (const [key, value] of Object.entries(parsed)) {
        const productId = Number(key);
        const qty = Number(value);
        if (Number.isFinite(productId) && Number.isFinite(qty) && qty > 0) {
          restored[productId] = Math.floor(qty);
        }
      }

      setCart(restored);
    } catch {
      window.localStorage.removeItem("zuri-cart");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("zuri-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const sectionIds = ["home", "services", "products", "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      {
        root: null,
        rootMargin: "-38% 0px -45% 0px",
        threshold: 0,
      }
    );

    for (const id of sectionIds) {
      const section = document.getElementById(id);
      if (section) {
        observer.observe(section);
      }
    }

    return () => observer.disconnect();
  }, []);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((total, qty) => total + qty, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + product.price * (cart[product.id] ?? 0),
        0
      ),
    [cart]
  );

  const addToCart = (id: number) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const openQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const goToProducts = () => {
    setIsMobileMenuOpen(false);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const openBooking = () => {
    setBookingStatus("idle");
    setBookingMessage(null);
    setIsBookingOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleBookingSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmittingBooking(true);
    setBookingStatus("idle");
    setBookingMessage(null);

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "Unable to submit booking right now.");
      }

      setBookingStatus("success");
      setBookingMessage(result.message ?? "Consultation request submitted successfully.");
      setBookingData(initialBookingData);
    } catch (error) {
      setBookingStatus("error");
      setBookingMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again in a few moments."
      );
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="zuri-bg min-h-screen text-[#3f1f33]">
      <header className="sticky top-4 z-30 px-4 md:px-8">
        <div className="mx-auto max-w-6xl space-y-2">
          <nav className="glass-floating flex items-center justify-between rounded-full px-4 py-3 md:px-6">
            <a
              href="#home"
              className="brand-mark text-lg md:text-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Zuri Luxe
            </a>

            <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${activeSection === link.href.slice(1) ? "nav-link-active" : ""}`}
                  aria-current={activeSection === link.href.slice(1) ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button type="button" className="cart-chip" aria-label="Items in cart">
                Cart {cartCount}
              </button>
              <button
                type="button"
                className="mobile-toggle md:hidden"
                aria-label="Toggle mobile navigation"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              >
                {isMobileMenuOpen ? "Close" : "Menu"}
              </button>
            </div>
          </nav>

          {isMobileMenuOpen ? (
            <div className="glass-floating mobile-menu-panel rounded-3xl p-4 md:hidden">
              <div className="flex flex-col gap-2 text-sm font-semibold">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`mobile-link ${
                      activeSection === link.href.slice(1) ? "mobile-link-active" : ""
                    }`}
                    aria-current={activeSection === link.href.slice(1) ? "page" : undefined}
                    onClick={handleNavLinkClick}
                  >
                    {link.label}
                  </a>
                ))}
                <button type="button" className="primary-cta mt-2 justify-center" onClick={openBooking}>
                  Book Consultation
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <main id="home" className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-4 pb-28 pt-12 md:px-8">
        <section className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="kicker">PREMIUM BEAUTY STUDIO</p>
            <h1 className="hero-title text-4xl leading-tight md:text-6xl">
              Elegant Beauty,
              <br />
              Timeless Confidence.
            </h1>
            <p className="max-w-xl text-base text-[#6b3c58] md:text-lg">
              Zuri Luxe blends expert consultation, modern salon artistry, and curated products
              in one refined experience.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openBooking}
                className="primary-cta"
              >
                Book Consultation
              </button>
              <a href="#products" className="secondary-cta">
                Buy Products
              </a>
            </div>
            <div className="metric-grid pt-2">
              <article className="metric-card">
                <p className="metric-value">4.9/5</p>
                <p className="metric-label">Client Rating</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">1.2k+</p>
                <p className="metric-label">Consultations</p>
              </article>
              <article className="metric-card">
                <p className="metric-value">24h</p>
                <p className="metric-label">Response Time</p>
              </article>
            </div>
          </div>

          <div className="glass-panel float-card relative space-y-4 overflow-hidden rounded-3xl p-6 md:p-8">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <h2 className="relative text-lg font-bold text-[#5d2e48]">Today at Zuri Luxe</h2>
            <div className="grid gap-3 text-sm">
              <div className="glass-soft relative rounded-2xl p-4">
                <p className="font-semibold">Consultation Slots</p>
                <p className="text-[#7d5670]">Available: 10:30 AM, 1:00 PM, 4:30 PM</p>
              </div>
              <div className="glass-soft relative rounded-2xl p-4">
                <p className="font-semibold">Most Booked Service</p>
                <p className="text-[#7d5670]">Luxury Skin Consultation</p>
              </div>
              <div className="glass-soft relative rounded-2xl p-4">
                <p className="font-semibold">Top Product</p>
                <p className="text-[#7d5670]">Pink Quartz Serum</p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title text-3xl md:text-4xl">Consultation & Salon Services</h2>
            <span className="spotlight-pill">Custom plans available</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((service) => (
              <article key={service.name} className="glass-panel card-hover rounded-2xl p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#53263f]">{service.name}</h3>
                  <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-semibold text-[#8a4d6b]">
                    {service.duration}
                  </span>
                </div>
                <p className="text-sm text-[#744b63]">{service.description}</p>
                <button type="button" className="mt-4 text-sm font-semibold text-[#b13270]" onClick={openBooking}>
                  Reserve this service
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="products" className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="section-title text-3xl md:text-4xl">Shop Zuri Luxe Products</h2>
            <p className="rounded-full bg-white/60 px-4 py-2 text-sm font-semibold text-[#744b63]">
              Total: ${cartTotal.toFixed(2)}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="glass-panel card-hover rounded-2xl p-5">
                <div className="product-thumb mb-4 h-36 rounded-xl" />
                <h3 className="text-base font-bold text-[#562842]">{product.name}</h3>
                <p className="mt-2 min-h-12 text-sm text-[#775067]">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-[#c03a7a]">${product.price}</span>
                  <button
                    type="button"
                    className="secondary-cta !px-3 !py-2 text-sm"
                    onClick={() => addToCart(product.id)}
                  >
                    Add
                  </button>
                </div>
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold tracking-wide text-[#b13270]"
                  onClick={() => openQuickView(product)}
                >
                  Quick View
                </button>
                {cart[product.id] ? (
                  <p className="mt-2 text-xs font-semibold text-[#a32964]">
                    In cart: {cart[product.id]}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="section-title text-3xl md:text-4xl">Client Love</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="glass-panel card-hover rounded-2xl p-5">
                <p className="testimonial-quote">"{item.quote}"</p>
                <p className="mt-5 font-semibold text-[#5d2f48]">{item.name}</p>
                <p className="text-sm text-[#8b5a74]">{item.role}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-floating ribbon rounded-3xl px-6 py-8 md:px-10">
          <p className="kicker">MEMBERSHIP EXPERIENCE</p>
          <h3 className="section-title mt-2 text-2xl md:text-3xl">Join the Zuri Luxe Beauty Circle</h3>
          <p className="mt-2 max-w-2xl text-[#6f425a]">
            Get priority consultation slots, seasonal treatment bundles, and early access to new
            product launches.
          </p>
          <button type="button" className="primary-cta mt-5" onClick={openBooking}>
            Start Your Membership
          </button>
        </section>
      </main>

      <footer id="contact" className="mx-auto mb-10 w-full max-w-6xl px-4 md:px-8">
        <div className="glass-floating rounded-3xl px-6 py-7 text-sm text-[#693f57] md:px-8">
          <p className="brand-mark text-2xl">Zuri Luxe</p>
          <p className="mt-2">Book consultations, discover premium products, and glow with confidence.</p>
          <p className="mt-4">Contact: hello@zuriluxe.com | +254 700 123 456</p>
        </div>
      </footer>

      <div className="mobile-bottom-cta md:hidden">
        <button type="button" className="primary-cta flex-1 justify-center" onClick={openBooking}>
          Book
        </button>
        <button type="button" className="secondary-cta flex-1 justify-center" onClick={goToProducts}>
          Cart {cartCount}
        </button>
      </div>

      {selectedProduct ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-[#2b0f1f]/40 px-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="kicker">PRODUCT DETAILS</p>
                <h3 className="section-title text-2xl">{selectedProduct.name}</h3>
              </div>
              <button
                type="button"
                className="text-sm font-semibold text-[#7a4a63]"
                onClick={() => setSelectedProduct(null)}
              >
                Close
              </button>
            </div>
            <div className="product-thumb mb-4 h-44 rounded-2xl" />
            <p className="text-sm leading-7 text-[#6d445d]">{selectedProduct.description}</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-xl font-extrabold text-[#c03a7a]">${selectedProduct.price}</span>
              <button
                type="button"
                className="primary-cta"
                onClick={() => {
                  addToCart(selectedProduct.id);
                  setSelectedProduct(null);
                }}
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isBookingOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#2b0f1f]/45 px-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="section-title text-2xl">Book a Consultation</h3>
              <button
                type="button"
                className="text-sm font-semibold text-[#7a4a63]"
                onClick={() => setIsBookingOpen(false)}
              >
                Close
              </button>
            </div>
            <form className="space-y-3" onSubmit={handleBookingSubmit}>
              <input
                className="form-input"
                type="text"
                placeholder="Your name"
                value={bookingData.name}
                onChange={(event) =>
                  setBookingData((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
              <input
                className="form-input"
                type="email"
                placeholder="Email address"
                value={bookingData.email}
                onChange={(event) =>
                  setBookingData((prev) => ({ ...prev, email: event.target.value }))
                }
                required
              />
              <input
                className="form-input"
                type="tel"
                placeholder="Phone number"
                value={bookingData.phone}
                onChange={(event) =>
                  setBookingData((prev) => ({ ...prev, phone: event.target.value }))
                }
                required
              />
              <select
                className="form-input"
                value={bookingData.service}
                onChange={(event) =>
                  setBookingData((prev) => ({ ...prev, service: event.target.value }))
                }
                required
              >
                <option value="" disabled>
                  Select service
                </option>
                {services.map((service) => (
                  <option key={service.name} value={service.name}>
                    {service.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="primary-cta w-full justify-center"
                disabled={isSubmittingBooking}
              >
                {isSubmittingBooking ? "Submitting..." : "Confirm Booking"}
              </button>
              {bookingMessage ? (
                <p
                  className={`text-sm ${
                    bookingStatus === "success" ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {bookingMessage}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
