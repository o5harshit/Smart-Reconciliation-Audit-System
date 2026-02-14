import mongoose from "mongoose";
import AuditLogModel from "../Models/AuditLogModel.js";
import ReconciliationResultModel from "../Models/ReconciliationResultModel.js";
import UploadModel from "../Models/UploadModel.js";

export const getRecordAuditTimeline = async (req, res) => {
  try {
    const { recordId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recordId"
      });
    }

    const logs = await AuditLogModel.find({ recordId })
      .populate("changedBy", "name email role")
      .populate("recordId", "transactionId referenceNumber amount transactionDate")
      .populate("uploadJobId", "originalFileName cloudinaryUrl createdAt")
      .populate("targetUserId", "name email role isActive")
      .sort({ createdAt: 1 })
      .lean();

    return res.json({
      success: true,
      timeline: logs
    });
  } catch (err) {
    console.error("Failed to fetch record timeline:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch record timeline"
    });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const { uploadJobId, recordId, source, limit = 100 } = req.query;
    const match = {};

    if (uploadJobId && mongoose.Types.ObjectId.isValid(uploadJobId)) {
      match.uploadJobId = uploadJobId;
    }
    if (recordId && mongoose.Types.ObjectId.isValid(recordId)) {
      match.recordId = recordId;
    }
    if (source) {
      match.source = source;
    }

    const logs = await AuditLogModel.find(match)
      .populate("changedBy", "name email role")
      .populate("recordId", "transactionId referenceNumber amount transactionDate")
      .populate("uploadJobId", "originalFileName cloudinaryUrl createdAt")
      .populate("targetUserId", "name email role isActive")
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit), 500))
      .lean();

    return res.json({
      success: true,
      logs
    });
  } catch (err) {
    console.error("Failed to fetch audit logs:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs"
    });
  }
};

export const backfillAuditLogs = async (req, res) => {
  try {
    const rows = await ReconciliationResultModel.find()
      .populate("recordId")
      .lean();

    let created = 0;

    for (const row of rows) {
      if (!row.recordId) continue;

      const existing = await AuditLogModel.findOne({
        recordId: row.recordId._id,
        field: "reconciliationStatus"
      }).lean();

      if (existing) continue;

      const job = await UploadModel.findById(row.uploadJobId).select("uploadedBy").lean();

      await AuditLogModel.create([
        {
          recordId: row.recordId._id,
          uploadJobId: row.uploadJobId,
          field: "recordCreated",
          oldValue: null,
          newValue: {
            transactionId: row.recordId.transactionId,
            amount: row.recordId.amount,
            referenceNumber: row.recordId.referenceNumber,
            transactionDate: row.recordId.transactionDate
          },
          changedBy: job?.uploadedBy ?? null,
          source: "SYSTEM",
          createdAt: row.recordId.createdAt,
          updatedAt: row.recordId.createdAt
        },
        {
          recordId: row.recordId._id,
          uploadJobId: row.uploadJobId,
          field: "reconciliationStatus",
          oldValue: null,
          newValue: row.status,
          changedBy: job?.uploadedBy ?? null,
          source: "SYSTEM",
          createdAt: row.createdAt,
          updatedAt: row.createdAt
        }
      ]);

      created += 2;
    }

    return res.json({
      success: true,
      created
    });
  } catch (err) {
    console.error("Backfill audit logs failed:", err);
    return res.status(500).json({
      success: false,
      message: "Backfill audit logs failed"
    });
  }
};
