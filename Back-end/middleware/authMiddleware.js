import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { COOKIE_NAME } from "../constants.js";

export const authenticate = async (req, res, next) => {
  try {
    const bearer = req.headers.authorization?.split(" ")[1];
    const token = req.cookies?.[COOKIE_NAME] || bearer;

    if (!token) {
      return res.status(401).json({ message: "Authorization required" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "Server auth configuration error" });
    }

    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user || user.isBlocked) {
      return res.status(401).json({ message: "Invalid session" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid or expired session" });
  }
};
