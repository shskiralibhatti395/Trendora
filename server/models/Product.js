import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    legacyId: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    detail: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, index: true },
    brand: { type: String, required: true },
    images: { type: [String], default: [] },
    colors: { type: [String], default: ["Default"] },
    sizes: { type: [String], default: ["One Size"] },
    stock: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    reviews: { type: [reviewSchema], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.virtual("id").get(function id() {
  return this.legacyId || this._id.toString();
});

productSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    ret.id = ret.legacyId || ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.legacyId;
    return ret;
  },
});

export default mongoose.model("Product", productSchema);
