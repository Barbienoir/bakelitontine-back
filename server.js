require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // 🔥 temporaire pour éviter bug CORS
    methods: ["GET", "POST"],
  },
});

initSocket(io);

// ✅ Connexion DB
connectDB();

// ✅ Middleware
app.use(cors()); // 🔥 temporaire (tu sécuriseras après)
app.use(express.json());

// ✅ Stripe Webhook (AVANT json)
app.use(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" })
);

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/cotisations", require("./routes/cotisationRoutes"));
app.use("/api/caisse", require("./routes/caisseRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// ✅ Route test (IMPORTANT pour Render)
app.get("/", (req, res) => {
  res.send("API Bakeli Tontine is running 🚀");
});

// ✅ Gestion erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// ✅ LANCEMENT SERVEUR (CORRIGÉ)
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});