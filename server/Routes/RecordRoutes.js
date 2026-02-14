import express from "express";
import { authorizeRoles, verifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  deleteRecord,
  getRecord,
  updateRecord
} from "../Controllers/RecordController.js";

const RecordRoutes = express.Router();

RecordRoutes.get(
  "/",
  verifyToken,
  authorizeRoles("admin", "analyst", "viewer"),
  getRecord
);

RecordRoutes.patch(
  "/:recordId",
  verifyToken,
  authorizeRoles("admin", "analyst"),
  updateRecord
);

RecordRoutes.delete(
  "/:recordId",
  verifyToken,
  authorizeRoles("admin", "analyst"),
  deleteRecord
);

export default RecordRoutes;

