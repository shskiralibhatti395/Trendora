import Product from "../models/Product.js";

export async function hydrateCartItems(cartItems = []) {
  if (!cartItems.length) return [];

  const productIds = [...new Set(cartItems.map((item) => item.productId))];
  const products = await Product.find({
    $or: [{ legacyId: { $in: productIds } }, { _id: { $in: productIds.filter((id) => /^[a-f\d]{24}$/i.test(id)) } }],
  });

  const productMap = new Map(
    products.map((p) => [p.legacyId || p._id.toString(), p.toJSON()])
  );

  return cartItems
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        product,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      };
    })
    .filter(Boolean);
}

export function serializeCartForStorage(cart = []) {
  return cart.map((item) => ({
    productId: item.product?.id || item.productId,
    quantity: item.quantity,
    selectedColor: item.selectedColor || "Default",
    selectedSize: item.selectedSize || "One Size",
  }));
}

export async function hydrateFavorites(favoriteIds = []) {
  if (!favoriteIds.length) return [];

  const products = await Product.find({
    $or: [
      { legacyId: { $in: favoriteIds } },
      { _id: { $in: favoriteIds.filter((id) => /^[a-f\d]{24}$/i.test(id)) } },
    ],
  });

  return products.map((p) => p.toJSON());
}
