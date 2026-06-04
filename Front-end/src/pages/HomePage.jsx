import { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { productService } from "../services/productService.js";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Zap, ShoppingCart, Heart } from "lucide-react";
const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1400&auto=format&fit=crop&q=80",
    title: "Designed for Living",
    tagline: "Minimalist Fashion Meets Developer Accessories",
    description: "Explore Trendora\u2019s curated, architectural silhouettes and hot-swappable tactile mechanics that elevate standard daily focus, crafted with surgical precision.",
    cta: "Discover the Edit",
    category: "All"
  },
  {
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&auto=format&fit=crop&q=80",
    title: "The Autumn Tailoring Suite",
    tagline: "Atelier Premium Cashmere & Pure Wool Coats",
    description: "Immaculate structural shoulder profiles, Silk-touch satin linings, and heavy-gauge double-breasted insulation protecting against seasonal winds elegantly.",
    cta: "Browse Fashion",
    category: "Fashion"
  },
  {
    image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1400&auto=format&fit=crop&q=80",
    title: "Workspace Sanctuary",
    tagline: "Tactile Coders, Mechanical Soundscapes",
    description: "Enhance ergonomic spine health and keyboard tactile clatters with lubricated physical brown keycaps and architectural mountain bamboo risers.",
    cta: "Explore Tech",
    category: "Tech"
  }
];
export const HomePage = ({ setTab, setSelectedProductId, setSelectedCategory }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((p) => (p + 1) % HERO_SLIDES.length);
    }, 6e3);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await productService.getProducts();
        const items = data.products.slice(0, 4);
        setFeaturedProducts(items);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeatured();
  }, []);
  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setTab("product-detail");
  };
  return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      
      {
    /* 1. Immersive Hero Section Slider */
  }
      <section className="relative w-full h-[520px] bg-neutral-950 overflow-hidden">
        {HERO_SLIDES.map((slide, idx) => <div
    key={idx}
    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeSlide === idx ? "opacity-100" : "opacity-0 pointer-events-none"}`}
  >
            {
    /* Dark Overlay Background */
  }
            <div className="absolute inset-0 bg-neutral-900/60 z-10" />
            <img
    src={slide.image}
    alt={slide.title}
    className="w-full h-full object-cover object-center scale-105"
    referrerPolicy="no-referrer"
  />

            {
    /* Slider Content */
  }
            <div className="absolute inset-0 flex items-center z-20 px-4 sm:px-8 max-w-7xl mx-auto">
              <div className="max-w-xl text-white space-y-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <Sparkles size={12} />
                  Seasonal Premiere
                </span>
                <h1 className="text-4xl sm:text-5xl font-sans font-bold tracking-tight leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm sm:text-base text-neutral-300 font-medium">
                  {slide.tagline}
                </p>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal">
                  {slide.description}
                </p>
                
                <div className="pt-4 flex gap-4">
                  <button
    onClick={() => setTab("products")}
    className="group rounded-full bg-white text-black font-semibold text-xs px-6 py-3 hover:bg-neutral-100 transition duration-150 flex items-center gap-1.5 shadow-lg"
  >
                    {slide.cta}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>)}

        {
    /* Carousel indicators */
  }
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {HERO_SLIDES.map((_, idx) => <button
    key={idx}
    onClick={() => setActiveSlide(idx)}
    className={`h-2.5 rounded-full transition-all duration-300 ${activeSlide === idx ? "w-8 bg-white" : "w-2.5 bg-white/40"}`}
    aria-label={`Go to slide ${idx + 1}`}
  />)}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">

        {
    /* 2. Premium Colored Core Pillars with custom image cards */
  }
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-5 rounded-2xl border border-amber-500/10 dark:border-amber-500/15 bg-amber-500/[0.03] dark:bg-amber-950/10 hover:bg-amber-500/[0.06] dark:hover:bg-amber-950/15 flex flex-col gap-3 transition duration-200">
            <div className="h-32 w-full rounded-xl overflow-hidden relative shadow-inner mb-1 bg-neutral-100 dark:bg-neutral-800">
              <img
    src="https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80"
    alt="Premium Quality Textile Threading"
    className="w-full h-full object-cover select-none"
    referrerPolicy="no-referrer"
  />
              <div className="absolute inset-0 bg-neutral-900/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">Premium Quality</h3>
            </div>
            <p className="text-[11.5px] text-neutral-550 dark:text-neutral-405 leading-relaxed">
              Each textile thread and mechanical spring verified under rigorous testing parameters.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-emerald-500/10 dark:border-emerald-500/15 bg-emerald-500/[0.03] dark:bg-emerald-950/10 hover:bg-emerald-500/[0.06] dark:hover:bg-emerald-950/15 flex flex-col gap-3 transition duration-200">
            <div className="h-32 w-full rounded-xl overflow-hidden relative shadow-inner mb-1 bg-neutral-100 dark:bg-neutral-800">
              <img
    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80"
    alt="Expedited Logistics Shipment"
    className="w-full h-full object-cover select-none"
    referrerPolicy="no-referrer"
  />
              <div className="absolute inset-0 bg-neutral-900/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
                <Truck size={16} />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">Complimentary Delivery</h3>
            </div>
            <p className="text-[11.5px] text-neutral-550 dark:text-neutral-405 leading-relaxed">
              Expedited, climate-controlled package logistics to your immediate coordinates.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-indigo-500/10 dark:border-indigo-500/15 bg-indigo-500/[0.03] dark:bg-indigo-950/10 hover:bg-indigo-500/[0.06] dark:hover:bg-indigo-950/15 flex flex-col gap-3 transition duration-200">
            <div className="h-32 w-full rounded-xl overflow-hidden relative shadow-inner mb-1 bg-neutral-100 dark:bg-neutral-800">
              <img
    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=80"
    alt="Realistic Payment Gateway Simulation"
    className="w-full h-full object-cover select-none"
    referrerPolicy="no-referrer"
  />
              <div className="absolute inset-0 bg-neutral-900/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-500 text-white shadow-sm">
                <Zap size={16} />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">Simulated Checkout</h3>
            </div>
            <p className="text-[11.5px] text-neutral-550 dark:text-neutral-405 leading-relaxed">
              Integrated with realistic Razorpay gateways for full checkout security demonstration.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-purple-500/10 dark:border-purple-500/15 bg-purple-500/[0.03] dark:bg-purple-950/10 hover:bg-purple-500/[0.06] dark:hover:bg-purple-950/15 flex flex-col gap-3 transition duration-200">
            <div className="h-32 w-full rounded-xl overflow-hidden relative shadow-inner mb-1 bg-neutral-100 dark:bg-neutral-800">
              <img
    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"
    alt="Curated Minimalist Lifestyle Accessories"
    className="w-full h-full object-cover select-none"
    referrerPolicy="no-referrer"
  />
              <div className="absolute inset-0 bg-neutral-900/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-purple-500 text-white shadow-sm">
                <Sparkles size={16} />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white">Curated Collections</h3>
            </div>
            <p className="text-[11.5px] text-neutral-550 dark:text-neutral-405 leading-relaxed">
              No clutter, only carefully tailored items matching modern high-composure lifestyles.
            </p>
          </div>

        </section>

        {
    /* 3. Category Bento grid links */
  }
        <section className="space-y-6">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Shop Curated Verticals</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Select from our elite designer catalogs to center your daily aesthetic preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
    onClick={() => { setSelectedCategory("Fashion"); setTab("products"); }}
    className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
  >
               <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-900/30 transition-colors z-10" />
              <img
    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80"
    alt="Apparel Category"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    referrerPolicy="no-referrer"
  />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-300">Curates Selection</span>
                <h3 className="text-lg font-bold">Premium Fashion</h3>
                <span className="text-xs font-semibold flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Discover Now <ArrowRight size={12} />
                </span>
              </div>
            </div>

            <div
    onClick={() => { setSelectedCategory("Tech"); setTab("products"); }}
    className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm"
  >
              <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-900/30 transition-colors z-10" />
              <img
    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80"
    alt="Tech Category"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    referrerPolicy="no-referrer"
  />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Acoustics & Input</span>
                <h3 className="text-lg font-bold">Workspace Tech</h3>
                <span className="text-xs font-semibold flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Discover Now <ArrowRight size={12} />
                </span>
              </div>
            </div>

            <div
    onClick={() => { setSelectedCategory("Workspace"); setTab("products"); }}
    className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-sm md:col-span-1"
  >
              <div className="absolute inset-0 bg-neutral-950/40 group-hover:bg-neutral-900/30 transition-colors z-10" />
              <img
    src="https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80"
    alt="Accessories Category"
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    referrerPolicy="no-referrer"
  />
              <div className="absolute bottom-6 left-6 z-20 text-white">
                <span className="text-[10px] uppercase font-bold tracking-widest text-sky-300">Bespoke Accents</span>
                <h3 className="text-lg font-bold">Office Craft</h3>
                <span className="text-xs font-semibold flex items-center gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Discover Now <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </section>

        {
    /* 4. Featured Product Section items */
  }
        <section className="space-y-6">
          <div className="flex justify-between items-end">
            <div className="max-w-md">
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Featured Treasures</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Our current pinnacle selections spanning active user rating counts and craftsmanship.</p>
            </div>
            <button
    onClick={() => setTab("products")}
    className="flex items-center gap-1.5 text-xs font-bold hover:gap-2.5 transition-all text-neutral-905 dark:text-neutral-100 text-neutral-800 bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 rounded-full"
  >
              View Entire Collection
              <ArrowRight size={12} />
            </button>
          </div>

          {isLoading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="animate-pulse space-y-4">
                  <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-2xl h-64" />
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/2" />
                </div>)}
            </div> : <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((prod) => <div
    key={prod.id}
    className="group relative rounded-2xl border border-gray-100 dark:border-neutral-800/40 bg-white dark:bg-neutral-950 p-3 shadow-none hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 flex flex-col h-full"
  >
                  {
    /* Image wrapper */
  }
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-neutral-900">
                    <img
    src={prod.images[0]}
    alt={prod.name}
    onClick={() => handleProductClick(prod.id)}
    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 cursor-pointer"
    referrerPolicy="no-referrer"
  />
                    
                    {
    /* Floating Wishlist triggers */
  }
                    <button
    onClick={() => toggleWishlist(prod)}
    className={`absolute top-2.5 right-2.5 h-8.5 w-8.5 flex items-center justify-center rounded-full shadow bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md transition ${isInWishlist(prod.id) ? "text-red-500" : "text-neutral-400 hover:text-neutral-900 dark:hover:text-white"}`}
  >
                      <Heart size={15} fill={isInWishlist(prod.id) ? "currentColor" : "none"} />
                    </button>

                    {prod.stock <= 5 && prod.stock > 0 && <span className="absolute bottom-2.5 left-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Low Stock: {prod.stock}
                      </span>}
                    {prod.stock === 0 && <span className="absolute bottom-2.5 left-2.5 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Out of Stock
                      </span>}
                  </div>

                  {
    /* Brand & Stars */
  }
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 font-mono">
                      {prod.brand}
                    </span>
                    <span className="flex items-center gap-0.5 text-xs text-amber-505 font-bold text-amber-500">
                      ★ {prod.rating}
                    </span>
                  </div>

                  {
    /* Title & Price */
  }
                  <h3
    onClick={() => handleProductClick(prod.id)}
    className="mt-1 font-sans font-bold text-neutral-890 dark:text-neutral-100 text-sm hover:text-neutral-600 dark:hover:text-neutral-400 cursor-pointer transition line-clamp-1 flex-1"
  >
                    {prod.name}
                  </h3>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-50 dark:border-neutral-850">
                    <span className="font-sans font-extrabold text-neutral-900 dark:text-white text-base">
                      ${prod.price}
                    </span>

                    {prod.stock > 0 ? <button
    onClick={() => addToCart(prod, 1, prod.colors[0], prod.sizes[0])}
    className="flex h-8.5 items-center justify-center rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-85 transition px-3 gap-1.5 text-[10px] font-bold uppercase"
  >
                        <ShoppingCart size={11} />
                        Add
                      </button> : <span className="text-[10px] font-bold text-gray-400 border border-gray-200 dark:border-neutral-800 px-2.5 py-1 rounded-full uppercase cursor-not-allowed">
                        Sold Out
                      </span>}
                  </div>
                </div>)}
            </div>}
        </section>

        {
    /* 5. Autumn Newsletter Premium panel */
  }
        <section className="rounded-3xl border border-gray-100 dark:border-neutral-800 p-8 sm:p-12 bg-neutral-50 dark:bg-neutral-950/40 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
          <div className="max-w-xl space-y-3">
            <span className="text-amber-500 font-bold uppercase tracking-widest text-[10px] font-mono">Exclusive Membership</span>
            <h2 className="text-3xl font-sans font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
              Unlock the Elite Concierge Wardrobe Layouts
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Activate special promo code <code className="bg-amber-400/10 dark:bg-amber-400/5 text-amber-600 dark:text-amber-450 text-xs px-2.5 py-1 rounded-lg font-mono font-bold">TRENDORA15</code> inside checkout flows to receive an instant 15% discount subtotal. Join now for private drops.
            </p>
          </div>
          <button
    onClick={() => setTab("products")}
    className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-8 py-4 hover:opacity-90 transition shadow-lg shrink-0"
  >
            Enter Storefront
          </button>
        </section>

      </div>
    </div>;
};
