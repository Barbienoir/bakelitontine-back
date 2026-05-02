require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);

// ✅ Socket.io - CORS ouvert
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: false,
  },
});

initSocket(io);

// ✅ Connexion DB
connectDB();

// ✅ CORS complètement ouvert
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());
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

// ✅ Route test
app.get("/", (req, res) => {
  res.send("API Bakeli Tontine is running 🚀");
});

// ✅ Gestion erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});