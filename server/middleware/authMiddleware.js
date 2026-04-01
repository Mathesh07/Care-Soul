import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and check account status in database
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: "Email verification required" });
    }

    // Check account status
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ message: "Account is suspended" });
    }

    if (user.accountStatus === "rejected") {
      return res.status(403).json({ message: "Account has been rejected" });
    }

    if (user.accountStatus === "pending_admin_verification") {
      return res.status(403).json({ message: "Account is awaiting admin verification" });
    }

    // Check if doctor is verified by admin
    if (user.role === "doctor" && !user.isDocterVerifiedByAdmin) {
      return res.status(403).json({ 
        message: "Doctor account is not verified by admin",
        accountStatus: user.accountStatus,
      });
    }

    // Ensure account is active
    if (user.accountStatus !== "active") {
      return res.status(403).json({ 
        message: "Account is not in active state",
        accountStatus: user.accountStatus,
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};
