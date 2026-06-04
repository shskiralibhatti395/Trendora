import Notification from "../models/Notification.js";

export const getNotifications = async (req, res, next) => {
  try {
    const filter = req.user
      ? { $or: [{ userId: req.user._id }, { userId: { $exists: false } }, { userId: null }] }
      : {};
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json(notifications.map((n) => n.toJSON()));
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        $or: [{ userId: req.user?._id }, { userId: { $exists: false } }, { userId: null }],
        isRead: false,
      },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
