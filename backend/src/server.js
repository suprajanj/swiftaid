
import express from "express";
import http from "http";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import sosRoutes from "./routes/sosRoutes.js";
import responderRoutes from "./routes/responderRoutes.js";
import Responder from "./models/Responder.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use("/api/sos", sosRoutes);
app.use("/api/responders", responderRoutes);

// create HTTP server and socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" } // for dev; restrict in production
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// DB + start
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log("Server listening on port", PORT));
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });


  app.get("/api/responders", async (req, res) => {
  try {
    const { type } = req.query; // you can pass "Medical", "Fire", etc.
    const responders = await Responder.find({ availability: true });
    res.json(responders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});