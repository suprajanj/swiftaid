import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import Otp from "../model/Otp.js";

// -------------------- JWT HELPER --------------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "5h" });
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

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Verification - SwiftAid</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #2563eb, #0891b2);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .logo-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 20px;
        }
        
        .logo-text {
            font-size: 28px;
            font-weight: bold;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-message {
            font-size: 18px;
            color: #1e293b;
            margin-bottom: 25px;
        }
        
        .otp-container {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border: 2px solid #bae6fd;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #0369a1;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 20px 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .expiry-notice {
            background: #fff7ed;
            border: 1px solid #fed7aa;
            border-radius: 12px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        
        .expiry-notice h3 {
            color: #ea580c;
            margin-bottom: 5px;
        }
        
        .steps {
            margin: 30px 0;
        }
        
        .step {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .step-number {
            background: #2563eb;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
            font-size: 14px;
        }
        
        .step-content h4 {
            color: #1e293b;
            margin-bottom: 5px;
        }
        
        .step-content p {
            color: #64748b;
            font-size: 14px;
        }
        
        .security-note {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .security-note h3 {
            color: #dc2626;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .login-details {
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .login-details h3 {
            color: #2563eb;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .footer {
            background: #1e293b;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .contact-info {
            margin: 20px 0;
            font-size: 14px;
            color: #cbd5e1;
        }
        
        .copyright {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 20px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 36px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <div class="logo-icon">🛡️</div>
                <div class="logo-text">SwiftAid</div>
            </div>
            <h1>Login Verification</h1>
            <p>Secure access to your emergency response account</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="welcome-message">
                <p>Hello <strong>${user.firstName || "User"}</strong>,</p>
                <p>We noticed a login attempt to your SwiftAid account. To complete your login, please use the verification code below.</p>
            </div>
            
            <!-- OTP Display -->
            <div class="otp-container">
                <h2>Your Verification Code</h2>
                <div class="otp-code">${otp}</div>
                <p>Enter this code in the SwiftAid app to continue</p>
            </div>
            
            <!-- Expiry Notice -->
            <div class="expiry-notice">
                <h3>⏰ Time Sensitive</h3>
                <p>This code will expire in <strong>5 minutes</strong> for your security</p>
            </div>
            
            <!-- Steps -->
            <div class="steps">
                <h3>Quick Steps:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Return to SwiftAid</h4>
                        <p>Go back to the login screen on your device</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Enter the Code</h4>
                        <p>Type the 6-digit verification code above</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Access Your Account</h4>
                        <p>You'll be securely logged into your dashboard</p>
                    </div>
                </div>
            </div>
            
            <!-- Login Details -->
            <div class="login-details">
                <h3>📋 Login Attempt Details</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Purpose:</strong> Account login verification</p>
            </div>
            
            <!-- Security Note -->
            <div class="security-note">
                <h3>🔒 Security Alert</h3>
                <p><strong>If you didn't attempt to login:</strong></p>
                <p>• Immediately change your password</p>
                <p>• Contact our security team</p>
                <p>• Review your recent account activity</p>
                <p style="margin-top: 10px; font-weight: bold;">Never share this code with anyone. SwiftAid will never ask for your verification code.</p>
            </div>
            
            <p style="text-align: center; margin-top: 25px;">
                Need immediate assistance? Contact our 24/7 support team.
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">
                <div style="font-size: 20px">🛡️</div>
                <div style="font-weight: bold; font-size: 18px;">SwiftAid</div>
            </div>
            <p>Your Emergency Response Partner</p>
            <div class="contact-info">
                <p>Security Team: security@swiftaid.com</p>
                <p>Support: support@swiftaid.com | 24/7 Helpline</p>
            </div>
            <div class="copyright">
                <p>© 2024 SwiftAid Emergency Response System. All rights reserved.</p>
                <p>This email was sent to ${user.email} for security purposes.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const emailText = `
Login Verification - SwiftAid

Hello ${user.firstName || "User"},

We noticed a login attempt to your SwiftAid account. To complete your login, please use the verification code below.

Your Verification Code: ${otp}
Enter this code in the SwiftAid app to continue

⏰ Time Sensitive:
This code will expire in 5 minutes for your security

Quick Steps:
1. Return to SwiftAid - Go back to the login screen on your device
2. Enter the Code - Type the 6-digit verification code above
3. Access Your Account - You'll be securely logged into your dashboard

Login Attempt Details:
- Email: ${user.email}
- Time: ${new Date().toLocaleString()}
- Purpose: Account login verification

🔒 Security Alert:
If you didn't attempt to login:
• Immediately change your password
• Contact our security team
• Review your recent account activity

Never share this code with anyone. SwiftAid will never ask for your verification code.

Need immediate assistance? Contact our 24/7 support team.

--
SwiftAid Emergency Response System
Your Safety is Our Priority

Security Team: security@swiftaid.com
Support: support@swiftaid.com

© 2024 SwiftAid. All rights reserved.
This email was sent to ${user.email} for security purposes.
    `;

    await transporter.sendMail({
      from: `"SwiftAid Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Login Verification Code - SwiftAid",
      text: emailText,
      html: emailHtml,
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

//Forgot Password

// -------------------- REQUEST PASSWORD RESET --------------------
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

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

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - SwiftAid</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #2563eb, #0891b2);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .logo-icon {
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 20px;
        }
        
        .logo-text {
            font-size: 28px;
            font-weight: bold;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .otp-container {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            border: 2px solid #bae6fd;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        
        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #0369a1;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin: 20px 0;
        }
        
        .info-box {
            background: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 25px 0;
            border-radius: 8px;
        }
        
        .info-box h3 {
            color: #2563eb;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .steps {
            margin: 30px 0;
        }
        
        .step {
            display: flex;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .step-number {
            background: #2563eb;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
            font-size: 14px;
        }
        
        .step-content h4 {
            color: #1e293b;
            margin-bottom: 5px;
        }
        
        .step-content p {
            color: #64748b;
            font-size: 14px;
        }
        
        .security-note {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .security-note h3 {
            color: #dc2626;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .footer {
            background: #1e293b;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .contact-info {
            margin: 20px 0;
            font-size: 14px;
            color: #cbd5e1;
        }
        
        .copyright {
            font-size: 12px;
            color: #94a3b8;
            margin-top: 20px;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb, #0891b2);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            margin: 10px 0;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 12px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 36px;
                letter-spacing: 6px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <div class="logo-icon">🛡️</div>
                <div class="logo-text">SwiftAid</div>
            </div>
            <h1>Password Reset Request</h1>
            <p>Secure your account with verification</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <p>Hello ${user.firstName || "User"},</p>
            <p>We received a request to reset your SwiftAid account password. Use the verification code below to proceed with resetting your password.</p>
            
            <!-- OTP Display -->
            <div class="otp-container">
                <h2>Your Verification Code</h2>
                <div class="otp-code">${otp}</div>
                <p>This code will expire in <strong>5 minutes</strong></p>
            </div>
            
            <!-- Steps -->
            <div class="steps">
                <h3>Next Steps:</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <h4>Enter the Verification Code</h4>
                        <p>Return to the SwiftAid app and enter the 6-digit code above</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <h4>Create New Password</h4>
                        <p>Set a strong, unique password for your account</p>
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <h4>Secure Your Account</h4>
                        <p>You'll be redirected to login with your new credentials</p>
                    </div>
                </div>
            </div>
            
            <!-- Important Info -->
            <div class="info-box">
                <h3>📋 Important Information</h3>
                <p><strong>Valid for:</strong> 5 minutes only</p>
                <p><strong>Requested from:</strong> SwiftAid Security System</p>
                <p><strong>If you didn't request this:</strong> Please ignore this email and ensure your account is secure</p>
            </div>
            
            <!-- Security Note -->
            <div class="security-note">
                <h3>🔒 Security Notice</h3>
                <p>Never share this code with anyone. SwiftAid team will never ask for your verification code.</p>
                <p>This code is for your password reset request only.</p>
            </div>
            
            <p>Need help? Contact our support team for immediate assistance.</p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-logo">
                <div style="font-size: 20px">🛡️</div>
                <div style="font-weight: bold; font-size: 18px;">SwiftAid</div>
            </div>
            <p>Your Emergency Response Partner</p>
            <div class="contact-info">
                <p>Email: security@swiftaid.com</p>
                <p>Support: support@swiftaid.com</p>
            </div>
            <div class="copyright">
                <p>© 2024 SwiftAid Emergency Response System. All rights reserved.</p>
                <p>This email was sent to ${user.email} as part of our security services.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    const emailText = `
Password Reset Request - SwiftAid

Hello ${user.firstName || "User"},

We received a request to reset your SwiftAid account password.

Your Verification Code: ${otp}
This code will expire in 5 minutes.

Next Steps:
1. Return to the SwiftAid app and enter the 6-digit code
2. Create a new strong password for your account
3. You'll be redirected to login with your new credentials

Important Information:
- Valid for: 5 minutes only
- Requested from: SwiftAid Security System
- If you didn't request this: Please ignore this email

🔒 Security Notice:
Never share this code with anyone. SwiftAid team will never ask for your verification code.

Need help? Contact our support team at support@swiftaid.com

--
SwiftAid Emergency Response System
Your Safety is Our Priority

© 2024 SwiftAid. All rights reserved.
This email was sent to ${user.email}
    `;

    await transporter.sendMail({
      from: `"SwiftAid Security" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Verification - SwiftAid",
      text: emailText,
      html: emailHtml,
    });

    res.status(200).json({ message: "OTP sent to email", userId: user._id });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- VERIFY OTP FOR PASSWORD RESET --------------------
export const verifyResetOTP = async (req, res) => {
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

    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // OTP verified → remove record
    await Otp.deleteOne({ userId });

    res.status(200).json({ message: "OTP verified successfully", userId });
  } catch (err) {
    console.error("Reset OTP verification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- RESET PASSWORD --------------------
export const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;
    if (!userId || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required" });

    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
