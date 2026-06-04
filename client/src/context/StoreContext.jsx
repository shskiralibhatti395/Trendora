import { createContext, useContext, useState, useEffect, useRef } from "react";
import { authService } from "../services/authService.js";
import { cartService } from "../services/cartService.js";
import { apiFetch, setToken, clearToken } from "../services/api.js";

const StoreContext = createContext(undefined);

export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const cartSyncReady = useRef(false);
  const wishlistSyncReady = useRef(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("trendora_theme");
    setTheme(savedTheme || "dark");
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("trendora_theme", theme);
  }, [theme]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const userData = await authService.getMe();
        setUser(userData);
        const [cartData, wishlistData] = await Promise.all([
          cartService.getCart(),
          cartService.getWishlist(),
        ]);
        setCart(cartData.cart || []);
        setWishlist(wishlistData.wishlist || []);
      } catch {
        setUser(null);
        setCart([]);
        setWishlist([]);
      } finally {
        cartSyncReady.current = true;
        wishlistSyncReady.current = true;
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (!user || !cartSyncReady.current) return;

    const timer = setTimeout(async () => {
      try {
        await cartService.saveCart(cart);
      } catch {
        showToast("Could not sync cart to your account", "error");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [cart, user]);

  useEffect(() => {
    if (!user || !wishlistSyncReady.current) return;

    const timer = setTimeout(async () => {
      try {
        await cartService.saveWishlist(wishlist);
      } catch {
        showToast("Could not sync favorites to your account", "error");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [wishlist, user]);

  const showToast = (message, type) => {
    const id = `toast-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismissToast(id), 4000);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    showToast(`Switched to ${theme === "light" ? "dark" : "light"} theme`, "info");
  };

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      if (data.token) setToken(data.token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, "success");
      try {
        cartSyncReady.current = false;
        wishlistSyncReady.current = false;
        const [cartData, wishlistData] = await Promise.all([
          cartService.getCart(),
          cartService.getWishlist(),
        ]);
        setCart(cartData.cart || []);
        setWishlist(wishlistData.wishlist || []);
      } catch {
        /* cart/wishlist fetch may race cookie set — Bearer token fixes this after deploy */
      }
      cartSyncReady.current = true;
      wishlistSyncReady.current = true;
      return { success: true, user: data.user };
    } catch (err) {
      showToast("Invalid email or password", "error");
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await authService.register(name, email, password);
      if (data.token) setToken(data.token);
      setUser(data.user);
      setCart([]);
      setWishlist([]);
      cartSyncReady.current = true;
      wishlistSyncReady.current = true;
      showToast("Registration successful!", "success");
      return true;
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
      return false;
    }
  };

  const logout = async () => {
    clearToken();
    try {
      await authService.logout();
    } catch {
      /* cookie cleared on server when reachable */
    }
    setUser(null);
    setCart([]);
    setWishlist([]);
    cartSyncReady.current = false;
    wishlistSyncReady.current = false;
    showToast("Signed out successfully", "info");
  };

  const updateProfile = async (name, address) => {
    try {
      const updated = await authService.updateProfile({ name, address });
      setUser(updated);
      showToast("Profile saved", "success");
      return true;
    } catch (err) {
      showToast(err.message || "Profile update failed", "error");
      return false;
    }
  };

  const addToCart = (product, quantity, color, size) => {
    if (!user) {
      showToast("Please sign in to add items to your cart", "info");
      return;
    }
    const idx = cart.findIndex(
      (item) =>
        item.product.id === product.id &&
        item.selectedColor === color &&
        item.selectedSize === size
    );
    if (idx !== -1) {
      setCart((prev) => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(product.stock, updated[idx].quantity + quantity),
        };
        return updated;
      });
      showToast(`Updated "${product.name}" in cart`, "success");
    } else {
      setCart((prev) => [...prev, { product, quantity, selectedColor: color, selectedSize: size }]);
      showToast(`Added "${product.name}" to cart`, "success");
    }
  };

  const removeFromCart = (productId, color, size) => {
    if (!user) return;
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
      )
    );
  };

  const updateCartQuantity = (productId, quantity, color, size) => {
    if (!user) return;
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.selectedColor === color && item.selectedSize === size) {
          return { ...item, quantity: Math.max(1, Math.min(item.product.stock, quantity)) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    if (!user) return;
    setCart([]);
  };

  const toggleWishlist = (product) => {
    if (!user) {
      showToast("Please sign in to save favorites", "info");
      return;
    }
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Removed "${product.name}" from favorites`, "info");
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`Added "${product.name}" to favorites`, "success");
    }
  };

  const isInWishlist = (productId) => wishlist.some((p) => p.id === productId);

  const fetchNotifications = async () => {
    try {
      const list = await apiFetch("/api/notifications");
      if (Array.isArray(list)) setNotifications(list);
    } catch {
      /* server warming up */
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await apiFetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(fetchNotifications, 15000);
    return () => clearInterval(timer);
  }, [user]);

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        token: null,
        cart,
        wishlist,
        notifications,
        theme,
        toasts,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        fetchNotifications,
        markAllNotificationsRead,
        toggleTheme,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
};
