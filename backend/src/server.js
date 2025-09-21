import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import sosRoute from "./routes/sosRoute.js";
import userRoute from "./routes/userRoute.js";

dotenv.config();

const app = express();

// ✅ Validate important environment variables
if (!process.env.JWT_SECRET) {
  console.warn(
    "⚠️  Warning: JWT_SECRET is not set. Set it in your .env before using JWT for authentication."
  );
}

const PORT = process.env.PORT || 3000;

connectDB();

//Middleware
app.use(cors()); // Enable CORS for all origins (can be restricted later)
app.use(express.json()); // Parse JSON bodies

//Routes
app.use("/api/sos", sosRoute);
app.use("/api/user", userRoute);

//Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;
