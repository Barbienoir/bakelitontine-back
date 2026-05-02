require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
});

initSocket(io);

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL }));

// Webhook Stripe : raw body obligatoire avant express.json()
app.use("/api/payments/stripe/webhook", express.raw({ type: "application/json" }));

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cotisations", require("./routes/cotisationRoutes"));
app.use("/api/caisse", require("./routes/caisseRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// Par ceci :
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  // Lancé directement via "node server.js" ou "nodemon server.js"
  server.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));
}

module.exports = app;