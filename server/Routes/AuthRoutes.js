import express from "express"
import { authorizeRoles, verifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  getUserInfo,
  getUsers,
  login,
  logoutUser,
  signup,
  toggleUserStatus,
  updateUserRole
} from "../Controllers/AuthController.js";






const AuthRoutes = express.Router();

AuthRoutes.post("/signup",signup);
AuthRoutes.get("/user-info",verifyToken,getUserInfo);
AuthRoutes.post("/login",login);
AuthRoutes.get("/user",verifyToken,authorizeRoles("admin"),getUsers);
AuthRoutes.patch("/user/:userId/role",verifyToken,authorizeRoles("admin"),updateUserRole);
AuthRoutes.patch("/user/:userId/status",verifyToken,authorizeRoles("admin"),toggleUserStatus);
AuthRoutes.get("/logout",logoutUser);



export default AuthRoutes;


