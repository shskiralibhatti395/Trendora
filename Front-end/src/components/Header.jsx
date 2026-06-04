import { useState } from "react";
import { useStore } from "../context/StoreContext.jsx";
import { Search, ShoppingBag, Heart, Bell, User, Sun, Moon, LogOut, Menu, X, LayoutDashboard } from "lucide-react";
export const Header = ({ currentTab, setTab, setSearchKeyword }) => {
  const { user, cart, wishlist, notifications, theme, toggleTheme, logout, markAllNotificationsRead } = useStore();
  const [searchInput, setSearchInput] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(searchInput);
    setTab("products");
    setShowMobileMenu(false);
  };
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadNotifs > 0) {
      markAllNotificationsRead();
    }
  };
  return <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        
        {
    /* Left: Brand Logo & Navigation */
  }
        <div className="flex items-center gap-3 sm:gap-8">
          <button
    id="logo-button"
    onClick={() => {
      setTab("home");
      setSearchKeyword("");
      setSearchInput("");
    }}
    className="flex items-center gap-1.5 sm:gap-2 group"
  >
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-black dark:bg-white text-white dark:text-black font-mono font-bold text-base sm:text-lg tracking-tighter group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="font-sans font-bold text-base sm:text-xl tracking-tight text-neutral-900 dark:text-white">
              Trendora
            </span>
          </button>

          {
    /* Nav Links Desktop */
  }
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button
    id="nav-home"
    onClick={() => {
      setTab("home");
      setSearchKeyword("");
    }}
    className={`hover:text-black dark:hover:text-white transition-colors ${currentTab === "home" ? "text-black dark:text-white border-b-2 border-black dark:border-white py-1" : "text-neutral-500 dark:text-neutral-400"}`}
  >
              Home
            </button>
            <button
    id="nav-shop"
    onClick={() => {
      setTab("products");
      setSearchKeyword("");
    }}
    className={`hover:text-black dark:hover:text-white transition-colors ${currentTab === "products" ? "text-black dark:text-white border-b-2 border-black dark:border-white py-1" : "text-neutral-500 dark:text-neutral-400"}`}
  >
              Catalog
            </button>
            {user?.role === "admin" && <button
    id="nav-admin"
    onClick={() => setTab("admin")}
    className={`flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors text-amber-600 dark:text-amber-400 font-semibold ${currentTab === "admin" ? "border-b-2 border-amber-500 dark:border-amber-400 py-1" : ""}`}
  >
                <LayoutDashboard size={14} />
                Admin
              </button>}
          </nav>
        </div>

        {
    /* Center: Search input */
  }
        <div className="hidden sm:block flex-1 max-w-sm mx-8">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
    type="text"
    placeholder="Search premium apparel, gadgets..."
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    className="w-full rounded-full border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-neutral-900 dark:text-white px-4 py-2 pl-10 text-xs focus:border-black dark:focus:border-white focus:outline-none transition-colors"
  />
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
          </form>
        </div>

        {
    /* Right: Actions */
  }
        <div className="flex items-center gap-1 sm:gap-3 md:gap-4">
          
          {
    /* Light/Dark Toggle */
  }
          <button
    id="theme-toggle"
    onClick={toggleTheme}
    className="hidden sm:inline-flex rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400 transition"
    aria-label="Toggle theme"
  >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {
    /* Wishlist Icon */
  }
          <button
    id="wishlist-trigger"
    onClick={() => setTab("profile-wishlist")}
    className="hidden sm:inline-flex relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400 transition"
  >
            <Heart size={18} />
            {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {wishlist.length}
              </span>}
          </button>

          {
    /* Cart Icon */
  }
          <button
    id="cart-trigger"
    onClick={() => setTab("cart")}
    className="relative rounded-full p-1.5 sm:p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400 transition animate-fade"
  >
            <ShoppingBag size={17} className="sm:w-[18px] sm:h-[18px]" />
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 sm:h-4.5 sm:w-4.5 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black text-[9px] sm:text-[10px] font-bold">
                {cartCount}
              </span>}
          </button>

          {
    /* Notifications Panel Trigger */
  }
          <div className="hidden sm:block relative">
            <button
    id="notifications-trigger"
    onClick={handleNotificationClick}
    className={`relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400 transition ${unreadNotifs > 0 ? "animate-pulse" : ""}`}
  >
              <Bell size={18} />
              {unreadNotifs > 0 && <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-amber-500" />}
            </button>

            {showNotifications && <div id="notifications-popover" className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl py-2 text-xs z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-neutral-800 font-bold text-[13px] text-neutral-900 dark:text-white">
                  <span>Store Feed</span>
                  <span className="text-[10px] text-amber-500 font-medium">Real-time alerts</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-neutral-850">
                  {notifications.length === 0 ? <div className="p-4 text-center text-neutral-400">No recent store updates.</div> : notifications.map((notif) => <div key={notif.id} className={`p-3 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition cursor-default ${!notif.isRead ? "border-l-2 border-amber-500 pl-2.5" : ""}`}>
                        <div className="font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                          <span>{notif.title}</span>
                          <span className="text-[9px] font-normal text-neutral-400">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1 leading-snug">{notif.message}</p>
                      </div>)}
                </div>
              </div>}
          </div>

          {
    /* User Section dropdown */
  }
          {user ? <div className="flex items-center gap-1 sm:gap-2">
              <button
    id="profile-trigger"
    onClick={() => setTab("profile")}
    className="flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-750 text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition"
  >
                <User size={13} />
                <span className="hidden sm:inline max-w-20 truncate">{user.name}</span>
              </button>
              <button
    id="logout-button"
    onClick={logout}
    className="hidden sm:flex rounded-full p-2 text-neutral-500 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition"
    title="Logout"
  >
                <LogOut size={16} />
              </button>
            </div> : <button
    id="login-trigger"
    onClick={() => setTab("auth")}
    className="rounded-full bg-black dark:bg-white text-white dark:text-black px-2.5 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition shadow-sm"
  >
              Sign In
            </button>}

          {
    /* Mobile Menu Icon */
  }
          <button
    id="mobile-menu-trigger"
    onClick={() => setShowMobileMenu(!showMobileMenu)}
    className="md:hidden rounded-full p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
  >
            {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
          </button>

        </div>
      </div>

      {
    /* Mobile Drawer */
  }
      {showMobileMenu && <div id="mobile-menu-drawer" className="md:hidden border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors py-4 px-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
    type="text"
    placeholder="Search store catalog..."
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    className="w-full rounded-xl border border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-neutral-900 dark:text-white px-3.5 py-2 pl-9 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white focus:outline-none"
  />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          </form>

          <div className="flex flex-col gap-2 font-medium">
            <button
    id="mobile-nav-home"
    onClick={() => {
      setTab("home");
      setSearchKeyword("");
      setShowMobileMenu(false);
    }}
    className={`text-left py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/40 text-sm ${currentTab === "home" ? "bg-gray-100 dark:bg-neutral-800 font-bold text-black dark:text-white" : "text-neutral-600 dark:text-neutral-400"}`}
  >
              Home
            </button>
            <button
    id="mobile-nav-shop"
    onClick={() => {
      setTab("products");
      setSearchKeyword("");
      setShowMobileMenu(false);
    }}
    className={`text-left py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/40 text-sm ${currentTab === "products" ? "bg-gray-100 dark:bg-neutral-800 font-bold text-black dark:text-white" : "text-neutral-600 dark:text-neutral-400"}`}
  >
              Catalog
            </button>
            {user?.role === "admin" && <button
    id="mobile-nav-admin"
    onClick={() => {
      setTab("admin");
      setShowMobileMenu(false);
    }}
    className="text-left text-amber-500 py-2.5 px-3 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/10 font-bold text-sm"
  >
                Admin Control Room
              </button>}

            {
    /* Mobile Wishlist Link */
  }
            <button
    id="mobile-nav-wishlist"
    onClick={() => {
      setTab("profile-wishlist");
      setShowMobileMenu(false);
    }}
    className={`flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/40 text-sm ${currentTab === "profile-wishlist" ? "bg-gray-100 dark:bg-neutral-800 font-bold text-black dark:text-white" : "text-neutral-600 dark:text-neutral-400"}`}
  >
              <div className="flex items-center gap-2">
                <Heart size={15} />
                <span>Wishlist</span>
              </div>
              {wishlist.length > 0 && <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>}
            </button>

            {
    /* Mobile Notifications toggle */
  }
            <button
    id="mobile-nav-notifications"
    onClick={() => {
      setShowMobileNotifications(!showMobileNotifications);
      if (!showMobileNotifications && unreadNotifs > 0) {
        markAllNotificationsRead();
      }
    }}
    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/40 text-sm text-neutral-600 dark:text-neutral-400"
  >
              <div className="flex items-center gap-2">
                <Bell size={15} />
                <span>Notifications</span>
              </div>
              {unreadNotifs > 0 ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {unreadNotifs}
                </span> : <span className="text-[10px] text-neutral-400">Up to date</span>}
            </button>

            {showMobileNotifications && <div className="ml-3 pl-3 border-l border-neutral-200 dark:border-neutral-850 space-y-2 py-1 animate-fade">
                {notifications.length === 0 ? <div className="text-[11px] text-neutral-400 py-1">No recent store updates.</div> : notifications.slice(0, 3).map((notif) => <div key={notif.id} className="text-[11.5px] leading-snug text-neutral-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-800/20 p-1.5 rounded-lg">
                      <div className="font-semibold text-neutral-850 dark:text-neutral-200 flex items-center justify-between">
                        <span>{notif.title}</span>
                        <span className="text-[8.5px] text-neutral-400 font-normal">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-neutral-500 dark:text-neutral-450 mt-0.5">{notif.message}</p>
                    </div>)}
              </div>}

            {
    /* Mobile Theme Toggle */
  }
            <button
    id="mobile-nav-theme"
    onClick={() => {
      toggleTheme();
      setShowMobileMenu(false);
    }}
    className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/40 text-sm text-neutral-600 dark:text-neutral-400"
  >
              <div className="flex items-center gap-2">
                {theme === "light" ? <Moon size={15} /> : <Sun size={15} />}
                <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
              </div>
              <span className="text-[10px] text-neutral-400 capitalize">{theme} theme</span>
            </button>

            {user && <button
    id="mobile-logout"
    onClick={() => {
      logout();
      setShowMobileMenu(false);
    }}
    className="flex items-center gap-2 text-left text-red-500 py-2.5 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/10 font-medium text-sm"
  >
                <LogOut size={14} />
                Log out
              </button>}
          </div>
        </div>}
    </header>;
};
