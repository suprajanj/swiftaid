import jwt from "jsonwebtoken";

// Function to generate JWT
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h", // token expires in 1 hour
  });
};
