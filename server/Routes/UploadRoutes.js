import express from "express";
import multer from "multer";
import { authorizeRoles, verifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  submitMapping,
  uploadPreview,
  getAllUploadJobs,
  getUploadJobById
} from "../Controllers/UploadController.js";

const upload = multer({ dest: "uploads/" });
const UploadRoutes = express.Router();

UploadRoutes.post(
  "/preview",
  verifyToken,
  authorizeRoles("admin", "analyst"),
  upload.single("file"),
  uploadPreview
);
UploadRoutes.post("/map", verifyToken, authorizeRoles("admin", "analyst"), submitMapping);
UploadRoutes.get("/upload-jobs", verifyToken, authorizeRoles("admin", "analyst", "viewer"), getAllUploadJobs);
UploadRoutes.get(
  "/upload-jobs/:uploadJobId",
  verifyToken,
  authorizeRoles("admin", "analyst", "viewer"),
  getUploadJobById
);

export default UploadRoutes;
