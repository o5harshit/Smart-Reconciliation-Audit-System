import mongoose from "mongoose";
import RecordModel from "../Models/RecordModel.js";
import ReconciliationResultModel from "../Models/ReconciliationResultModel.js";
import UploadModel from "../Models/UploadModel.js";
import { MATCHING_RULES } from "../utils/matchingRules.js";
import { reconcileRecord } from "../utils/reconcileRecord.js";
import { createAuditLog, createFieldChangeAuditLogs } from "../utils/auditLogger.js";

const normalizeRecordPayload = (record) => ({
  _id: record._id,
  transactionId: record.transactionId,
  amount: record.amount,
  referenceNumber: record.referenceNumber,
  transactionDate: record.transactionDate,
  uploadJobId: record.uploadJobId
});

const recomputeAllReconciliationStatuses = async (changedBy, source = "MANUAL_EDIT") => {
  const records = await RecordModel.find().select(
    "_id transactionId amount referenceNumber uploadJobId"
  );

  for (const record of records) {
    const nextStatus = await reconcileRecord(
      {
        _id: record._id,
        transactionId: record.transactionId,
        amount: record.amount,
        referenceNumber: record.referenceNumber
      },
      MATCHING_RULES,
      { excludeRecordId: record._id }
    );

    const currentResult = await ReconciliationResultModel.findOne({ recordId: record._id });
    if (!currentResult) {
      await ReconciliationResultModel.create({
        recordId: record._id,
        uploadJobId: record.uploadJobId,
        status: nextStatus
      });

      await createAuditLog({
        recordId: record._id,
        uploadJobId: record.uploadJobId,
        field: "reconciliationStatus",
        oldValue: null,
        newValue: nextStatus,
        changedBy,
        source
      });
      continue;
    }

    if (currentResult.status !== nextStatus) {
      const oldStatus = currentResult.status;
      currentResult.status = nextStatus;
      await currentResult.save();

      await createAuditLog({
        recordId: record._id,
        uploadJobId: record.uploadJobId,
        field: "reconciliationStatus",
        oldValue: oldStatus,
        newValue: nextStatus,
        changedBy,
        source
      });
    }
  }
};

export const getRecord = async (req, res) => {
  try {
    const { uploadJobId } = req.query;
    const match = {};

    if (uploadJobId) {
      if (!mongoose.Types.ObjectId.isValid(uploadJobId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid uploadJobId"
        });
      }
      match.uploadJobId = new mongoose.Types.ObjectId(uploadJobId);
    }

    const uploads = await UploadModel.find(uploadJobId ? { _id: uploadJobId } : {})
      .sort({ createdAt: -1 })
      .select("_id originalFileName cloudinaryUrl createdAt uploadedBy")
      .populate("uploadedBy", "name email")
      .lean();

    if (uploads.length === 0) {
      return res.json({
        success: true,
        sections: []
      });
    }

    const records = await RecordModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "reconciliationresults",
          localField: "_id",
          foreignField: "recordId",
          as: "result"
        }
      },
      {
        $addFields: {
          status: { $ifNull: [{ $arrayElemAt: ["$result.status", 0] }, "UNMATCHED"] }
        }
      },
      {
        $project: {
          result: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    const recordsByJob = records.reduce((acc, record) => {
      const key = String(record.uploadJobId);
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
      return acc;
    }, {});

    const sections = uploads.map((upload) => ({
      uploadJobId: upload._id,
      fileName: upload.originalFileName || "Uploaded file",
      uploadedAt: upload.createdAt,
      uploadedBy: upload.uploadedBy,
      documentUrl: upload.cloudinaryUrl || null,
      records: recordsByJob[String(upload._id)] || []
    }));

    return res.json({
      success: true,
      sections
    });
  } catch (err) {
    console.error("Get records failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch records"
    });
  }
};

export const updateRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { transactionId, amount, referenceNumber, transactionDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recordId"
      });
    }

    const record = await RecordModel.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    const before = normalizeRecordPayload(record.toObject());
    if (transactionId !== undefined) record.transactionId = transactionId;
    if (amount !== undefined) record.amount = Number(amount);
    if (referenceNumber !== undefined) record.referenceNumber = referenceNumber;
    if (transactionDate !== undefined) record.transactionDate = new Date(transactionDate);
    await record.save();

    await createFieldChangeAuditLogs({
      recordBefore: before,
      recordAfter: normalizeRecordPayload(record.toObject()),
      changedBy: req.userId,
      source: "MANUAL_EDIT"
    });

    await recomputeAllReconciliationStatuses(req.userId, "MANUAL_EDIT");

    return res.json({
      success: true,
      message: "Record updated, reconciliation recomputed, and audit logs saved"
    });
  } catch (err) {
    console.error("Update record failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update record"
    });
  }
};

export const deleteRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recordId"
      });
    }

    const record = await RecordModel.findById(recordId);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    await createAuditLog({
      recordId: record._id,
      uploadJobId: record.uploadJobId,
      field: "recordDeleted",
      oldValue: {
        transactionId: record.transactionId,
        amount: record.amount,
        referenceNumber: record.referenceNumber,
        transactionDate: record.transactionDate
      },
      newValue: null,
      changedBy: req.userId,
      source: "MANUAL_EDIT"
    });

    await ReconciliationResultModel.deleteOne({ recordId: record._id });
    await RecordModel.deleteOne({ _id: record._id });

    await recomputeAllReconciliationStatuses(req.userId, "MANUAL_EDIT");

    return res.json({
      success: true,
      message: "Record deleted, reconciliation recomputed, and audit logs saved"
    });
  } catch (err) {
    console.error("Delete record failed:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete record"
    });
  }
};

