import express from "express";
import { authorizeRoles, verifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  getReconciliationByJobId,
  getGlobalReconciliationSummary,
  manuallyCorrectRecord
} from "../Controllers/ReconciliationController.js";


const reconciliationRoutes = express.Router();

reconciliationRoutes.get(
  "/global-summary",
  verifyToken,
  authorizeRoles("admin", "analyst", "viewer"),
  getGlobalReconciliationSummary
);
reconciliationRoutes.get(
  "/GetReconciliationDataById/:uploadJobId",
  verifyToken,
  authorizeRoles("admin", "analyst", "viewer"),
  getReconciliationByJobId
);
reconciliationRoutes.patch(
  "/records/:recordId/manual-correction",
  verifyToken,
  authorizeRoles("admin", "analyst"),
  manuallyCorrectRecord
);

export default reconciliationRoutes;
