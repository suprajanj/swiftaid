import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import organizationRoute from "./routes/organizationRoute.js";
import emergencyCaseRoute from "./routes/emergencyCaseRoute.js";
import resourceRoutes from "./routes/resourceRoutes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

connectDB();

//Middleware
app.use(cors()); // Enable CORS for all origins 
app.use(express.json()); // Parse JSON bodies

//Routes
app.use("/api/orgs", organizationRoute);
app.use("/api/cases", emergencyCaseRoute);
app.use("/api/resources", resourceRoutes);

//Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
