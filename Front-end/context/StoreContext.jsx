import { createContext, useContext, useState, useEffect, useRef } from "react";
import { saveToCartInLocalStorage, saveToFavoriteInLocalStorage, initCartFromLocalStorage } from "../utils/cartPersistence.js";
const StoreContext = createContext(void 0);
export const StoreProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("trendora_token"));
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isCartLoadedFromBackend = useRef(false);
  const isWishlistLoadedFromBackend = useRef(false);
  useEffect(() => {
    const savedTheme = localStorage.getItem("trendora_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("dark");
    }
    if (typeof window !== "undefined") {
      window.saveToCartInLocalStorage = saveToCartInLocalStorage;
      window.saveToFavoriteInLocalStorage = saveToFavoriteInLocalStorage;
      window.initCartFromLocalStorage = initCartFromLocalStorage;
    }
    const email = localStorage.getItem("trendora_user_email");
    if (email) {
      const savedCart = localStorage.getItem(`cart_${email}`);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error(e);
        }
      }
      const savedWishlist = localStorage.getItem(`favorites_${email}`);
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          console.error(e);
        }
      }
    }
    const handleCartUpdated = () => {
      const activeEmail = localStorage.getItem("trendora_user_email");
      if (activeEmail) {
        const currentCart = localStorage.getItem(`cart_${activeEmail}`);
        if (currentCart) {
          try {
            setCart(JSON.parse(currentCart));
          } catch (ex) {
            console.error(ex);
          }
        }
      } else {
        setCart([]);
      }
    };
    const handleWishlistUpdated = () => {
      const activeEmail = localStorage.getItem("trendora_user_email");
      if (activeEmail) {
        const currentWishlist = localStorage.getItem(`favorites_${activeEmail}`);
        if (currentWishlist) {
          try {
            setWishlist(JSON.parse(currentWishlist));
          } catch (ex) {
            console.error(ex);
          }
        }
      } else {
        setWishlist([]);
      }
    };
    window.addEventListener("trendora_cart_updated", handleCartUpdated);
    window.addEventListener("trendora_wishlist_updated", handleWishlistUpdated);
    return () => {
      window.removeEventListener("trendora_cart_updated", handleCartUpdated);
      window.removeEventListener("trendora_wishlist_updated", handleWishlistUpdated);
    };
  }, []);
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          if (userData && userData.email) {
            localStorage.setItem("trendora_user_email", userData.email);
          }
        } else {
          logout();
        }
      } catch (err) {
        console.error("Failed verification of profile on start", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [token]);
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem("trendora_user_email", user.email);
      const userCartKey = `cart_${user.email}`;
      const savedCart = localStorage.getItem(userCartKey);
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error(e);
        }
      } else {
        setCart([]);
      }
      const syncCartFromBackend = async () => {
        if (!token) {
          isCartLoadedFromBackend.current = true;
          return;
        }
        try {
          const res = await fetch("/api/cart", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.cart)) {
              setCart(data.cart);
              localStorage.setItem(`cart_${user.email}`, JSON.stringify(data.cart));
            }
          }
        } catch (err) {
          console.error("Failed to sync backend cart:", err);
        } finally {
          isCartLoadedFromBackend.current = true;
        }
      };
      syncCartFromBackend();
      const userWishlistKey = `favorites_${user.email}`;
      const savedWishlist = localStorage.getItem(userWishlistKey);
      if (savedWishlist) {
        try {
          setWishlist(JSON.parse(savedWishlist));
        } catch (e) {
          console.error(e);
        }
      } else {
        setWishlist([]);
      }
      const syncWishlistFromBackend = async () => {
        if (!token) {
          isWishlistLoadedFromBackend.current = true;
          return;
        }
        try {
          const res = await fetch("/api/wishlist", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.wishlist)) {
              setWishlist(data.wishlist);
              localStorage.setItem(`favorites_${user.email}`, JSON.stringify(data.wishlist));
            }
          }
        } catch (err) {
          console.error("Failed to sync backend wishlist:", err);
        } finally {
          isWishlistLoadedFromBackend.current = true;
        }
      };
      syncWishlistFromBackend();
    } else {
      localStorage.removeItem("trendora_user_email");
      setCart([]);
      setWishlist([]);
      isCartLoadedFromBackend.current = false;
      isWishlistLoadedFromBackend.current = false;
    }
  }, [user, token]);
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("trendora_theme", theme);
  }, [theme]);
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`cart_${user.email}`, JSON.stringify(cart));
      if (!isCartLoadedFromBackend.current) {
        return;
      }
      const saveCartToBackend = async () => {
        if (!token) return;
        try {
          await fetch("/api/cart", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ cart })
          });
        } catch (err) {
          console.error("Failed saving cart to backend:", err);
        }
      };
      saveCartToBackend();
    }
  }, [cart, user, token]);
  useEffect(() => {
    if (user && user.email) {
      localStorage.setItem(`favorites_${user.email}`, JSON.stringify(wishlist));
      if (!isWishlistLoadedFromBackend.current) {
        return;
      }
      const saveWishlistToBackend = async () => {
        if (!token) return;
        try {
          await fetch("/api/wishlist", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ wishlist })
          });
        } catch (err) {
          console.error("Failed saving wishlist to backend:", err);
        }
      };
      saveWishlistToBackend();
    }
  }, [wishlist, user, token]);
  const showToast = (message, type) => {
    const id = "toast-" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4e3);
  };
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  const toggleTheme = () => {
    setTheme((prev) => prev === "light" ? "dark" : "light");
    showToast(`Switched to ${theme === "light" ? "Dark" : "Light"} layout theme.`, "info");
  };
  const login = async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.verificationPending) {
          return { success: false, verificationPending: true, email: data.email, otp: data.otp };
        }
        showToast(data.message || "Login credentials incorrect", "error");
        return false;
      }
      const { token: receivedToken, user: loggedUser } = data;
      localStorage.setItem("trendora_token", receivedToken);
      setToken(receivedToken);
      setUser(loggedUser);
      showToast(`Welcome back, ${loggedUser.name}!`, "success");
      return { success: true, user: loggedUser };
    } catch (err) {
      console.error(err);
      showToast("Service issue completing authentication", "error");
      return false;
    }
  };
  const register = async (name, email, password) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || "Failed to complete registration", "error");
        return false;
      }
      if (data.verificationRequired) {
        return { success: true, verificationRequired: true, email: data.email, otp: data.otp };
      }
      const { token: receivedToken, user: loggedUser } = data;
      localStorage.setItem("trendora_token", receivedToken);
      setToken(receivedToken);
      setUser(loggedUser);
      showToast("Your registration was completed successfully!", "success");
      return true;
    } catch (err) {
      console.error(err);
      showToast("Network issue during sign up procedures", "error");
      return false;
    }
  };
  const logout = () => {
    localStorage.removeItem("trendora_token");
    localStorage.removeItem("trendora_user_email");
    setToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
    showToast("Signed out of Trendora successfully.", "info");
  };
  const updateProfile = async (name, address) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, address })
      });
      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.message || "Failed updating address credentials", "error");
        return false;
      }
      const updatedUser = await res.json();
      setUser(updatedUser);
      showToast("Profile and active address parameters saved.", "success");
      return true;
    } catch (err) {
      console.error(err);
      showToast("Failure calling profile services", "error");
      return false;
    }
  };
  const addToCart = (product, quantity, color, size) => {
    if (!user) {
      showToast("Please sign in to add items to your cart.", "info");
      return;
    }
    const idx = cart.findIndex(
      (item) => item.product.id === product.id && item.selectedColor === color && item.selectedSize === size
    );
    if (idx !== -1) {
      setCart((prev) => {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(product.stock, updated[idx].quantity + quantity)
        };
        return updated;
      });
      showToast(`Updated "${product.name}" quantity in Cart.`, "success");
    } else {
      setCart((prev) => [...prev, { product, quantity, selectedColor: color, selectedSize: size }]);
      showToast(`Added "${product.name}" to Cart.`, "success");
    }
  };
  const removeFromCart = (productId, color, size) => {
    if (!user) return;
    const removedItem = cart.find(
      (item) => item.product.id === productId && item.selectedColor === color && item.selectedSize === size
    );
    if (removedItem) {
      showToast(`Removed "${removedItem.product.name}" from your Cart.`, "info");
    }
    setCart(
      (prev) => prev.filter(
        (item) => !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
      )
    );
  };
  const updateCartQuantity = (productId, quantity, color, size) => {
    if (!user) return;
    setCart(
      (prev) => prev.map((item) => {
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
      showToast("Please sign in to add items to your favorites.", "info");
      return;
    }
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
      showToast(`Removed "${product.name}" from your Wishlist.`, "info");
    } else {
      setWishlist((prev) => [...prev, product]);
      showToast(`Added "${product.name}" to your Wishlist.`, "success");
    }
  };
  const isInWishlist = (productId) => {
    return wishlist.some((p) => p.id === productId);
  };
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const list = await res.json();
          if (Array.isArray(list)) {
            setNotifications(list);
          }
        } else {
          console.warn("Notification endpoint did not return JSON. Returning html fallback during warmups.");
        }
      }
    } catch (e) {
      console.log("Notification polling temporarily disconnected or server is restarting.");
    }
  };
  const markAllNotificationsRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST" });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
      }
    } catch (e) {
      console.log("Unable to mark notifications read right now (server offline or restarting).");
    }
  };
  useEffect(() => {
    fetchNotifications();
    const timer = setInterval(() => {
      fetchNotifications();
    }, 8e3);
    return () => clearInterval(timer);
  }, []);
  return <StoreContext.Provider
    value={{
      user,
      setUser,
      token,
      setToken,
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
      dismissToast
    }}
  >
      {children}
    </StoreContext.Provider>;
};
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be utilized strictly within a StoreProvider context");
  }
  return context;
};
