let io;

const initSocket = (socketIo) => {
  io = socketIo;
  io.on("connection", (socket) => {
    console.log(`🔌 Connecté: ${socket.id}`);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} rejoint sa room`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Déconnecté: ${socket.id}`);
    });
  });
};

const getIo = () => {
  if (!io) throw new Error("Socket.io non initialisé");
  return io;
};

module.exports = { initSocket, getIo };
