import { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { Search, Heart, ShoppingCart, SlidersHorizontal, Sliders, ChevronDown, RefreshCw } from "lucide-react";
const CATEGORIES = ["All", "Fashion", "Tech", "Workspace"];
const RATINGS = [4.5, 4, 3.5, 3];
const BRANDS = ["All", "Vanguard", "AeroKey", "Atelier", "Quantum", "Urban Arc", "ZenDesk", "Horizon"];
const COLORS = ["All", "Black", "White", "Silver", "Grey", "Tan", "Beige", "Blue", "Gold"];
const SIZES = ["All", "Standard", "S", "M", "L", "XL", "38mm", "42mm", "60% Layout", "75% Layout", "Full Layout"];
export const ProductsPage = ({
  setTab,
  setSelectedProductId,
  searchKeyword,
  setSearchKeyword
}) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [color, setColor] = useState("All");
  const [size, setSize] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(500);
  const [rating, setRating] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchKeyword);
  useEffect(() => {
    setLocalSearch(searchKeyword);
  }, [searchKeyword]);
  const loadProducts = async (isAppend = false) => {
    setIsLoading(true);
    try {
      const qParams = new URLSearchParams();
      if (localSearch) qParams.set("search", localSearch);
      if (category !== "All") qParams.set("category", category);
      if (brand !== "All") qParams.set("brand", brand);
      if (color !== "All") qParams.set("color", color);
      if (size !== "All") qParams.set("size", size);
      qParams.set("minPrice", String(minPrice));
      qParams.set("maxPrice", String(maxPrice));
      if (rating > 0) qParams.set("rating", String(rating));
      const pageToLoad = isAppend ? page + 1 : 1;
      qParams.set("page", String(pageToLoad));
      qParams.set("limit", "8");
      const res = await fetch(`/api/products?${qParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (isAppend) {
          setProducts((prev) => [...prev, ...data.products]);
          setPage(pageToLoad);
        } else {
          setProducts(data.products);
          setPage(1);
        }
        setHasMore(data.hasMore);
      }
    } catch (e) {
      console.error("Failed to load products from Express API", e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    loadProducts(false);
  }, [category, brand, color, size, minPrice, maxPrice, rating, searchKeyword]);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(localSearch);
  };
  const handleLoadMore = () => {
    if (hasMore) {
      loadProducts(true);
    }
  };
  const handleProductDetail = (productId) => {
    setSelectedProductId(productId);
    setTab("product-detail");
  };
  const handleResetFilters = () => {
    setCategory("All");
    setBrand("All");
    setColor("All");
    setSize("All");
    setMinPrice(0);
    setMaxPrice(500);
    setRating(0);
    setSearchKeyword("");
    setLocalSearch("");
  };
  return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {
    /* Page Top Header */
  }
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 dark:border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-sans font-bold tracking-tight">Catalog Vault</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Discover, filter, and secure structural designer components tailored for workspace and styling composure.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
    onClick={() => setShowFilters(!showFilters)}
    className="lg:hidden flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-neutral-750 px-4 py-2.5 text-xs font-semibold focus:outline-none"
  >
              <SlidersHorizontal size={14} />
              Filters
            </button>

            <button
    onClick={handleResetFilters}
    className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-neutral-750 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold px-4 py-2.5 transition"
    title="Reset all filter fields"
  >
              <RefreshCw size={13} />
              Reset Settings
            </button>
          </div>
        </div>

        {
    /* Content Layout Grid */
  }
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {
    /* Side Filters (Desktop: Sidebar, Mobile: Toggleable Collapse) */
  }
          <div className={`${showFilters ? "block" : "hidden lg:block"} lg:col-span-1 space-y-6 bg-gray-50/50 dark:bg-neutral-955 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800/40 h-fit sticky top-24`}>
            
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
              <Sliders size={15} className="text-amber-500" />
              <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Filter Parameters</h2>
            </div>

            {
    /* Keyword search filter inside panel */
  }
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-405 dark:text-neutral-400">Search Within</label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
    type="text"
    placeholder="Filter keywords..."
    value={localSearch}
    onChange={(e) => setLocalSearch(e.target.value)}
    className="w-full rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
  />
                <button type="submit" className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-black dark:hover:text-white">
                  <Search size={14} />
                </button>
              </form>
            </div>

            {
    /* Category Dropdowns */
  }
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-405 dark:text-neutral-400">Shop Catalog Verticals</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => <button
    key={cat}
    onClick={() => setCategory(cat)}
    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition ${category === cat ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
  >
                    {cat}
                  </button>)}
              </div>
            </div>

            {
    /* Master Brands selection */
  }
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-405 dark:text-neutral-400">Curator Brand</label>
              <div className="flex flex-wrap gap-1.5">
                {BRANDS.map((b) => <button
    key={b}
    onClick={() => setBrand(b)}
    className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-full border transition ${brand === b ? "bg-black dark:bg-white text-white dark:text-black border-black/80 dark:border-white" : "bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-450 border-gray-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800"}`}
  >
                    {b}
                  </button>)}
              </div>
            </div>

            {
    /* Price Slider filter */
  }
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-405 dark:text-neutral-400">Price Threshold</span>
                <span className="font-extrabold text-amber-500 font-mono">${minPrice} - ${maxPrice}</span>
              </div>
              <input
    type="range"
    min="0"
    max="500"
    step="10"
    value={maxPrice}
    onChange={(e) => setMaxPrice(Number(e.target.value))}
    className="w-full h-1 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
  />
            </div>

            {
    /* Rating Stars filter */
  }
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-405 dark:text-neutral-400">Star Rating</label>
              <div className="flex flex-col gap-1.5">
                <button
    onClick={() => setRating(0)}
    className={`text-left text-xs font-medium py-1 px-2 rounded-lg transition ${rating === 0 ? "bg-amber-400/10 text-amber-600 font-bold" : "text-neutral-500 dark:text-neutral-400"}`}
  >
                  ★ All Ratings
                </button>
                {RATINGS.map((rate) => <button
    key={rate}
    onClick={() => setRating(rate)}
    className={`text-left text-xs font-medium py-1 px-2 rounded-lg transition ${rating === rate ? "bg-amber-400/10 text-amber-600 font-bold" : "text-neutral-500 dark:text-neutral-400"}`}
  >
                    ★ {rate} & above
                  </button>)}
              </div>
            </div>

            {
    /* Premium Colors Swatch Selection */
  }
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-405 dark:text-neutral-400 font-sans">Color Palette</label>
              <div className="flex flex-wrap gap-1">
                {COLORS.map((col) => <button
    key={col}
    onClick={() => setColor(col)}
    className={`text-[9px] font-bold px-2 py-1 rounded-full border transition ${color === col ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900" : "bg-white dark:bg-neutral-905 text-neutral-600 dark:text-neutral-300 border-gray-100 dark:border-neutral-800 hover:bg-neutral-100/50"}`}
  >
                    {col}
                  </button>)}
              </div>
            </div>

            {
    /* Custom Sizes filter lists */
  }
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-450 dark:text-neutral-400 font-sans">Sizing specs</label>
              <div className="flex flex-wrap gap-1">
                {SIZES.map((sz) => <button
    key={sz}
    onClick={() => setSize(sz)}
    className={`text-[9.5px] font-bold px-2 py-1 rounded-lg border transition ${size === sz ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900" : "bg-white dark:bg-neutral-905 text-neutral-500 dark:text-neutral-400 border-gray-150 dark:border-neutral-800 hover:bg-neutral-100"}`}
  >
                    {sz}
                  </button>)}
              </div>
            </div>

          </div>

          {
    /* Right Product Grid */
  }
          <div className="lg:col-span-3 space-y-8">
            {products.length === 0 ? <div className="text-center py-24 rounded-2xl border border-dashed border-gray-200 dark:border-neutral-800 flex flex-col items-center justify-center gap-4 bg-gray-50/50 dark:bg-neutral-950/10">
                <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-450">
                  <SlidersHorizontal size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-base text-neutral-890 dark:text-white">Matching Treasures Unresolved</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Try loosening your search terms or relaxing your price/rating constraints.</p>
                </div>
                <button
    onClick={handleResetFilters}
    className="rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-2.5 hover:opacity-80 transition"
  >
                  Reload Complete Catalog
                </button>
              </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => <div
    key={prod.id}
    className="group relative rounded-2xl border border-gray-100 dark:border-neutral-800/40 bg-white dark:bg-neutral-955 p-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
  >
                    
                    {
    /* Visual Media aspect-square */
  }
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-neutral-900">
                      <img
    src={prod.images[0]}
    alt={prod.name}
    onClick={() => handleProductDetail(prod.id)}
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
                          Out Of Stock
                        </span>}
                    </div>

                    {
    /* Metadata Header */
  }
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-450 dark:text-neutral-500 font-mono">
                        {prod.brand}
                      </span>
                      <span className="flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                        ★ {prod.rating}
                      </span>
                    </div>

                    {
    /* Title */
  }
                    <h3
    onClick={() => handleProductDetail(prod.id)}
    className="mt-1 font-sans font-bold text-neutral-800 dark:text-neutral-100 text-sm hover:text-neutral-600 dark:hover:text-neutral-400 cursor-pointer transition line-clamp-2 leading-relaxed flex-1"
  >
                      {prod.name}
                    </h3>

                    {
    /* Bottom Pricing Row */
  }
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
                        </button> : <span className="text-[9.5px] font-bold text-gray-400 border border-gray-200 dark:border-neutral-800 px-2.5 py-1 rounded-full uppercase cursor-not-allowed">
                          Sold Out
                        </span>}
                    </div>

                  </div>)}
              </div>}

            {
    /* Dynamic Infinite Scroll "Load More" trigger */
  }
            {hasMore && <div className="flex justify-center pt-4">
                <button
    onClick={handleLoadMore}
    className="rounded-full bg-gray-50 dark:bg-neutral-850 border border-gray-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-bold px-8 py-3.5 hover:bg-gray-100 dark:hover:bg-neutral-800 transition flex items-center gap-2"
  >
                  {isLoading ? "Completing Catalog Index..." : "Load Additional Items"}
                  <ChevronDown size={14} />
                </button>
              </div>}

          </div>

        </div>

      </div>
    </div>;
};
