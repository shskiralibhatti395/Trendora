import jwt from "jsonwebtoken";

export function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
}

const cookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    // "none" is required when frontend and API are on different domains (e.g. Render static + API).
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
};

export function setTokenCookie(res, token) {
  res.cookie("token", token, cookieOptions());
}

export function clearTokenCookie(res) {
  res.cookie("token", "", {
    ...cookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
}
