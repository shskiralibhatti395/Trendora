/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from "react";
import { StoreProvider, useStore } from "./context/StoreContext.jsx";
import { Header } from "./components/Header.jsx";
import { Footer } from "./components/Footer.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ProductsPage } from "./pages/ProductsPage.jsx";
import { ProductDetailPage } from "./pages/ProductDetailPage.jsx";
import { CartPage } from "./pages/CartPage.jsx";
import { CheckoutPage } from "./pages/CheckoutPage.jsx";
import { ProfilePage } from "./pages/ProfilePage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { AdminDashboard } from "./pages/AdminDashboard.jsx";
import { CheckCircle, AlertOctagon, Info, X } from "lucide-react";
function AppContent() {
  const { toasts, dismissToast, user, isLoading } = useStore();
  const [tab, setTab] = useState("home");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [promoDiscountPrice, setPromoDiscountPrice] = useState(0);
  const [promoCodeApplied, setPromoCodeApplied] = useState("");
  const renderActiveTab = () => {
    switch (tab) {
      case "home":
        return <HomePage setTab={setTab} setSelectedProductId={setSelectedProductId} setSelectedCategory={setSelectedCategory} />;
      case "products":
        return <ProductsPage
          setTab={setTab}
          setSelectedProductId={setSelectedProductId}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
        />;
      case "product-detail":
        return <ProductDetailPage
          productId={selectedProductId}
          setTab={setTab}
          setSelectedProductId={setSelectedProductId}
        />;
      case "cart":
        return <CartPage
          setTab={setTab}
          setPromoDiscountPrice={setPromoDiscountPrice}
          setPromoCodeApplied={setPromoCodeApplied}
        />;
      case "checkout":
        return <CheckoutPage
          setTab={setTab}
          promoDiscountPrice={promoDiscountPrice}
          promoCodeApplied={promoCodeApplied}
        />;
      case "profile-wishlist":
        return <ProfilePage
          setTab={setTab}
          setSelectedProductId={setSelectedProductId}
          initialPane="wishlist"
        />;
      case "profile-orders":
        return <ProfilePage
          setTab={setTab}
          setSelectedProductId={setSelectedProductId}
          initialPane="orders"
        />;
      case "profile":
        return <ProfilePage
          setTab={setTab}
          setSelectedProductId={setSelectedProductId}
        />;
      case "auth":
        return <AuthPage setTab={setTab} />;
      case "admin":
        if (user?.role === "admin") {
          return <AdminDashboard />;
        }
        setTab("home");
        return <HomePage setTab={setTab} setSelectedProductId={setSelectedProductId} />;
      default:
        return <HomePage setTab={setTab} setSelectedProductId={setSelectedProductId} />;
    }
  };
  if (isLoading) {
    return <div className="min-h-screen bg-neutral-900 border-neutral-300 flex flex-col items-center justify-center text-center gap-4">
        <div className="h-10 w-10 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
        <p className="text-xs text-neutral-400 font-medium">Securing Trendora Session Keys...</p>
      </div>;
  }
  return <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      
      {
    /* Dynamic Floating Toast Alerts wrapper */
  }
      <div id="floating-toaster-corner" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full">
        {toasts.map((t) => <div
    key={t.id}
    className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur bg-white/95 dark:bg-neutral-950/95 text-xs font-semibold leading-normal animate-fade transition-transform ${t.type === "success" ? "border-emerald-500/30 text-neutral-900 dark:text-white" : t.type === "error" ? "border-red-500/30 text-neutral-900 dark:text-white" : "border-blue-500/30 text-neutral-900 dark:text-white"}`}
  >
            {t.type === "success" && <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />}
            {t.type === "error" && <AlertOctagon size={16} className="text-red-500 shrink-0 mt-0.5" />}
            {t.type === "info" && <Info size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />}
            
            <p className="flex-1 pr-2">{t.message}</p>
            
            <button
    onClick={() => dismissToast(t.id)}
    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-0.5"
  >
              <X size={13} />
            </button>
          </div>)}
      </div>

      {
    /* Main navigation Header holds notifications pools */
  }
      <Header currentTab={tab} setTab={setTab} setSearchKeyword={setSearchKeyword} />

      {
    /* Core Active views layouts */
  }
      <main className="flex-grow">
        {renderActiveTab()}
      </main>

      {
    /* Corporate Premium Footers */
  }
      <Footer />

    </div>;
}
export default function App() {
  return <StoreProvider>
      <AppContent />
    </StoreProvider>;
}
