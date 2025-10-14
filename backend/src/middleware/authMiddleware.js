import jwt from "jsonwebtoken";
import User from "../model/User.js";

export const protect = async (req, res, next) => {
  let token;

  try {
    // Check if Authorization header exists and starts with Bearer
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; // Extract token

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB and attach to req.user (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

      next(); // user is authenticated, continue to controller
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
