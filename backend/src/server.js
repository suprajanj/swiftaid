import express from "express";
import cors from "cors";
import sosRoute from "./routes/sosRoute.js";
import userRoute from "./routes/userRoute.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

// Middleware
app.use(cors()); // ← enable CORS for all routes
app.use(express.json());

app.use("/api/sos", sosRoute);
app.use("/api/user", userRoute);
// Can create more routes like this for SOS

app.listen(PORT, () => {
  console.log(`Server is running on port `, PORT);
});

export default app;
