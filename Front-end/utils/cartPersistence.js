function getActiveUserEmail() {
  return localStorage.getItem("trendora_user_email");
}
export function saveToCartInLocalStorage(id, title, price, image, quantityToAdd = 1) {
  const email = getActiveUserEmail();
  if (!email) {
    console.warn("[Cart Persistence] No user session found. Cannot save cart items.");
    return;
  }
  const userCartKey = `cart_${email}`;
  const savedCartRaw = localStorage.getItem(userCartKey);
  let currentCart = [];
  if (savedCartRaw) {
    try {
      currentCart = JSON.parse(savedCartRaw);
    } catch (e) {
      console.error("Error parsing cart from localStorage:", e);
    }
  }
  const existingIndex = currentCart.findIndex((item) => {
    const pId = item.product?.id || item.id;
    return pId === id;
  });
  if (existingIndex !== -1) {
    const updatedItem = { ...currentCart[existingIndex] };
    if (typeof updatedItem.quantity === "number") {
      updatedItem.quantity += quantityToAdd;
    } else {
      updatedItem.quantity = quantityToAdd;
    }
    currentCart[existingIndex] = updatedItem;
  } else {
    const mockProduct = {
      id,
      name: title,
      description: "Acquired product",
      detail: "Added via persistence layer",
      price,
      category: "Uncategorized",
      brand: "Trendora",
      rating: 5,
      reviewCount: 1,
      images: [image],
      colors: ["Default"],
      sizes: ["M"],
      stock: 99,
      reviews: []
    };
    const newCartItem = {
      product: mockProduct,
      quantity: quantityToAdd,
      selectedColor: "Default",
      selectedSize: "M"
    };
    currentCart.push(newCartItem);
  }
  localStorage.setItem(userCartKey, JSON.stringify(currentCart));
  window.dispatchEvent(new Event("trendora_cart_updated"));
}
export function saveToFavoriteInLocalStorage(id, title, price, image) {
  const email = getActiveUserEmail();
  if (!email) {
    console.warn("[Cart Persistence] No user session found. Cannot save favorite items.");
    return;
  }
  const userWishlistKey = `favorites_${email}`;
  const savedWishlistRaw = localStorage.getItem(userWishlistKey);
  let currentWishlist = [];
  if (savedWishlistRaw) {
    try {
      currentWishlist = JSON.parse(savedWishlistRaw);
    } catch (e) {
      console.error("Error parsing wishlist from localStorage:", e);
    }
  }
  const alreadyExists = currentWishlist.some((item) => {
    const pId = item.id || item.product?.id;
    return pId === id;
  });
  if (!alreadyExists) {
    const mockProduct = {
      id,
      name: title,
      description: "Acquired product",
      detail: "Added via persistence layer",
      price,
      category: "Uncategorized",
      brand: "Trendora",
      rating: 5,
      reviewCount: 1,
      images: [image],
      colors: ["Default"],
      sizes: ["M"],
      stock: 99,
      reviews: []
    };
    currentWishlist.push(mockProduct);
    localStorage.setItem(userWishlistKey, JSON.stringify(currentWishlist));
    window.dispatchEvent(new Event("trendora_wishlist_updated"));
  }
}
export function initCartFromLocalStorage() {
  const email = getActiveUserEmail();
  if (!email) {
    console.log("[Cart Persistence] No active user session found on page load. Items not loaded.");
    return;
  }
  console.log(`[Cart Persistence] Initializing cart and favorite systems for user: ${email}...`);
  const userCartKey = `cart_${email}`;
  const savedCartRaw = localStorage.getItem(userCartKey);
  if (savedCartRaw) {
    try {
      const parsedCart = JSON.parse(savedCartRaw);
      console.log(`[Cart Persistence] Successfully loaded ${parsedCart.length} item(s) from localStorage.`);
      window.dispatchEvent(new Event("trendora_cart_updated"));
    } catch (e) {
      console.error("[Cart Persistence] Failed parsing cart JSON data:", e);
    }
  }
  const userWishlistKey = `favorites_${email}`;
  const savedWishlistRaw = localStorage.getItem(userWishlistKey);
  if (savedWishlistRaw) {
    try {
      const parsedWishlist = JSON.parse(savedWishlistRaw);
      console.log(`[Cart Persistence] Successfully loaded ${parsedWishlist.length} favorite(s) from localStorage.`);
      window.dispatchEvent(new Event("trendora_wishlist_updated"));
    } catch (e) {
      console.error("[Cart Persistence] Failed parsing wishlist JSON data:", e);
    }
  }
}
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCartFromLocalStorage);
  } else {
    initCartFromLocalStorage();
  }
}
