import Product from "../models/Product.js";
import Notification from "../models/Notification.js";

export const getProducts = async (req, res, next) => {
  try {
    const filter = {};
    const search = req.query.search ? String(req.query.search).trim() : "";
    const category = req.query.category ? String(req.query.category) : "";
    const brand = req.query.brand ? String(req.query.brand) : "";
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : 0;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : Infinity;
    const rating = req.query.rating ? Number(req.query.rating) : 0;
    const color = req.query.color ? String(req.query.color) : "";
    const size = req.query.size ? String(req.query.size) : "";

    let products = await Product.find(filter).lean();

    products = products.map((p) => ({
      ...p,
      id: p.legacyId || p._id.toString(),
      _id: undefined,
      __v: undefined,
    }));

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    if (category) products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    if (brand) products = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    if (minPrice > 0 || maxPrice < Infinity) {
      products = products.filter((p) => p.price >= minPrice && p.price <= maxPrice);
    }
    if (rating > 0) products = products.filter((p) => p.rating >= rating);
    if (color) {
      products = products.filter((p) =>
        p.colors.some((c) => c.toLowerCase() === color.toLowerCase())
      );
    }
    if (size) {
      products = products.filter((p) =>
        p.sizes.some((s) => s.toLowerCase() === size.toLowerCase())
      );
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const startIndex = (page - 1) * limit;
    const paginated = products.slice(startIndex, startIndex + limit);

    res.json({
      products: paginated,
      totalCount: products.length,
      page,
      totalPages: Math.ceil(products.length / limit),
      hasMore: startIndex + limit < products.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product =
      (await Product.findOne({ legacyId: id })) ||
      (await Product.findById(id).catch(() => null));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const json = product.toJSON();
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.json({
      product: json,
      related: related.map((p) => p.toJSON()),
    });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product =
      (await Product.findOne({ legacyId: req.params.id })) ||
      (await Product.findById(req.params.id).catch(() => null));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      userName: req.user.email.split("@")[0],
      rating: Number(rating),
      comment: String(comment).trim(),
    };

    product.reviews.unshift(review);
    product.reviewCount = product.reviews.length;
    product.rating = Number(
      (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    );
    await product.save();

    await Notification.create({
      title: "New product review",
      message: `${review.userName} reviewed "${product.name}"`,
      type: "rating",
    });

    res.status(201).json(product.toJSON());
  } catch (error) {
    next(error);
  }
};
