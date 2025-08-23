import express from "express";
import sosRoute from "./routes/sosRoute.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

connectDB();

const PORT = process.env.PORT || 3000;

app.use("/api/sos", sosRoute);
//Can create more routes like this for SOS

app.listen(PORT, () => {
  console.log(`Server is running on port `, PORT);
});

export default app;
