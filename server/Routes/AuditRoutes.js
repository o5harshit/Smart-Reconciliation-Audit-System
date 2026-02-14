import express from "express";
import { authorizeRoles, verifyToken } from "../Middlewares/AuthMiddleware.js";
import {
  backfillAuditLogs,
  getAuditLogs,
  getRecordAuditTimeline
} from "../Controllers/AuditController.js";

const auditRoutes = express.Router();

auditRoutes.get("/record/:recordId/timeline", verifyToken, getRecordAuditTimeline);
auditRoutes.get("/logs", verifyToken, authorizeRoles("admin","analyst"), getAuditLogs);

export default auditRoutes;
