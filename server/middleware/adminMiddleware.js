import { ROLES } from "../constants.js";

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: "Administrative access required" });
  }
  next();
};
