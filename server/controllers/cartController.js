import { hydrateCartItems, hydrateFavorites, serializeCartForStorage } from "../utils/cartHelpers.js";

export const getCart = async (req, res, next) => {
  try {
    const cart = await hydrateCartItems(req.user.cart);
    res.json({ cart });
  } catch (error) {
    next(error);
  }
};

export const updateCart = async (req, res, next) => {
  try {
    const { cart } = req.body;
    req.user.cart = serializeCartForStorage(cart);
    await req.user.save();
    const hydrated = await hydrateCartItems(req.user.cart);
    res.json({ success: true, cart: hydrated });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await hydrateFavorites(req.user.favorites);
    res.json({ wishlist });
  } catch (error) {
    next(error);
  }
};

export const updateWishlist = async (req, res, next) => {
  try {
    const { wishlist } = req.body;
    req.user.favorites = (wishlist || []).map((p) => p.id || p);
    await req.user.save();
    const hydrated = await hydrateFavorites(req.user.favorites);
    res.json({ success: true, wishlist: hydrated });
  } catch (error) {
    next(error);
  }
};
