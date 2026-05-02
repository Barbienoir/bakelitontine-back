const Notification = require("../models/Notification");
const { getIo } = require("../config/socket");

const createNotification = async ({ receiverId, title, message, type = "info" }) => {
  try {
    const notification = await Notification.create({
      receiverId,
      title,
      message,
      type,
    });

    // Envoyer en temps réel via Socket.io
    try {
      const io = getIo();
      io.to(receiverId.toString()).emit("new_notification", notification);
    } catch (socketError) {
      console.log("Socket non dispo, notification enregistrée en DB uniquement");
    }

    return notification;
  } catch (error) {
    console.error("❌ Erreur création notification:", error.message);
  }
};

module.exports = { createNotification };
