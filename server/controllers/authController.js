import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/OTP.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

const OTP_TTL_MS = 10 * 60 * 1000;

// Generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email using Nodemailer
async function sendEmail(to, subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // Using Gmail SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"Care-Soul Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
}

// ========================== SIGNUP ==========================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    // Validate inputs
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser && (existingUser.isEmailVerified || existingUser.isVerified)) {
      console.log("User already exists with email:", normalizedEmail);
      return res.status(400).json({ message: "User already exists" });
    }

    let user = existingUser;
    if (!user) {
      // Create user (unverified initially) using the active schema fields.
      user = new User({
        name,
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: "patient",
        isEmailVerified: false,
        accountStatus: "pending_verification",
      });
    } else {
      // Resend OTP path for existing unverified users.
      user.name = name;
      user.passwordHash = hashedPassword;
      user.isEmailVerified = false;
      user.accountStatus = "pending_verification";
    }

    await user.save();

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + OTP_TTL_MS);

    // Store OTP in database
    await OTP.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, expiresAt: otpExpires, userId: user._id },
      { upsert: true, new: true }
    );

    // Send OTP to email
    await sendEmail(
      normalizedEmail,
      "Verify your Care-Soul Account",
      `Hi ${name},\n\nYour OTP for verifying your account is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\n- Care-Soul Team`
    );

    return res.status(201).json({
      message: "User registered. Please check your email for OTP to verify your account.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ========================== VERIFY OTP ==========================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    // Validate input
    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find OTP record in database
    const otpRecord = await OTP.findOne({ email: normalizedEmail });
    
    if (!otpRecord || otpRecord.otp !== otp || new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Mark user as verified
    user.isEmailVerified = true;
    user.accountStatus = "active";
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ email: normalizedEmail });

    // Generate JWT
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Account verified successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ========================== LOGIN ==========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isEmailVerified) {
      // Generate and send OTP for email verification
      const otp = generateOTP();
      const otpExpires = new Date(Date.now() + OTP_TTL_MS);

      // Store OTP in database
      await OTP.findOneAndUpdate(
        { email: normalizedEmail },
        { otp, expiresAt: otpExpires, userId: user._id },
        { upsert: true, new: true }
      );

      // Send OTP to email
      await sendEmail(
        normalizedEmail,
        "Verify your Care-Soul Account",
        `Hi ${user.name},\n\nYour OTP for verifying your account is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\n- Care-Soul Team`
      );

      return res.status(403).json({ 
        requiresOtp: true,
        message: "Please verify your email with OTP before logging in" 
      });
    }

    if (user.accountStatus === "suspended") {
      return res.status(403).json({ message: "Your account is suspended" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ========================== LOGOUT ==========================
export const logout = async (req, res) => {
  try {
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ========================== UPDATE PROFILE ==========================
export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(userId, { name }, { new: true });

    return res.status(200).json({
      message: "Profile updated",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ========================== CHECK AUTH ==========================
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ========================== REFRESH TOKEN ==========================
export const refreshToken = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - No user ID found" });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isEmailVerified || user.accountStatus !== "active") {
      return res.status(403).json({ message: "User account is not active" });
    }

    // Generate new token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      message: "Token refreshed successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ========================== RESEND OTP ==========================
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + OTP_TTL_MS);

    // Store OTP in database
    await OTP.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, expiresAt: otpExpires, userId: user._id },
      { upsert: true, new: true }
    );

    // Send OTP to email
    await sendEmail(
      normalizedEmail,
      "Resend - Verify your Care-Soul Account",
      `Hi ${user.name},\n\nYour OTP for verifying your account is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you did not request this, please ignore this email.\n\n- Care-Soul Team`
    );

    return res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
