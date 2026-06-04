import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { generateToken, setTokenCookie, clearTokenCookie } from "../utils/generateToken.js";
import { sendEmail } from "../utils/email.js";
import { ROLES } from "../constants.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: ROLES.USER,
    });

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || user.isBlocked) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.json({ token, user: user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req, res) => {
  clearTokenCookie(res);
  res.json({ message: "Logged out" });
};

export const getMe = async (req, res) => {
  res.json(req.user.toSafeJSON());
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, address } = req.body;
    if (name) req.user.name = name;
    if (address) req.user.address = address;
    await req.user.save();
    res.json(req.user.toSafeJSON());
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+resetOtp +resetOtpExpires");

    if (!user) {
      return res.status(404).json({ message: "No account found with that email" });
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = resetOtp;
    user.resetOtpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: "Reset your Trendora password",
      html: `<p>Your password reset code is: <strong>${resetOtp}</strong></p><p>Valid for 15 minutes.</p>`,
    });

    res.json({ message: "Reset code sent to your email", email: user.email });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password +resetOtp +resetOtpExpires");

    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp || user.resetOtpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    await Notification.create({
      userId: user._id,
      title: "Password updated",
      message: "Your Trendora password was reset successfully.",
      type: "system",
    });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
};
