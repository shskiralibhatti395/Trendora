import { useState, useEffect } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { adminService } from "../services/adminService.js";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { LayoutDashboard, ShoppingBag, ClipboardList, Users, Plus, Trash2, Edit3, CheckCircle, Clock, Truck, Upload, Link } from "lucide-react";
export const AdminDashboard = () => {
  const { user, showToast, logout } = useStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const checkResponse = async (res) => {
    if (res.status === 403 || res.status === 401) {
      const data = await res.json().catch(() => ({}));
      if (data.message && data.message.includes("Simultaneous")) {
        showToast(data.message, "error");
        logout();
        return false;
      }
    }
    return res.ok;
  };
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    usersCount: 0,
    productsCount: 0,
    lowStockProducts: 0,
    categoryDistributionChart: [],
    trendsChart: []
  });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProductMode, setEditProductMode] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "Fashion",
    brand: "",
    description: "",
    detail: "",
    stock: "",
    imagesStr: "",
    colorsStr: "",
    sizesStr: "",
    rating: "5.0"
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [showManualUrls, setShowManualUrls] = useState(false);
  const handleImageFilesChange = (files) => {
    if (!files) return;
    const validFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      showToast("Please select valid image files.", "error");
      return;
    }
    const loadPromises = validFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result);
          } else {
            reject(new Error("Failed to read file"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(loadPromises).then((urls) => {
      const currentUrls = productForm.imagesStr ? productForm.imagesStr.split("\n").filter(Boolean) : [];
      const updatedUrls = [...currentUrls, ...urls].join("\n");
      setProductForm((prev) => ({ ...prev, imagesStr: updatedUrls }));
      showToast(`Successfully uploaded ${urls.length} computer picture(s)!`, "success");
    }).catch((err) => {
      console.error(err);
      showToast("Error uploading local image files.", "error");
    });
  };
  const removeImageAt = (indexToRemove) => {
    const urls = productForm.imagesStr ? productForm.imagesStr.split("\n").filter(Boolean) : [];
    const filtered = urls.filter((_, idx) => idx !== indexToRemove);
    setProductForm((prev) => ({ ...prev, imagesStr: filtered.join("\n") }));
    showToast("Picture removed.", "success");
  };
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedOrderForAddress, setSelectedOrderForAddress] = useState(null);
  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (e) {
      if (e.status === 401 || e.status === 403) logout();
    }
  };
  const fetchProducts = async () => {
    try {
      setProducts(await adminService.getProducts());
    } catch (e) {
      if (e.status === 401 || e.status === 403) logout();
    }
  };
  const fetchOrders = async () => {
    try {
      setOrders(await adminService.getOrders());
    } catch (e) {
      if (e.status === 401 || e.status === 403) logout();
    }
  };
  const fetchUsers = async () => {
    try {
      setUsers(await adminService.getUsers());
    } catch (e) {
      if (e.status === 401 || e.status === 403) logout();
    }
  };
  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchProducts(), fetchOrders(), fetchUsers()]);
    setLoading(false);
  };
  const loadDataBackground = async () => {
    try {
      await Promise.all([fetchStats(), fetchProducts(), fetchOrders(), fetchUsers()]);
    } catch (e) {
      console.error("Background data synchronize failed", e);
    }
  };
  useEffect(() => {
    if (user?.role === "admin") {
      loadData();
      const pollTimer = setInterval(() => {
        loadDataBackground();
      }, 10000);
      return () => clearInterval(pollTimer);
    }
  }, [activeTab, user]);
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const { name, price, category, brand, description, detail, stock, imagesStr, colorsStr, sizesStr, rating } = productForm;
    if (!name || !price || !brand) {
      showToast("Name, price and brand are required.", "error");
      return;
    }
    const payload = {
      name,
      price: Number(price),
      category,
      brand,
      description,
      detail,
      stock: Number(stock) || 0,
      images: imagesStr ? imagesStr.split("\n").filter(Boolean) : [],
      colors: colorsStr ? colorsStr.split(",").map((s) => s.trim()).filter(Boolean) : ["Default"],
      sizes: sizesStr ? sizesStr.split(",").map((s) => s.trim()).filter(Boolean) : ["One Size"],
      rating: Number(rating) || 5
    };
    try {
      if (editProductMode) {
        await adminService.updateProduct(editProductMode, payload);
      } else {
        await adminService.createProduct(payload);
      }
      showToast(editProductMode ? "Product updated successfully!" : "New product created successfully!", "success");
      setShowProductModal(false);
      setEditProductMode(null);
      setProductForm({
        name: "",
        price: "",
        category: "Fashion",
        brand: "",
        description: "",
        detail: "",
        stock: "",
        imagesStr: "",
        colorsStr: "",
        sizesStr: "",
        rating: "5.0",
      });
      await loadData();
    } catch (e2) {
      showToast(e2.message || "Action failed on product.", "error");
    }
  };
  const handleEditProductClick = (prod) => {
    setEditProductMode(prod.id);
    setProductForm({
      name: prod.name,
      price: String(prod.price),
      category: prod.category,
      brand: prod.brand,
      description: prod.description || "",
      detail: prod.detail || "",
      stock: String(prod.stock),
      imagesStr: prod.images ? prod.images.join("\n") : "",
      colorsStr: prod.colors ? prod.colors.join(", ") : "",
      sizesStr: prod.sizes ? prod.sizes.join(", ") : "",
      rating: String(prod.rating || 5)
    });
    setShowProductModal(true);
  };
  const handleDeleteProduct = async (id) => {
    if (!confirm("Are you verified you wish to delete this product item?")) return;
    try {
      await adminService.deleteProduct(id);
      showToast("Product deleted successfully", "success");
      await loadData();
    } catch (e) {
      showToast(e.message || "Delete failed", "error");
    }
  };
  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    if (!confirm(`Are you sure you want to bulk-delete ${selectedProductIds.length} select item catalog records?`)) return;
    try {
      await adminService.bulkDeleteProducts(selectedProductIds);
      showToast(`Deleted ${selectedProductIds.length} products.`, "success");
      setSelectedProductIds([]);
      await loadData();
    } catch (e) {
      showToast(e.message || "Bulk delete failed", "error");
    }
  };
  const handleCheckboxSelect = (productId) => {
    setSelectedProductIds(
      (prev) => prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };
  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await adminService.updateOrderStatus(orderId, status);
      showToast(`Order #${orderId} updated to "${status}".`, "success");
      await loadData();
    } catch (e) {
      showToast(e.message || "Status update failed", "error");
    }
  };
  const handleUserRoleToggle = async (userId, currentRole) => {
    const targetRole = currentRole === "admin" ? "user" : "admin";
    try {
      await adminService.updateUserRole(userId, targetRole);
      showToast("User role updated successfully!", "success");
      await loadData();
    } catch (e) {
      showToast(e.message || "Action disallowed.", "error");
    }
  };
  const BAR_COLORS = ["#fbbf24", "#10b981", "#3b82f6", "#ec4899"];
  return <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-screen transition-colors duration-200">
      
      {
    /* Top Banner Control Header */
  }
      <div className="bg-neutral-950 text-white py-6 border-b border-neutral-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-amber-400 font-mono tracking-widest uppercase flex items-center gap-1">
              ★ Enterprise Administration Access
            </span>
            <h1 className="text-2xl font-sans font-bold tracking-tight">Trendora Command Room</h1>
            <p className="text-[10px] text-neutral-400 leading-snug">Verify global sales trends, edit physical stock files, bulk wipe catalog records, and regulate security nodes.</p>
          </div>

          <div className="flex bg-neutral-900 border border-neutral-800 rounded-full p-1 text-xs font-bold gap-1 shadow">
            <button
    onClick={() => setActiveTab("dashboard")}
    className={`rounded-full px-4 py-2 flex items-center gap-1.5 transition ${activeTab === "dashboard" ? "bg-amber-500 text-white" : "text-neutral-400"}`}
  >
              <LayoutDashboard size={13} /> Panel Summary
            </button>
            <button
    onClick={() => setActiveTab("products")}
    className={`rounded-full px-4 py-2 flex items-center gap-1.5 transition ${activeTab === "products" ? "bg-amber-500 text-white" : "text-neutral-400"}`}
  >
              <ShoppingBag size={13} /> Inventories
            </button>
            <button
    onClick={() => setActiveTab("orders")}
    className={`rounded-full px-4 py-2 flex items-center gap-1.5 transition ${activeTab === "orders" ? "bg-amber-500 text-white" : "text-neutral-400"}`}
  >
              <ClipboardList size={13} /> Shipments
            </button>
            <button
    onClick={() => setActiveTab("users")}
    className={`rounded-full px-4 py-2 flex items-center gap-1.5 transition ${activeTab === "users" ? "bg-amber-500 text-white" : "text-neutral-400"}`}
  >
              <Users size={13} /> Security Role
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? <div className="text-center py-20 text-xs text-neutral-400 animate-pulse">Syncing Administrative Nodes...</div> : <div className="space-y-8">
            
            {
    /* VIEW A: DASHBOARD OVERVIEW PANELS */
  }
            {activeTab === "dashboard" && <div className="space-y-8 animate-fade">
                
                {
    /* Visual statistics card grid elements */
  }
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  <div className="p-5 rounded-2xl border border-gray-150 dark:border-neutral-805 bg-gray-50/50 dark:bg-neutral-950 space-y-1 shadow-sm">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono uppercase">Cumulative sales</span>
                    <h3 className="text-3xl font-serif font-extrabold text-[#111] dark:text-amber-500">${stats.totalSales}</h3>
                    <p className="text-[9.5px] text-neutral-450 dark:text-neutral-500 font-medium">Secured transaction totals</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-gray-150 dark:border-neutral-805 bg-gray-50/50 dark:bg-neutral-950 space-y-1 shadow-sm">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono uppercase">Purchase checkouts</span>
                    <h3 className="text-3xl font-sans font-extrabold text-[#111] dark:text-white">{stats.ordersCount}</h3>
                    <p className="text-[9.5px] text-neutral-455 dark:text-neutral-500">Completed order tickets</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-gray-150 dark:border-neutral-805 bg-gray-50/50 dark:bg-neutral-950 space-y-1 shadow-sm">
                    <span className="text-[10px] font-bold text-neutral-400 tracking-wider font-mono uppercase">Registered Accounts</span>
                    <h3 className="text-3xl font-sans font-extrabold text-[#111] dark:text-white">{stats.usersCount}</h3>
                    <p className="text-[9.5px] text-neutral-455 dark:text-neutral-500">Active secure user keys</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-gray-150 dark:border-emerald-500/20 bg-emerald-500/5 space-y-1 shadow-sm">
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 tracking-wider font-mono uppercase">Low Stock Alerts</span>
                    <h3 className="text-3xl font-sans font-extrabold text-amber-550 dark:text-amber-400">{stats.lowStockProducts}</h3>
                    <p className="text-[9.5px] text-neutral-500">Items with stock count under 10</p>
                  </div>

                </div>

                {
    /* Analytical charts past week area line graphs */
  }
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {
    /* Linear revenue trends area */
  }
                  <div className="p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-4">
                    <div>
                      <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Revenue Timeline Trend</h3>
                      <p className="text-[10.5px] text-neutral-400 dark:text-neutral-500 mt-0.5">Linear timeline sales distributions spanning the past 7 active calendar dates.</p>
                    </div>
                    
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.trendsChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.1} />
                          <XAxis dataKey="date" stroke="#888" fontSize={9} />
                          <YAxis stroke="#888" fontSize={9} />
                          <Tooltip contentStyle={{ background: "#111", border: "#222", borderRadius: "12px", fontSize: "10px", color: "#fff" }} />
                          <Area type="monotone" dataKey="sales" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {
    /* Category distributions barcharts */
  }
                  <div className="p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-4">
                    <div>
                      <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-neutral-900 dark:text-white">Category Sales Balance</h3>
                      <p className="text-[10.5px] text-neutral-400 dark:text-neutral-505 mt-0.5">Product sector sales accumulations compiled immediately from order invoices.</p>
                    </div>

                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.categoryDistributionChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="name" stroke="#888" fontSize={9} />
                          <YAxis stroke="#888" fontSize={9} />
                          <Tooltip contentStyle={{ background: "#111", border: "#222", borderRadius: "12px", fontSize: "10px", color: "#fff" }} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                            {stats.categoryDistributionChart.map((entry, index) => <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>}

            {
    /* VIEW B: PRODUCTS INVENTORY CHRONICLE AND EDITS */
  }
            {activeTab === "products" && <div className="space-y-6 animate-fade">
                
                {
    /* Control utility headers */
  }
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-sans font-bold text-base text-neutral-900 dark:text-white">Catalog Inventory File ({products.length} Items)</h3>
                    <p className="text-[10.5px] text-neutral-400 mt-0.5">Alter retail values, track remaining individual product items, and execute bulk removals.</p>
                  </div>

                  <div className="flex gap-2.5">
                    {selectedProductIds.length > 0 && <button
    onClick={handleBulkDelete}
    className="rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-xs px-4 py-2 flex items-center gap-1"
  >
                        <Trash2 size={13} /> Bulk Wipe selected ({selectedProductIds.length})
                      </button>}
                    <button
    onClick={() => {
      setEditProductMode(null);
      setShowProductModal(true);
    }}
    className="rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs px-5 py-2 flex items-center gap-1 shadow hover:opacity-85"
  >
                      <Plus size={14} /> Add New Catalog Product
                    </button>
                  </div>
                </div>

                {
    /* Table listings elements */
  }
                <div className="border border-gray-150 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-neutral-900/60 text-neutral-400 font-mono text-[10.5px] uppercase tracking-wider border-b border-gray-100 dark:border-neutral-805">
                          <th className="py-3 px-4 w-10 text-center">Select</th>
                          <th className="py-3 px-4">Thumbnail</th>
                          <th className="py-3 px-4">Product Identifier / Name</th>
                          <th className="py-3 px-4">Retail Value</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Brand</th>
                          <th className="py-3 px-4">Remaining Inventory</th>
                          <th className="py-3 px-4">Command Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-neutral-850">
                        {products.map((prod) => <tr key={prod.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                            
                            {
    /* Checkbox select */
  }
                            <td className="py-3.5 px-4 text-center">
                              <input
    type="checkbox"
    checked={selectedProductIds.includes(prod.id)}
    onChange={() => handleCheckboxSelect(prod.id)}
    className="h-3.5 w-3.5 rounded border-gray-300 dark:border-neutral-700 text-amber-550 focus:ring-amber-500 accent-amber-500"
  />
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="h-8.5 w-8.5 rounded overflow-hidden shrink-0 border bg-neutral-100">
                                <img src={prod.images?.[0]} className="h-full w-full object-cover" />
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-neutral-900 dark:text-white truncate max-w-[180px]">{prod.name}</div>
                              <div className="text-[9.5px] font-mono text-neutral-405">{prod.id}</div>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold">${prod.price}</td>
                            <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400 font-medium">{prod.category}</td>
                            <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">{prod.brand}</td>
                            
                            <td className="py-3.5 px-4">
                              <span className={`font-mono font-semibold ${prod.stock <= 5 ? "text-red-500 font-bold" : prod.stock <= 10 ? "text-amber-500" : "text-emerald-500"}`}>
                                {prod.stock} items remaining
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex gap-2 text-neutral-450">
                                <button
    onClick={() => handleEditProductClick(prod)}
    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-[#111] dark:text-white hover:text-amber-500"
    title="Edit inventory parameters"
  >
                                  <Edit3 size={13} />
                                </button>
                                <button
    onClick={() => handleDeleteProduct(prod.id)}
    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded hover:text-red-500 transition"
    title="Delete product item"
  >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>

                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>}

            {
    /* VIEW C: CONSIGNMENTS REGISTRY SHIPMENT STATUS */
  }
            {activeTab === "orders" && <div className="space-y-6 animate-fade">
                <div>
                  <h3 className="font-sans font-bold text-base text-neutral-900 dark:text-white">Customer Consignments Ledger ({orders.length} Records)</h3>
                  <p className="text-[10.5px] text-neutral-400 mt-0.5">Oversee customer expenditures, verify billing payments and adjust delivery status coordinates.</p>
                </div>

                <div className="border border-gray-150 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 text-xs text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-neutral-900/60 text-neutral-400 font-mono text-[10.5px] uppercase tracking-wider border-b border-gray-100 dark:border-neutral-805">
                          <th className="py-3 px-4">Consignment ID</th>
                          <th className="py-3 px-4">Consignee Client</th>
                          <th className="py-3 px-4">Total Price Paid</th>
                          <th className="py-3 px-4">Method</th>
                          <th className="py-3 px-4">Status Info</th>
                          <th className="py-3 px-4">Logistics Timeline status</th>
                          <th className="py-3 px-4">Actions/Modifiers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-neutral-850">
                        {orders.map((ord) => <tr key={ord.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                            
                            <td className="py-3.5 px-4 font-mono font-semibold text-neutral-900 dark:text-white">#{ord.id}</td>
                            
                            <td className="py-3.5 px-4">
                              <div className="font-semibold">{ord.customerName}</div>
                              <div className="text-[9.5px] text-neutral-405 truncate max-w-[150px]">{ord.shippingAddress?.phone || "N/A"}</div>
                              <button
    type="button"
    onClick={() => setSelectedOrderForAddress(ord)}
    className="mt-1 text-[10px] font-bold text-amber-500 hover:text-amber-600 transition underline cursor-pointer inline-block"
  >
                                View Full Address
                              </button>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-bold">${ord.totalPrice}</td>
                            <td className="py-3.5 px-4 text-neutral-500 font-medium">{ord.paymentMethod}</td>
                            
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${ord.paymentStatus === "Paid" ? "bg-emerald-550/10 text-emerald-500" : "bg-amber-400/10 text-amber-500"}`}>
                                {ord.paymentStatus}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                {ord.orderStatus === "Delivered" ? <span className="flex items-center gap-1 text-emerald-500 font-bold">
                                    <CheckCircle size={12} /> Delivered
                                  </span> : ord.orderStatus === "Shipped" ? <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-semibold animate-pulse">
                                    <Truck size={12} /> Shipped
                                  </span> : ord.orderStatus === "Cancelled" ? <span className="text-red-500 line-through">Cancelled</span> : <span className="flex items-center gap-1 text-amber-500">
                                    <Clock size={12} /> Pending In transit
                                  </span>}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <select
    value={ord.orderStatus}
    onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
    className="text-[10px] font-bold rounded-xl border border-gray-200 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white p-1.5 focus:outline-none focus:ring-1 focus:ring-amber-505 shadow-sm"
  >
                                <option value="Pending">Set Pending</option>
                                <option value="Shipped">Set Shipped</option>
                                <option value="Delivered">Set Delivered</option>
                                <option value="Cancelled">Set Cancelled</option>
                              </select>
                            </td>

                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>}

            {
    /* VIEW D: USERS SECURITY ACCESS ROLE */
  }
            {activeTab === "users" && <div className="space-y-6 animate-fade">
                <div>
                  <h3 className="font-sans font-bold text-base text-neutral-900 dark:text-white">Security Role Credentials ({users.length} Registries)</h3>
                  <p className="text-[10.5px] text-neutral-400 mt-0.5">Toggle admin access privileges. Caution: administrative changes bypass payment authorization steps.</p>
                </div>

                <div className="border border-gray-150 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 text-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-neutral-900/60 text-neutral-400 font-mono text-[10.5px] uppercase tracking-wider border-b border-gray-100 dark:border-neutral-805">
                          <th className="py-3 px-4">User Identifier</th>
                          <th className="py-3 px-4">Credentials Email</th>
                          <th className="py-3 px-4">Registered On</th>
                          <th className="py-3 px-4">Security Privilege Role</th>
                          <th className="py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-neutral-850">
                        {users.map((u) => <tr key={u.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                            
                            <td className="py-3.5 px-4 font-mono text-neutral-405">{u.id}</td>
                            
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-neutral-900 dark:text-white">{u.name}</div>
                              <div className="text-[10px] text-neutral-400 font-medium">{u.email}</div>
                            </td>

                            <td className="py-3.5 px-4 text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            
                            <td className="py-3.5 px-4 font-bold">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider ${u.role === "admin" ? "bg-amber-400/10 text-amber-500 font-extrabold" : "bg-gray-100 dark:bg-neutral-800 text-neutral-400"}`}>
                                {u.role}
                              </span>
                            </td>

                            <td className="py-3.5 px-4">
                              <button
    onClick={() => handleUserRoleToggle(u.id, u.role)}
    className="rounded-xl border border-gray-200 dark:border-neutral-750 px-3 py-1.5 bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[10px] font-bold"
  >
                                Toggle to {u.role === "admin" ? "User" : "Admin"}
                              </button>
                            </td>

                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>}

          </div>}

      </div>

      {
    /* CORE PRODUCT MODIFIER DIALOG OVERLAYS (Used for both Creation and Editing) */
  }
      {showProductModal && <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rounded-3xl border border-gray-200 dark:border-neutral-800 max-w-2xl w-full p-6 text-xs space-y-4">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-850 pb-3">
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                <LayoutDashboard size={15} />
                {editProductMode ? "Modify Catalog Entry" : "Add New Catalog Record"}
              </h3>
              <button
    onClick={() => {
      setShowProductModal(false);
      setEditProductMode(null);
    }}
    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-bold font-mono"
  >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Product title</label>
                  <input
    type="text"
    placeholder="e.g. Atelier Silk Trench Coats"
    value={productForm.name}
    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none"
  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Brand Designer</label>
                  <input
    type="text"
    placeholder="e.g. Atelier"
    value={productForm.brand}
    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900"
  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Retail Price ($)</label>
                  <input
    type="number"
    placeholder="180"
    value={productForm.price}
    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900"
  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Product category</label>
                  <select
    value={productForm.category}
    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
  >
                    <option value="Fashion">Fashion Selection</option>
                    <option value="Tech">Tech Components</option>
                    <option value="Workspace">Office Craft Workspace</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Remaining Stock Count</label>
                  <input
    type="number"
    placeholder="25"
    value={productForm.stock}
    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900"
  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Initial Rating (1.0 - 5.0)</label>
                  <select
    value={productForm.rating}
    onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
  >
                    {[5, 4.9, 4.8, 4.7, 4.6, 4.5, 4.4, 4.2, 4, 3.5, 3, 2, 1].map((val) => <option key={val} value={String(val)}>{val} Stars</option>)}
                  </select>
                </div>

              </div>

              {
    /* Extra details segments */
  }
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-neutral-850">
                
                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Brief Description</label>
                  <input
    type="text"
    placeholder="Short summary displayed on cards..."
    value={productForm.description}
    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900"
  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Exhaustive Dossier Sheet details</label>
                  <textarea
    rows={3}
    placeholder="Exhaustive specifications and details layout..."
    value={productForm.detail}
    onChange={(e) => setProductForm({ ...productForm, detail: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-255 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none"
  />
                </div>

                {
    /* Swatches input commas separations */
  }
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Colors Swatches (Comma Separated)</label>
                    <input
    type="text"
    placeholder="Space Gray, Matte Obsidian, Gold"
    value={productForm.colorsStr}
    onChange={(e) => setProductForm({ ...productForm, colorsStr: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900"
  />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Sizes Specs (Comma Separated)</label>
                    <input
    type="text"
    placeholder="S, M, L, XL, Standard"
    value={productForm.sizesStr}
    onChange={(e) => setProductForm({ ...productForm, sizesStr: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900"
  />
                  </div>
                </div>

                {
    /* Images line break list */
  }
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">Product Pictures / Images</label>
                    <button
    type="button"
    onClick={() => setShowManualUrls(!showManualUrls)}
    className="text-[10px] text-amber-500 hover:underline font-semibold flex items-center gap-1"
  >
                      {showManualUrls ? <Upload size={10} /> : <Link size={10} />}
                      {showManualUrls ? "Switch to Computer Upload" : "Switch to Web URL Links"}
                    </button>
                  </div>

                  {
    /* Visual Thumbnails Live List */
  }
                  {productForm.imagesStr && productForm.imagesStr.split("\n").filter(Boolean).length > 0 && <div className="space-y-1.5">
                      <span className="text-[9px] text-neutral-405 dark:text-neutral-500 font-bold uppercase block">Selected Images ({productForm.imagesStr.split("\n").filter(Boolean).length}):</span>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-2.5 rounded-xl">
                        {productForm.imagesStr.split("\n").filter(Boolean).map((imgUrl, idx) => <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 group">
                            <img
    src={imgUrl}
    alt={`Thumbnail ${idx}`}
    className="h-full w-full object-cover"
    referrerPolicy="no-referrer"
    onError={(e) => {
      e.target.src = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=80";
    }}
  />
                            <button
    type="button"
    onClick={() => removeImageAt(idx)}
    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 hover:scale-110 transition shadow-sm"
    title="Delete this image"
  >
                              <Trash2 size={10} />
                            </button>
                            <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-white text-center py-0.5 truncate font-mono">
                              Pic {idx + 1}
                            </span>
                          </div>)}
                      </div>
                    </div>}

                  {
    /* Conditional Rendering: File Dropzone OR Text Area */
  }
                  {showManualUrls ? <div className="space-y-1">
                      <textarea
    rows={2}
    placeholder="https://images.unsplash.com/photo-1..."
    value={productForm.imagesStr}
    onChange={(e) => setProductForm({ ...productForm, imagesStr: e.target.value })}
    className="w-full text-xs p-2.5 rounded-xl border border-gray-250 dark:border-neutral-700 bg-white dark:bg-neutral-900 font-mono text-[10px]"
  />
                      <span className="text-[9px] text-neutral-400 block italic">Paste web image URLs directly, one image link per line.</span>
                    </div> : <div
    onDragOver={(e) => {
      e.preventDefault();
      setIsDragOver(true);
    }}
    onDragLeave={() => setIsDragOver(false)}
    onDrop={(e) => {
      e.preventDefault();
      setIsDragOver(false);
      handleImageFilesChange(e.dataTransfer.files);
    }}
    onClick={() => document.getElementById("local-product-img-upload")?.click()}
    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${isDragOver ? "border-amber-500 bg-amber-50/10" : "border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700 bg-gray-50/30 dark:bg-neutral-900/10"}`}
  >
                      <input
    id="local-product-img-upload"
    type="file"
    multiple
    accept="image/*"
    className="hidden"
    onChange={(e) => handleImageFilesChange(e.target.files)}
  />
                      <div className="flex flex-col items-center justify-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                        <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-500">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-bold text-neutral-750 dark:text-neutral-300">
                          Upload product pics from your computer
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          Drag & drop photos or click to browse local files
                        </p>
                      </div>
                    </div>}

                  {
    /* Pre-packaged styling templates */
  }
                  <div className="flex flex-wrap gap-1.5 mt-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 p-2 rounded-xl">
                    <span className="text-[9px] text-neutral-455 dark:text-neutral-500 font-bold uppercase mr-1 flex items-center">Sample Pictures:</span>
                    <button
    type="button"
    onClick={() => setProductForm({ ...productForm, imagesStr: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80\nhttps://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&auto=format&fit=crop&q=80" })}
    className="px-2 py-0.5 text-[9px] font-medium bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded border border-gray-200 dark:border-neutral-700 transition text-neutral-600 dark:text-neutral-300"
  >
                      Premium Watch
                    </button>
                    <button
    type="button"
    onClick={() => setProductForm({ ...productForm, imagesStr: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80\nhttps://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80" })}
    className="px-2 py-0.5 text-[9px] font-medium bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded border border-gray-200 dark:border-neutral-700 transition text-neutral-600 dark:text-neutral-300"
  >
                      Leather Wallet
                    </button>
                    <button
    type="button"
    onClick={() => setProductForm({ ...productForm, imagesStr: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80\nhttps://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80" })}
    className="px-2 py-0.5 text-[9px] font-medium bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded border border-gray-200 dark:border-neutral-700 transition text-neutral-600 dark:text-neutral-300"
  >
                      Cyber Keyboard
                    </button>
                    <button
    type="button"
    onClick={() => setProductForm({ ...productForm, imagesStr: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80" })}
    className="px-2 py-0.5 text-[9px] font-medium bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded border border-gray-200 dark:border-neutral-700 transition text-neutral-600 dark:text-neutral-300"
  >
                      Stylish Jacket
                    </button>
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-gray-150 dark:border-neutral-850 flex justify-end gap-3">
                <button
    type="button"
    onClick={() => {
      setShowProductModal(false);
      setEditProductMode(null);
    }}
    className="rounded-full border border-gray-250 dark:border-neutral-800 text-neutral-500 font-semibold px-5 py-2.5 hover:bg-neutral-55"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="rounded-full bg-amber-500 text-white font-bold px-7 py-2.5 shadow hover:opacity-85"
  >
                  {editProductMode ? "Save Modifications" : "Compile Resource"}
                </button>
              </div>

            </form>

          </div>
        </div>}

      {
    /* VIEW FULL ADDRESS MODAL FOR COURIER LOGISTICS */
  }
      {selectedOrderForAddress && <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade">
          <div className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 rounded-3xl border border-gray-200 dark:border-neutral-800 max-w-lg w-full p-6 text-xs space-y-4 shadow-xl">
            
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-neutral-850 pb-3">
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider flex items-center gap-1.5 text-amber-500">
                <span>Buyer Details</span>
              </h3>
              <button
    onClick={() => setSelectedOrderForAddress(null)}
    className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-bold font-mono"
  >
                ✕ Close
              </button>
            </div>

            {
    /* Simulated Logistics Courier Ticket representation */
  }
            <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 rounded-2xl p-5 font-mono text-xs text-neutral-800 dark:text-neutral-200 space-y-3.5 shadow-inner">
              <div className="pb-2.5 border-b border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-between font-bold text-neutral-900 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <span>📦</span> Shipping Details For Order #{selectedOrderForAddress.id}
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">COURIER-READY</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-400">👤</span>
                  <div className="flex-1">
                    <span className="text-neutral-400 mr-2">Customer Name:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {selectedOrderForAddress.shippingAddress?.fullName || selectedOrderForAddress.customerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-400">📱</span>
                  <div className="flex-1">
                    <span className="text-neutral-400 mr-2">Phone:</span>
                    <span className="font-bold font-mono text-neutral-900 dark:text-white">
                      {selectedOrderForAddress.shippingAddress?.phone || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-400">🏠</span>
                  <div className="flex-1">
                    <span className="text-neutral-400 mr-2">Address:</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {selectedOrderForAddress.shippingAddress?.street || "N/A"}
                      {selectedOrderForAddress.shippingAddress?.state ? `, ${selectedOrderForAddress.shippingAddress.state}` : ""}
                      {selectedOrderForAddress.shippingAddress?.zipCode ? ` ${selectedOrderForAddress.shippingAddress.zipCode}` : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-neutral-400">📍</span>
                  <div className="flex-1">
                    <span className="text-neutral-400 mr-2">City:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {selectedOrderForAddress.shippingAddress?.city || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-dashed border-neutral-300 dark:border-neutral-700 pt-3 text-[10px] text-neutral-400 italic">
                * Copying address will automatically format fields for hassle-free pasting into courier platforms (such as DHL, FedEx, standard domestic posts).
              </div>
            </div>

            <div className="pt-4 border-t border-gray-150 dark:border-neutral-850 flex justify-end gap-3 font-mono">
              <button
    type="button"
    onClick={() => {
      const ord = selectedOrderForAddress;
      const addressStr = `\u{1F4E6} Shipping Details For Order #${ord.id}
\u{1F464} Customer Name: ${ord.shippingAddress?.fullName || ord.customerName}
\u{1F4F1} Phone: ${ord.shippingAddress?.phone || "N/A"}
\u{1F3E0} Address: ${ord.shippingAddress?.street || "N/A"}${ord.shippingAddress?.state ? ", " + ord.shippingAddress.state : ""}${ord.shippingAddress?.zipCode ? " " + ord.shippingAddress.zipCode : ""}
\u{1F4CD} City: ${ord.shippingAddress?.city || "N/A"}`;
      navigator.clipboard.writeText(addressStr);
      showToast("Address copied successfully!", "success");
    }}
    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 transition flex items-center gap-1.5 cursor-pointer shadow-md"
  >
                Copy Address for Courier
              </button>
              <button
    type="button"
    onClick={() => setSelectedOrderForAddress(null)}
    className="rounded-xl border border-gray-250 dark:border-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-semibold px-5 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition cursor-pointer"
  >
                Close Window
              </button>
            </div>

          </div>
        </div>}

    </div>;
};
