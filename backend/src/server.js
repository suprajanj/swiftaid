import express from "express";
import userRoute from "./routes/userRoute.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

connectDB();

const PORT = process.env.PORT || 3000;

app.use("/api/users", userRoute);
//Can create more routes like this for SOS

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
