require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");

const app = express();
const server = http.createServer(app);

// ✅ CORS configuré pour Vercel
const allowedOrigins = [
  "https://bakelitontine20.vercel.app",
  "http://localhost:5173", // pour le dev local
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
};

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initSocket(io);

// ✅ Connexion DB
connectDB();

// ✅ Middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Gère les requêtes preflight OPTIONS
app.use(express.json());

// ✅ Stripe Webhook (AVANT json parser)
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

// ✅ LANCEMENT SERVEUR
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});