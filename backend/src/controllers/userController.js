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

      //Optional
      blood,
      condition,
      allergy,
      emergencyNumber,
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
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
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

      //set optional fields if provided, else null
      blood: blood || null,
      condition: condition || null,
      allergy: allergy || null,
      emergencyNumber: emergencyNumber || null,
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
      from: `"SwiftAid Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your OTP Code (Valid for 5 minutes)",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333; text-align: center;">One-Time Password (OTP)</h2>
          <p style="font-size: 16px; color: #555;">
            Hi <strong>${user.firstName || "User"}</strong>,  
            <br/><br/>
            Use the following OTP to complete your login. This code will expire in <strong>5 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; background: #4CAF50; color: white; padding: 10px 20px; border-radius: 8px; display: inline-block;">
              ${otp}
            </span>
          </div>
          <p style="font-size: 14px; color: #777; text-align: center;">
            If you didn't request this, please ignore this email.
          </p>
          <hr style="margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaa; text-align: center;">
            © ${new Date().getFullYear()} SwiftAid | Secure Login System
          </p>
        </div>
      `,
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

    // OTP verified → remove record
    await Otp.deleteOne({ userId });

    //Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    //Generate JWT
    const token = generateToken(userId);

    res.status(200).json({
      message: "OTP verified successfully",
      userId,
      token,
      role: user.role || "user", //include role
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

    const updatedUser =
      (await User.findByIdAndUpdate(req.params.id, updates, { new: true })) ||
      (await User.findOneAndUpdate({ userId: req.params.id }, updates, {
        new: true,
      }));

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

// -------------------- GET CURRENT USER --------------------
export const getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });

    //return all profile info (excluding password)
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CHANGE PASSWORD --------------------
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Fetch full user from DB including password
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
