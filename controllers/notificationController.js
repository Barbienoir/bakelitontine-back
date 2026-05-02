const Notification = require("../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      receiverId: req.user._id,
      isRead: false,
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: "Notification lue" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ receiverId: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: "Toutes les notifications lues" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, deleteNotification };
