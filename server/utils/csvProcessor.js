import UploadModel from "../Models/UploadModel.js";
import fs from "fs";
import csv from "csv-parser";
import RecordModel from "../Models/RecordModel.js";
import ReconciliationResultModel from "../Models/ReconciliationResultModel.js";
import { MATCHING_RULES } from "./matchingRules.js";
import { reconcileRecord } from "./reconcileRecord.js";
import { createAuditLog } from "./auditLogger.js";


export const processCSV = async (jobId) => {
  const job = await UploadModel.findById(jobId);

  if (!job) {
    return;
  }

  // Idempotency safety: if results already exist for this job, do not create duplicates.
  const existingResult = await ReconciliationResultModel.findOne({ uploadJobId: job._id }).lean();
  if (existingResult) {
    if (job.status !== "COMPLETED") {
      job.status = "COMPLETED";
      await job.save();
    }
    return;
  }

  if (!fs.existsSync(job.filePath)) {
    job.status = "FAILED";
    await job.save();
    return;
  }

  const rows = [];

  fs.createReadStream(job.filePath)
    .pipe(csv())
    .on("data", (row) => rows.push(row))
    .on("end", async () => {
      const seenTransactionIds = new Set();

      try {
        for (const row of rows) {
          const recordData = {
            transactionId: row[job.mapping.transactionId],
            amount: Number(row[job.mapping.amount]),
            referenceNumber: row[job.mapping.referenceNumber],
            transactionDate: new Date(row[job.mapping.date])
          };

          if (!recordData.transactionId || isNaN(recordData.amount)) continue;

          const status = await reconcileRecord(
            recordData,
            MATCHING_RULES,
            { seenTransactionIds }
          );

          seenTransactionIds.add(recordData.transactionId);

          const record = await RecordModel.create({
            ...recordData,
            uploadJobId: job._id
          });

          await Promise.all([
            createAuditLog({
              recordId: record._id,
              uploadJobId: job._id,
              field: "recordCreated",
              oldValue: null,
              newValue: {
                transactionId: record.transactionId,
                amount: record.amount,
                referenceNumber: record.referenceNumber,
                transactionDate: record.transactionDate
              },
              changedBy: job.uploadedBy ?? null,
              source: "UPLOAD"
            }),
            createAuditLog({
              recordId: record._id,
              uploadJobId: job._id,
              field: "reconciliationStatus",
              oldValue: null,
              newValue: status,
              changedBy: job.uploadedBy ?? null,
              source: "RECONCILIATION"
            })
          ]);

          await ReconciliationResultModel.create({
            recordId: record._id,
            status,
            uploadJobId: job._id
          });
        }

        job.status = "COMPLETED";
        await job.save();
      } catch (err) {
        console.error(err);
        job.status = "FAILED";
        await job.save();
      }
    });
};
