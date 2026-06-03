import { useEffect, useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { ChevronLeft, Star, Heart, ShoppingBag, BadgeCheck, FileText } from "lucide-react";
export const ProductDetailPage = ({
  productId,
  setTab,
  setSelectedProductId
}) => {
  const { addToCart, toggleWishlist, isInWishlist, user, token, showToast } = useStore();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const fetchProductDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProduct(data.product);
        setRelatedProducts(data.related || []);
        if (data.product) {
          setActiveImage(data.product.images[0]);
          setSelectedColor(data.product.colors[0]);
          setSelectedSize(data.product.sizes[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (productId) {
      fetchProductDetail();
      setQuantity(1);
    }
  }, [productId]);
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedColor, selectedSize);
  };
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast("Please sign in to write product reviews.", "error");
      setTab("auth");
      return;
    }
    if (!commentInput.trim()) {
      showToast("Review comment cannot be empty.", "error");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput
        })
      });
      if (res.ok) {
        showToast("Thank you! Your verified review was posted successfully.", "success");
        setCommentInput("");
        setRatingInput(5);
        fetchProductDetail();
      } else {
        const err = await res.json();
        showToast(err.message || "Failed to submit review.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Network issue submitting reviews.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };
  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4" />
            <div className="h-20 bg-neutral-200 dark:bg-neutral-800 rounded w-full" />
            <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3" />
          </div>
        </div>
      </div>;
  }
  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">Catalog Entry Unresolved</h2>
        <p className="text-xs text-neutral-500">The product identifier requested is missing or has been redacted by inventory administrators.</p>
        <button onClick={() => setTab("products")} className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-6 py-2.5">
          Return to Catalog
        </button>
      </div>;
  }
  return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 sm:space-y-12 lg:space-y-16">
        
        {
    /* Back Link Row */
  }
        <button
    onClick={() => setTab("products")}
    className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-black dark:hover:text-white transition"
  >
          <ChevronLeft size={16} />
          Go back to Catalog
        </button>

        {
    /* Core Double Column Layout */
  }
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
          
          {
    /* Left: Product Images Swiper */
  }
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {
    /* Primary Display */
  }
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800/80">
              <img
    src={activeImage}
    alt={product.name}
    className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-500"
    referrerPolicy="no-referrer"
  />
              <button
    onClick={() => toggleWishlist(product)}
    className={`absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-neutral-900/90 shadow text-neutral-500 hover:scale-110 transition ${isInWishlist(product.id) ? "text-red-500" : "text-neutral-400"}`}
  >
                <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            {
    /* Carousel Thumbnails */
  }
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none snap-x max-w-full">
              {product.images.map((img, index) => <button
    key={index}
    onClick={() => setActiveImage(img)}
    className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-2 bg-gray-50 dark:bg-neutral-950 transition shrink-0 snap-start ${activeImage === img ? "border-amber-500" : "border-transparent hover:border-gray-200 dark:hover:border-neutral-850"}`}
  >
                  <img
    src={img}
    alt={`${product.name} aspect ${index}`}
    className="w-full h-full object-cover object-center"
    referrerPolicy="no-referrer"
  />
                </button>)}
            </div>

          </div>

          {
    /* Right: Technical selectors */
  }
          <div className="lg:col-span-5 space-y-6">
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 dark:text-amber-400 font-mono">
                {product.brand} • {product.category}
              </span>
              <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight">
                {product.name}
              </h2>
              
              {
    /* Rating metrics row */
  }
              <div className="flex items-center gap-2 pt-1.5">
                <div className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                  ★ {product.rating}
                </div>
                <span className="text-[11px] text-neutral-405 dark:text-neutral-500 font-medium">
                  ({product.reviewCount} customer reviews)
                </span>
                <span className="h-3 w-px bg-gray-200 dark:bg-neutral-800" />
                {product.stock > 0 ? <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    In Stock ({product.stock})
                  </span> : <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full">
                    Sold Out
                  </span>}
              </div>
            </div>

            {
    /* Price display */
  }
            <div className="text-3xl font-sans font-extrabold text-neutral-900 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800">
              ${product.price}
            </div>

            {
    /* Short description */
  }
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {product.description}
            </p>

            {
    /* Selections Section */
  }
            {product.stock > 0 && <div className="space-y-4 sm:space-y-5 border-t border-b border-gray-100 dark:border-neutral-800 py-4 sm:py-5">
                
                {
    /* 1. Color options */
  }
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-450 dark:text-neutral-500 uppercase tracking-wider font-sans">
                    Swatch Color: <span className="text-neutral-900 dark:text-white font-semibold">{selectedColor}</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((col, idx) => <button
    key={col}
    onClick={() => {
      setSelectedColor(col);
      if (product.images && product.images[idx]) {
        setActiveImage(product.images[idx]);
      }
    }}
    className={`text-xs font-bold px-3.5 py-1.5 rounded-full border transition ${selectedColor === col ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-transparent border-gray-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100/50"}`}
  >
                        {col}
                      </button>)}
                  </div>
                </div>

                {
    /* 2. Sizing Options */
  }
                {product.sizes && product.sizes.length > 0 && <div className="space-y-2">
                    <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-sans">
                      Specification Size:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sz) => <button
    key={sz}
    onClick={() => setSelectedSize(sz)}
    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition ${selectedSize === sz ? "bg-neutral-900 dark:bg-white text-white dark:text-black border-neutral-900 dark:border-white" : "bg-transparent border-gray-150 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100"}`}
  >
                          {sz}
                        </button>)}
                    </div>
                  </div>}

                {
    /* 3. Quantity limits */
  }
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-sans">
                    Quantity Selection:
                  </span>
                  <div className="flex items-center gap-3 w-fit rounded-xl border border-gray-200 dark:border-neutral-800 p-1 bg-gray-50/50 dark:bg-neutral-950">
                    <button
    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 font-bold transition text-xs"
  >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-extrabold">{quantity}</span>
                    <button
    onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 font-bold transition text-xs"
  >
                      +
                    </button>
                  </div>
                </div>

              </div>}

            {
    /* Primary Action Buttons */
  }
            <div>
              {product.stock > 0 ? <button
    onClick={handleAddToCart}
    className="w-full h-12 flex items-center justify-center gap-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition shadow-md"
  >
                  <ShoppingBag size={14} />
                  Deposit in Cart
                </button> : <button
    disabled
    className="w-full h-12 flex items-center justify-center gap-2.5 rounded-full bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-neutral-600 font-semibold text-xs uppercase cursor-not-allowed border border-gray-300 dark:border-neutral-700"
  >
                  Out of Stock Complete
                </button>}
            </div>

            {
    /* Badges details trust elements */
  }
            <div className="space-y-2 border-t border-gray-100 dark:border-neutral-800 pt-5 text-[11px] text-neutral-405 dark:text-neutral-500 font-sans">
              <div className="flex items-center gap-2">
                <BadgeCheck size={14} className="text-emerald-505 dark:text-emerald-450" />
                <span>Original design packaging details verified authentic.</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText size={14} className="text-amber-505 dark:text-amber-400" />
                <span>Extended 30-day comprehensive return and swap policy applies.</span>
              </div>
            </div>

          </div>

        </div>

        {
    /* Exhaustive Deep-Design specifications */
  }
        <section className="border-t border-gray-150 dark:border-neutral-800 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 border-r border-gray-100 dark:border-neutral-850 pr-4">
            <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Craft Details</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Trendora values absolute structural composure over fast fashion volume. Engineered using high-density tailored structures which guarantee thermal breathing, flexible stretch adaptation, and premium tactical clatters for daily coders.
            </p>
          </div>
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-sans font-extrabold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Technical Dossier</h3>
            <div className="text-xs space-y-2.5 text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans bg-gray-50/50 dark:bg-neutral-950/20 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800/40">
              {product.detail}
            </div>
          </div>
        </section>

        {
    /* Core Review and Rating publishing system */
  }
        <section className="space-y-8 border-t border-gray-150 dark:border-neutral-800 pt-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {
    /* Left: Star input compiler */
  }
            <div className="md:col-span-4 space-y-5">
              <h3 className="text-lg font-bold tracking-tight">Verified Client Feedback</h3>
              <div className="bg-gray-50/50 dark:bg-neutral-950/20 p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 space-y-2">
                <div className="text-3xl font-extrabold text-neutral-900 dark:text-white font-mono flex items-baseline gap-1">
                  {product.rating}
                  <span className="text-xs text-neutral-405 font-sans font-normal">/ 5.0 rating</span>
                </div>
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={15} fill={i < Math.floor(product.rating) ? "currentColor" : "none"} />)}
                </div>
                <p className="text-[10px] text-neutral-404 dark:text-neutral-500 leading-snug">Average rating calculated instantly based on {product.reviewCount} customer uploads.</p>
              </div>

              {
    /* Form trigger to add reviews */
  }
              <form onSubmit={handleReviewSubmit} className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase text-neutral-405 dark:text-neutral-450 tracking-wider">Publish Your Assessment</h4>
                
                {
    /* Rating selection stars */
  }
                <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-neutral-950 p-2 rounded-xl border border-gray-200 dark:border-neutral-800 w-fit">
                  <span className="text-[10.5px] font-bold text-neutral-400 mr-2 uppercase">Score:</span>
                  {[1, 2, 3, 4, 5].map((num) => <button
    type="button"
    key={num}
    onClick={() => setRatingInput(num)}
    className="text-amber-500 focus:outline-none hover:scale-110 transition"
    title={`${num} Stars`}
  >
                      <Star size={18} fill={num <= ratingInput ? "currentColor" : "none"} />
                    </button>)}
                </div>

                <div className="space-y-1">
                  <textarea
    rows={3}
    placeholder={token ? "Describe your user experience in detail..." : "Sign in to write a review"}
    value={commentInput}
    disabled={!token}
    onChange={(e) => setCommentInput(e.target.value)}
    className="w-full text-xs p-3 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:ring-1 focus:ring-amber-500 focus:outline-none disabled:bg-neutral-50 dark:disabled:bg-neutral-800 text-neutral-900 dark:text-white"
  />
                </div>

                <button
    type="submit"
    disabled={submittingReview || !token}
    className="rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-xs px-6 py-2.5 hover:opacity-85 transition disabled:opacity-40"
  >
                  {submittingReview ? "Signing..." : "Post Verified Review"}
                </button>
              </form>
            </div>

            {
    /* Right: Reviews Feed */
  }
            <div className="md:col-span-8 space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-neutral-405 dark:text-neutral-400 tracking-wider">Historical Assessment Thread</h4>
              
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 divide-y divide-gray-100 dark:divide-neutral-800">
                {product.reviews.length === 0 ? <p className="text-xs text-neutral-400 text-center py-10">No verified reviews found. Be the first to catalog your experience!</p> : product.reviews.map((rev) => <div key={rev.id} className="pt-4 first:pt-0 space-y-1 bg-white dark:bg-neutral-900">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-neutral-800 dark:text-white">
                          {rev.userName}
                        </span>
                        <span className="text-[10px] text-neutral-405 dark:text-neutral-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex text-amber-500 gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} size={11} fill={i < rev.rating ? "currentColor" : "none"} />)}
                      </div>

                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-sans pt-1">
                        {rev.comment}
                      </p>
                    </div>)}
              </div>
            </div>

          </div>

        </section>

        {
    /* Related curated items slider */
  }
        {relatedProducts.length > 0 && <section className="space-y-6 pt-8 border-t border-gray-100 dark:border-neutral-800">
            <div className="max-w-md">
              <h3 className="text-lg font-bold tracking-tight">Curated Accompaniments</h3>
              <p className="text-xs text-neutral-450 dark:text-neutral-500 mt-1">Customers that selected this item also explored these high-precision matching structures.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((rel) => <div
    key={rel.id}
    onClick={() => setSelectedProductId(rel.id)}
    className="rounded-2xl border border-gray-100 dark:border-neutral-800/40 p-2.5 bg-white dark:bg-neutral-950 hover:-translate-y-1 transition duration-200 cursor-pointer text-xs"
  >
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-900 relative">
                    <img
    src={rel.images[0]}
    alt={rel.name}
    className="h-full w-full object-cover"
    referrerPolicy="no-referrer"
  />
                  </div>
                  <h4 className="mt-2.5 font-bold text-neutral-900 dark:text-white truncate">{rel.name}</h4>
                  <div className="mt-1 flex items-center justify-between font-bold">
                    <span className="text-neutral-500 dark:text-neutral-400">${rel.price}</span>
                    <span className="text-amber-500 font-mono text-[11px]">★ {rel.rating}</span>
                  </div>
                </div>)}
            </div>
          </section>}

      </div>
    </div>;
};
