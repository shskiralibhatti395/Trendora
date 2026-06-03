import { useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { Trash2, ShoppingCart, ArrowRight, Tag } from "lucide-react";
export const CartPage = ({ setTab, setPromoDiscountPrice, setPromoCodeApplied }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, showToast } = useStore();
  const [promoInput, setPromoInput] = useState("");
  const [activeCode, setActiveCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * discountPercent / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);
  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === "TRENDORA15") {
      setDiscountPercent(15);
      setActiveCode("TRENDORA15");
      setPromoCodeApplied("TRENDORA15");
      setPromoDiscountPrice(15);
      showToast('15% Discount Promo Code "TRENDORA15" applied successfully!', "success");
    } else {
      showToast('Invalid Coupon Code. Please try "TRENDORA15" for 15% off.', "error");
    }
  };
  const handleGoToCheckout = () => {
    setTab("checkout");
  };
  if (cart.length === 0) {
    return <div className="bg-white dark:bg-neutral-900 text-neutral-950 dark:text-neutral-100 min-h-[60vh] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center gap-4 text-center">
          <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-805 text-neutral-400">
            <ShoppingCart size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="font-sans font-extrabold text-lg text-neutral-900 dark:text-white">Your Cart is Empty</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Deposits in your shopping bag are transient. Browse the catalog vaults to collect item pieces.</p>
          </div>
          <button
      onClick={() => setTab("products")}
      className="rounded-full bg-black dark:bg-white text-white dark:text-black hover:opacity-85 transition font-semibold text-xs px-6 py-3"
    >
            Explore Catalogues
          </button>
        </div>
      </div>;
  }
  return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {
    /* Title row */
  }
        <div className="border-b border-gray-150 dark:border-neutral-800 pb-5 flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-sans font-bold tracking-tight">Shopping Bag</h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Verify product allotments, quantities, and select eligible credentials before checking out.</p>
          </div>
          <button
    onClick={clearCart}
    className="text-xs font-bold text-red-500 hover:text-red-600 transition"
  >
            Clear Entire Bag
          </button>
        </div>

        {
    /* Double column cart sections */
  }
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {
    /* Left: Cart Items list */
  }
          <div className="lg:col-span-8 divide-y divide-gray-100 dark:divide-neutral-800 border-b border-gray-100 dark:border-neutral-800/80 pb-6 space-y-4">
            {cart.map((item, idx) => {
    const prod = item.product;
    return <div key={idx} className="flex gap-3.5 sm:gap-6 pt-4 first:pt-0">
                  
                  {
      /* Thumbnail Image */
    }
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-955 border border-gray-100 dark:border-neutral-800 shrink-0">
                    <img
      src={prod.images[0]}
      alt={prod.name}
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
    />
                  </div>

                  {
      /* Details */
    }
                  <div className="flex-1 flex flex-col justify-between sm:grid sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-1">{prod.name}</h4>
                      <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 font-mono flex flex-wrap gap-x-3 gap-y-1">
                        <span>Brand: {prod.brand}</span>
                        {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                      </p>
                      <div className="text-sm font-extrabold text-neutral-900 dark:text-white mt-1">
                        ${prod.price}
                      </div>
                    </div>

                    {
      /* Quantity Selector + Trash */
    }
                    <div className="flex items-center justify-between sm:justify-end gap-6 h-fit sm:mt-0 mt-3">
                      <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-neutral-800 p-0.5 bg-gray-50/50 dark:bg-neutral-950 text-xs">
                        <button
      onClick={() => updateCartQuantity(prod.id, item.quantity - 1, item.selectedColor, item.selectedSize)}
      className="h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-lg font-bold transition-colors"
    >
                          -
                        </button>
                        <span className="w-6 text-center font-bold text-neutral-900 dark:text-white">{item.quantity}</span>
                        <button
      onClick={() => updateCartQuantity(prod.id, item.quantity + 1, item.selectedColor, item.selectedSize)}
      className="h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-lg font-bold transition-colors"
    >
                          +
                        </button>
                      </div>

                      <button
      onClick={() => removeFromCart(prod.id, item.selectedColor, item.selectedSize)}
      className="text-neutral-400 hover:text-red-500 transition rounded-lg p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-800"
      title="Delete product"
    >
                        <Trash2 size={16} />
                      </button>
                    </div>

                  </div>
                </div>;
  })}
          </div>

          {
    /* Right: Summary sidebar details */
  }
          <div className="lg:col-span-4 bg-gray-55/30 dark:bg-neutral-950 p-6 rounded-3xl border border-gray-150 dark:border-neutral-800 space-y-6">
            <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Order Summary</h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Cart Subtotal</span>
                <span className="font-bold text-neutral-900 dark:text-white">${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 flex items-center gap-1">
                  Climate Logistics Delivery
                  <span className="text-[9px] uppercase font-mono font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">Complimentary</span>
                </span>
                <span className="font-bold text-emerald-500 font-mono">FREE</span>
              </div>

              {activeCode && <div className="flex justify-between">
                  <span className="text-neutral-500 flex items-center gap-1.5">
                    Coupons Discount:
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 uppercase bg-amber-400/10 border border-amber-300/20 px-1.5 py-0.5 rounded">
                      <Tag size={9} />
                      {activeCode}
                    </span>
                  </span>
                  <span className="font-bold text-amber-500 font-mono">-${discountAmount} (15% off)</span>
                </div>}

              <div className="h-px bg-gray-100 dark:bg-neutral-800 pt-1" />
              <div className="flex justify-between text-sm py-2">
                <span className="font-bold text-neutral-900 dark:text-white">Grand Balance</span>
                <span className="font-serif font-extrabold text-neutral-900 dark:text-white text-lg">${finalTotal}</span>
              </div>
            </div>

            {
    /* Promo Code inputs */
  }
            <form onSubmit={handleApplyPromo} className="space-y-2 pt-1 border-t border-gray-100 dark:border-neutral-800">
              <label className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Promo Code Input</label>
              <div className="flex gap-1.5">
                <input
    type="text"
    placeholder="e.g. TRENDORA15"
    value={promoInput}
    onChange={(e) => setPromoInput(e.target.value)}
    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 uppercase focus:outline-none"
  />
                <button
    type="submit"
    className="rounded-xl bg-black dark:bg-white text-white dark:text-black hover:opacity-80 transition text-xs font-bold px-4"
  >
                  Verify
                </button>
              </div>
              <p className="text-[9.5px] text-neutral-400 dark:text-neutral-500 leading-normal">Hint: Test using <code className="bg-neutral-100 dark:bg-neutral-850 px-1 py-0.5 rounded font-bold font-mono">TRENDORA15</code> to trigger instant 15% off.</p>
            </form>

            <button
    onClick={handleGoToCheckout}
    className="w-full h-12 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.99] transition flex items-center justify-center gap-1.5 shadow-md"
  >
              Progress to Checkout
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>
    </div>;
};
