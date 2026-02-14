import mongoose from "mongoose";
import ReconciliationResultModel from "../Models/ReconciliationResultModel.js";
import RecordModel from "../Models/RecordModel.js";
import UploadModel from "../Models/UploadModel.js";
import { MATCHING_RULES } from "../utils/matchingRules.js";
import { reconcileRecord } from "../utils/reconcileRecord.js";
import {
  createAuditLog,
  createFieldChangeAuditLogs
} from "../utils/auditLogger.js";

const buildSummary = (rows) => {
  const summary = {
    totalRecords: 0,
    matched: 0,
    partial: 0,
    unmatched: 0,
    duplicate: 0
  };

  rows.forEach((item) => {
    summary.totalRecords += item.count;
    if (item._id === "MATCHED") summary.matched = item.count;
    if (item._id === "PARTIAL") summary.partial = item.count;
    if (item._id === "UNMATCHED") summary.unmatched = item.count;
    if (item._id === "DUPLICATE") summary.duplicate = item.count;
  });

  const accuracy =
    summary.totalRecords === 0
      ? 0
      : (((summary.matched + summary.partial) / summary.totalRecords) * 100).toFixed(2);

  return { ...summary, accuracy };
};

export const getReconciliationByJobId = async (req, res) => {
  try {
    const { uploadJobId } = req.params;

    if (!uploadJobId || !mongoose.Types.ObjectId.isValid(uploadJobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid uploadJobId"
      });
    }

    const uploadJob = await UploadModel.findById(uploadJobId).select("_id reusedFromJobId").lean();
    if (!uploadJob) {
      return res.status(404).json({
        success: false,
        message: "Upload job not found"
      });
    }

    const effectiveJobId = uploadJob.reusedFromJobId || uploadJob._id;

    const aggregateRows = await ReconciliationResultModel.aggregate([
      {
        $match: {
          uploadJobId: new mongoose.Types.ObjectId(effectiveJobId)
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = buildSummary(aggregateRows);
    const recordResults = await ReconciliationResultModel.find({
      uploadJobId: effectiveJobId
    })
      .populate("recordId")
      .sort({ createdAt: -1 })
      .lean();

    const records = recordResults
      .filter((row) => row.recordId)
      .map((row) => ({
        recordId: row.recordId._id,
        transactionId: row.recordId.transactionId,
        amount: row.recordId.amount,
        referenceNumber: row.recordId.referenceNumber,
        transactionDate: row.recordId.transactionDate,
        status: row.status
      }));

    return res.json({
      success: true,
      summary,
      chart: [
        { name: "Matched", value: summary.matched },
        { name: "Partial", value: summary.partial },
        { name: "Unmatched", value: summary.unmatched },
        { name: "Duplicate", value: summary.duplicate }
      ],
      reusedFromJobId: uploadJob.reusedFromJobId || null,
      records
    });
  } catch (error) {
    console.error("Reconciliation fetch failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch reconciliation data"
    });
  }
};

export const getGlobalReconciliationSummary = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const pipeline = [
      {
        $lookup: {
          from: "records",
          localField: "recordId",
          foreignField: "_id",
          as: "record"
        }
      },
      { $unwind: "$record" },
      {
        $lookup: {
          from: "uploadjobs",
          localField: "uploadJobId",
          foreignField: "_id",
          as: "job"
        }
      },
      { $unwind: "$job" }
    ];

    const matchStage = {};
    if (status) matchStage.status = status;


    if (startDate && endDate) {
      matchStage["record.createdAt"] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push({
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    });

    const aggregateRows = await ReconciliationResultModel.aggregate(pipeline);
    const summary = buildSummary(aggregateRows);

    return res.json({
      success: true,
      summary,
      chart: [
        { name: "Matched", value: summary.matched },
        { name: "Partial", value: summary.partial },
        { name: "Unmatched", value: summary.unmatched },
        { name: "Duplicate", value: summary.duplicate }
      ]
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

export const manuallyCorrectRecord = async (req, res) => {
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

    const before = record.toObject();
    if (transactionId !== undefined) record.transactionId = transactionId;
    if (amount !== undefined) record.amount = Number(amount);
    if (referenceNumber !== undefined) record.referenceNumber = referenceNumber;
    if (transactionDate !== undefined) record.transactionDate = new Date(transactionDate);
    await record.save();

    await createFieldChangeAuditLogs({
      recordBefore: before,
      recordAfter: record.toObject(),
      changedBy: req.userId,
      source: "MANUAL_EDIT"
    });

    const reconciliation = await ReconciliationResultModel.findOne({ recordId: record._id });
    if (!reconciliation) {
      return res.status(404).json({
        success: false,
        message: "Reconciliation result not found for this record"
      });
    }

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

    if (reconciliation.status !== nextStatus) {
      const oldStatus = reconciliation.status;
      reconciliation.status = nextStatus;
      await reconciliation.save();

      await createAuditLog({
        recordId: record._id,
        uploadJobId: record.uploadJobId,
        field: "reconciliationStatus",
        oldValue: oldStatus,
        newValue: nextStatus,
        changedBy: req.userId,
        source: "MANUAL_EDIT"
      });
    }

    return res.json({
      success: true,
      message: "Record corrected successfully"
    });
  } catch (err) {
    console.error("Manual correction failed:", err);
    return res.status(500).json({
      success: false,
      message: "Manual correction failed"
    });
  }
};
