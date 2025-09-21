import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import Otp from "../model/Otp.js";

// -------------------- JWT HELPER --------------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// -------------------- SIGNUP --------------------
export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      nic,
      email,
      password,
      confirmPassword,
      mobile,
      address,
      gender,
      dob,
      termsAccepted,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !nic ||
      !email ||
      !password ||
      !confirmPassword ||
      !mobile ||
      !address ||
      !gender ||
      !dob
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { nic }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email or NIC already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      nic,
      email,
      password: hashedPassword,
      mobile,
      address,
      gender,
      dob,
      termsAccepted,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      userId: newUser._id,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- LOGIN → SEND OTP --------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { userId: user._id },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    });

    res.status(200).json({ message: "OTP sent to email", userId: user._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- VERIFY OTP → ISSUE JWT --------------------
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp)
      return res.status(400).json({ message: "User ID and OTP required" });

    const record = await Otp.findOne({ userId });
    if (!record) return res.status(400).json({ message: "No OTP found" });

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ userId });
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await Otp.deleteOne({ userId });

    // ✅ Generate JWT after successful OTP
    const token = generateToken(userId);

    res.status(200).json({
      message: "OTP verified successfully",
      userId,
      token, // send JWT to frontend
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- LOGOUT --------------------
export const logoutUser = async (req, res) => {
  try {
    // Just send success; client deletes the token
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// -------------------- CRUD --------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password)
      updates.password = await bcrypt.hash(updates.password, 10);

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
};

// GET current logged-in user
export const getMe = async (req, res) => {
  try {
    // req.user is set in the protect middleware
    if (!req.user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
