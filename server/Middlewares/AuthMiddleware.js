import jwt from "jsonwebtoken";
import UserModel from "../Models/UserModel.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).send("You are not authenticated");
  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return res.status(403).send("Token is not valid");
    req.userId = payload.userId;
    next();
  });
};

export const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.userId).select("role");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions"
        });
      }

      next();
    } catch (err) {
      console.error("Role authorization failed:", err);
      return res.status(500).json({
        success: false,
        message: "Authorization failed"
      });
    }
  };
};
