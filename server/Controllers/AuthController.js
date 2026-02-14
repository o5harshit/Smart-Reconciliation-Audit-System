import UserModel from "../Models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { createAuditLog } from "../utils/auditLogger.js";

const maxAge = 3 * 24 * 60 * 60 * 1000;

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

/* ================= SIGNUP ================= */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Password are required",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const user = await UserModel.create({
      name,
      email,
      password, // hashed by pre-save hook
      role: "viewer", // force viewer
    });

    res.cookie("jwt", createToken(user._id), {
      maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(201).json({
      success: true,
      message: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is disabled",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.cookie("jwt", createToken(user._id), {
      maxAge,
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });

    return res.status(200).json({
      success: true,
      message: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* ================= GET LOGGED-IN USER ================= */
export const getUserInfo = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId).select(
      "name email role isActive"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/* ================= LOGOUT ================= */
export const logoutUser = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

/* ================= GET ALL USERS (ADMIN ONLY) ================= */
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select(
      "name email role isActive createdAt"
    );

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ================= UPDATE USER ROLE (ADMIN ONLY) ================= */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    if (!["admin", "viewer", "analyst"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be admin, analyst, or viewer",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (String(req.userId) === String(userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
      });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await createAuditLog({
      recordId: null,
      uploadJobId: null,
      targetUserId: user._id,
      entityType: "USER",
      field: "role",
      oldValue: oldRole,
      newValue: user.role,
      changedBy: req.userId,
      source: "USER_MANAGEMENT"
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/* ================= TOGGLE USER STATUS (ADMIN ONLY) ================= */
export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    if (String(req.userId) === String(userId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot disable your own account",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Admin account status cannot be changed from this endpoint",
      });
    }

    const oldStatus = user.isActive;
    user.isActive = !user.isActive;
    await user.save();

    await createAuditLog({
      recordId: null,
      uploadJobId: null,
      targetUserId: user._id,
      entityType: "USER",
      field: "isActive",
      oldValue: oldStatus,
      newValue: user.isActive,
      changedBy: req.userId,
      source: "USER_MANAGEMENT"
    });

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "enabled" : "disabled"} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
