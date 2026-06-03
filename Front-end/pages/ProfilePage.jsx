import { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { User, Heart, Trash2, ShoppingCart, MapPin, ClipboardList, ChevronRight } from "lucide-react";
export const ProfilePage = ({ setTab, setSelectedProductId, initialPane = "profile" }) => {
  const { user, token, wishlist, toggleWishlist, addToCart, updateProfile, showToast } = useStore();
  const [activePane, setActivePane] = useState("details");
  const [name, setName] = useState("");
  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: ""
  });
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  useEffect(() => {
    if (user) {
      setName(user.name);
      setAddress({
        fullName: user.address?.fullName || user.name || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        zipCode: user.address?.zipCode || "",
        phone: user.address?.phone || ""
      });
    }
  }, [user]);
  useEffect(() => {
    if (initialPane === "wishlist") {
      setActivePane("wishlist");
    } else if (initialPane === "orders") {
      setActivePane("orders");
    } else {
      setActivePane("details");
    }
  }, [initialPane]);
  const loadUserOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const list = await res.json();
        setOrders(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };
  useEffect(() => {
    if (activePane === "orders" && token) {
      loadUserOrders();
    }
  }, [activePane, token]);
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Name is required.", "error");
      return;
    }
    setSubmittingProfile(true);
    const success = await updateProfile(name, address);
    setSubmittingProfile(false);
  };
  const handleProductDetail = (productId) => {
    setSelectedProductId(productId);
    setTab("product-detail");
  };
  if (!user) {
    return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-[60vh] flex flex-col items-center justify-center text-center p-6 gap-4">
        <h2 className="text-xl font-bold">Account Profile Locked</h2>
        <p className="text-xs text-neutral-500 max-w-sm">Please sign in to modify shipping lists or audit order completions.</p>
        <button onClick={() => setTab("auth")} className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-6 py-3">
          Sign In Layout
        </button>
      </div>;
  }
  return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {
    /* Profile Heading */
  }
        <div className="border-b border-gray-150 dark:border-neutral-808 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-sans font-bold tracking-tight">User Account Room</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-450 mt-1">Review active cargo shipments, coordinates, wishlist drops, and private keys.</p>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-1 bg-neutral-100 dark:bg-neutral-850 p-1 rounded-2xl sm:rounded-full text-xs font-bold w-full sm:w-fit justify-center sm:justify-start">
            <button
    onClick={() => setActivePane("details")}
    className={`rounded-xl sm:rounded-full px-4 py-2 transition flex-1 sm:flex-none text-center ${activePane === "details" ? "bg-black dark:bg-white text-white dark:text-black shadow-sm" : "text-neutral-500 hover:text-black dark:hover:text-white"}`}
  >
              Account Address
            </button>
            <button
    onClick={() => setActivePane("wishlist")}
    className={`rounded-xl sm:rounded-full px-4 py-2 transition flex-1 sm:flex-none text-center ${activePane === "wishlist" ? "bg-black dark:bg-white text-white dark:text-black shadow-sm" : "text-neutral-500 hover:text-black dark:hover:text-white"}`}
  >
              Wishlist ({wishlist.length})
            </button>
            <button
    onClick={() => setActivePane("orders")}
    className={`rounded-xl sm:rounded-full px-4 py-2 transition flex-1 sm:flex-none text-center ${activePane === "orders" ? "bg-black dark:bg-white text-white dark:text-black shadow-sm" : "text-neutral-500 hover:text-black dark:hover:text-white"}`}
  >
              My Orders
            </button>
          </div>
        </div>

        {
    /* Dynamic section display */
  }
        <div className="grid grid-cols-1 gap-8">
          
          {
    /* Pan 1: Address form management */
  }
          {activePane === "details" && <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {
    /* Left Column: Details form */
  }
              <form onSubmit={handleProfileSubmit} className="lg:col-span-8 bg-gray-50/50 dark:bg-neutral-950/20 p-6 rounded-3xl border border-gray-100 dark:border-neutral-805 space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
                  <User size={16} className="text-amber-500" />
                  <h3 className="font-sans font-bold text-sm uppercase tracking-wider">Credential Coordinates</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">User ID / Email</label>
                    <input
    type="text"
    value={user.email}
    disabled
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 cursor-not-allowed px-3.5 py-2.5 text-neutral-400 focus:outline-none"
  />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">User Display Name</label>
                    <input
    type="text"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5 border-t border-gray-100 dark:border-neutral-850 pt-3">
                    <span className="text-[10px] uppercase font-bold text-amber-500 font-mono tracking-wider flex items-center gap-1">
                      <MapPin size={11} /> Shipment Address Ledger
                    </span>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono">Standard Consignee Name</label>
                    <input
    type="text"
    value={address.fullName}
    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
    className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white focus:outline-none"
  />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-505 uppercase tracking-widest font-mono">Physical Address Location</label>
                    <input
    type="text"
    value={address.street}
    onChange={(e) => setAddress({ ...address, street: e.target.value })}
    className="w-full rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-505 uppercase tracking-widest font-mono">City / Town</label>
                    <input
    type="text"
    value={address.city}
    onChange={(e) => setAddress({ ...address, city: e.target.value })}
    className="w-full rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-505 uppercase tracking-widest font-mono font-mono">State / Region</label>
                    <input
    type="text"
    value={address.state}
    onChange={(e) => setAddress({ ...address, state: e.target.value })}
    className="w-full rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-850 px-3.5 py-2.5 text-neutral-900 dark:text-white"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-505 uppercase tracking-widest font-mono font-mono">Zip / Postal Core</label>
                    <input
    type="text"
    value={address.zipCode}
    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
    className="w-full rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white"
  />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-505 uppercase tracking-widest font-mono">Consignee Active Phone</label>
                    <input
    type="tel"
    value={address.phone}
    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
    className="w-full rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3.5 py-2.5 text-neutral-900 dark:text-white"
  />
                  </div>
                </div>

                <button
    type="submit"
    disabled={submittingProfile}
    className="rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-xs px-6 py-3 hover:opacity-85 transition"
  >
                  {submittingProfile ? "Saving updates..." : "Save Coordinate Changes"}
                </button>
              </form>

              {
    /* Right Column: Mini privileges */
  }
              <div className="lg:col-span-4 bg-neutral-50 dark:bg-neutral-950 p-6 rounded-3xl border border-gray-150 dark:border-neutral-808 space-y-4">
                <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-neutral-400">Membership Attributes</h3>
                <div className="text-xs space-y-3 font-medium">
                  <div className="flex justify-between">
                    <span className="text-neutral-405">Security Role:</span>
                    <span className="font-bold text-amber-500 uppercase font-mono">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-405">Sign Up Verification:</span>
                    <span className="font-bold text-emerald-500">✓ Active Secure</span>
                  </div>
                </div>
              </div>

            </div>}

          {
    /* Pan 2: Wishlist details list */
  }
          {activePane === "wishlist" && <div className="bg-gray-50/50 dark:bg-neutral-950/20 p-6 rounded-3xl border border-gray-150 dark:border-neutral-808">
              
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800 mb-6">
                <Heart size={16} fill="currentColor" className="text-red-500" />
                <h3 className="font-sans font-bold text-sm uppercase tracking-wider">My Wishlist Vault ({wishlist.length})</h3>
              </div>

              {wishlist.length === 0 ? <div className="text-center py-16 text-neutral-500 text-xs">Your Wishlist has no allocations. Highlight product items via our Catalogues to watch for pricing updates.</div> : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                  {wishlist.map((prod) => <div
    key={prod.id}
    className="group relative rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-2.5 flex flex-col justify-between"
  >
                      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-50 dark:bg-neutral-900 cursor-pointer" onClick={() => handleProductDetail(prod.id)}>
                        <img src={prod.images[0]} className="h-full w-full object-cover" />
                      </div>
                      <h4 onClick={() => handleProductDetail(prod.id)} className="mt-2 text-xs font-bold text-neutral-900 dark:text-white truncate cursor-pointer hover:text-neutral-600 line-clamp-1">{prod.name}</h4>
                      <p className="font-mono text-[10.5px] font-bold text-neutral-550 dark:text-white mt-1">${prod.price}</p>
                      
                      <div className="mt-3 pt-2 border-t border-gray-100 dark:border-neutral-850 flex items-center justify-between gap-2.5">
                        <button
    onClick={() => addToCart(prod, 1, prod.colors[0], prod.sizes[0])}
    className="flex h-8 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-[9.5px] px-3 gap-1 uppercase"
  >
                          <ShoppingCart size={10} />
                          Add
                        </button>
                        <button
    onClick={() => toggleWishlist(prod)}
    className="text-neutral-400 hover:text-red-500 p-1 rounded-lg"
  >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>)}
                </div>}

            </div>}

          {
    /* Pan 3: Order History and order tracking status */
  }
          {activePane === "orders" && <div className="bg-gray-50/50 dark:bg-neutral-950/20 p-6 rounded-3xl border border-gray-150 dark:border-neutral-808 space-y-6">
              
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-neutral-800">
                <ClipboardList size={16} className="text-amber-500" />
                <h3 className="font-sans font-bold text-sm uppercase tracking-wider">Purchase History Trackers</h3>
              </div>

              {loadingOrders ? <div className="text-center py-12 text-xs text-neutral-400 animate-pulse">Consulting transaction databases...</div> : orders.length === 0 ? <p className="text-xs text-neutral-400 text-center py-10">No purchase records registered for your user parameters.</p> : <div className="space-y-4">
                  {orders.map((ord) => {
    const isExpanded = expandedOrderId === ord.id;
    return <div
      key={ord.id}
      className="rounded-2xl border border-gray-150 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden text-xs"
    >
                        {
      /* Summary Header bar click */
    }
                        <div
      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-neutral-50/60 dark:bg-neutral-900/60 hover:bg-neutral-100/40"
    >
                          <div className="space-y-1">
                            <h4 className="font-bold text-neutral-900 dark:text-white">Order Ref: #{ord.id}</h4>
                            <p className="text-[10px] text-neutral-400 font-mono">Authorized: {new Date(ord.createdAt).toLocaleString()}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 sm:ml-auto">
                            <span className="font-mono font-extrabold text-[#111] dark:text-white text-sm">${ord.totalPrice}</span>
                            <span className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold uppercase tracking-wider ${ord.orderStatus === "Delivered" ? "bg-emerald-500/10 text-emerald-500" : ord.orderStatus === "Shipped" ? "bg-indigo-500/10 text-indigo-550 dark:text-indigo-400" : "bg-amber-400/10 text-amber-500"}`}>
                              {ord.orderStatus}
                            </span>
                            <ChevronRight size={14} className={`text-neutral-305 transition ${isExpanded ? "rotate-90" : ""}`} />
                          </div>
                        </div>

                        {
      /* Collateral details & Interactive graphical tracking timeline */
    }
                        {isExpanded && <div className="p-4 border-t border-gray-100 dark:border-neutral-800 space-y-6">
                            
                            {
      /* Graphical Timeline Tracking status indicator */
    }
                            <div className="space-y-3">
                              <span className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-505 uppercase tracking-widest font-mono block">Logistics Progress Timeline</span>
                              
                              <div className="grid grid-cols-3 gap-2 relative">
                                {
      /* Connecting Bar paths graphics */
    }
                                <div className="absolute top-3.5 left-8 right-8 h-1 bg-gray-150 dark:bg-neutral-800 z-0 rounded">
                                  <div
      className="h-full bg-emerald-500 transition-all rounded"
      style={{
        width: ord.orderStatus === "Delivered" ? "100%" : ord.orderStatus === "Shipped" ? "50%" : "0"
      }}
    />
                                </div>

                                {
      /* Step icons */
    }
                                <div className="flex flex-col items-center gap-1 z-10">
                                  <div className="h-8 w-8 flex items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-[10px] shadow">
                                    ✓
                                  </div>
                                  <span className="text-[10px] font-bold">Placed</span>
                                </div>

                                <div className="flex flex-col items-center gap-1 z-10">
                                  <div className={`h-8 w-8 flex items-center justify-center rounded-full font-bold text-[10px] transition ${ord.orderStatus === "Shipped" || ord.orderStatus === "Delivered" ? "bg-emerald-500 text-white shadow" : "bg-gray-100 dark:bg-neutral-800 text-neutral-400"}`}>
                                    {ord.orderStatus === "Shipped" || ord.orderStatus === "Delivered" ? "\u2713" : "2"}
                                  </div>
                                  <span className={`text-[10px] font-bold ${ord.orderStatus === "Shipped" || ord.orderStatus === "Delivered" ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>Shipped</span>
                                </div>

                                <div className="flex flex-col items-center gap-1 z-10">
                                  <div className={`h-8 w-8 flex items-center justify-center rounded-full font-bold text-[10px] transition ${ord.orderStatus === "Delivered" ? "bg-emerald-500 text-white shadow" : "bg-gray-100 dark:bg-neutral-800 text-neutral-400"}`}>
                                    {ord.orderStatus === "Delivered" ? "\u2713" : "3"}
                                  </div>
                                  <span className={`text-[10px] font-bold ${ord.orderStatus === "Delivered" ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}>Delivered</span>
                                </div>
                              </div>
                            </div>

                            {
      /* Detail items row */
    }
                            <div className="space-y-3.5 border-t border-gray-100 dark:border-neutral-850 pt-5">
                              <span className="text-[9.5px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest font-mono block">Purchase Receipt Details</span>
                              
                              <div className="space-y-2.5">
                                {ord.items.map((item, idX) => <div key={idX} className="flex gap-3 justify-between">
                                    <div className="flex gap-2.5">
                                      <div className="h-8 w-8 rounded overflow-hidden shrink-0 border">
                                        <img src={item.image} className="h-full w-full object-cover" />
                                      </div>
                                      <div>
                                        <h5 className="font-bold">{item.name}</h5>
                                        <p className="text-[9.5px] text-neutral-405">{item.color} • {item.size} (x{item.quantity})</p>
                                      </div>
                                    </div>
                                    <span className="font-extrabold text-neutral-900 dark:text-white font-mono">${item.price * item.quantity}</span>
                                  </div>)}
                              </div>
                            </div>

                            {
      /* Address details summaries */
    }
                            <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 flex flex-col sm:flex-row justify-between gap-4 text-[10.5px] text-neutral-450 dark:text-neutral-400 leading-normal">
                              <div>
                                <span className="font-bold text-neutral-400 uppercase tracking-wider font-mono">Consignment Destination:</span>
                                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{ord.shippingAddress.fullName}</p>
                                <p>{ord.shippingAddress.street}</p>
                                <p>{ord.shippingAddress.city}, {ord.shippingAddress.state} {ord.shippingAddress.zipCode}</p>
                              </div>
                              <div className="sm:text-right">
                                <span className="font-bold text-neutral-400 uppercase tracking-wider font-mono">Financial details:</span>
                                <p>Transaction status: <span className="font-bold uppercase font-mono text-emerald-500">{ord.paymentStatus}</span></p>
                                <p>Simulated Gate: <span className="font-mono text-[9.5px]">{ord.paymentId}</span></p>
                              </div>
                            </div>

                          </div>}

                      </div>;
  })}
                </div>}

            </div>}

        </div>

      </div>
    </div>;
};
