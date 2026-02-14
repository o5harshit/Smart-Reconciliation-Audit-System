import AuditLogModel from "../Models/AuditLogModel.js";

export const createAuditLog = async ({
  recordId,
  uploadJobId,
  targetUserId = null,
  entityType = "RECORD",
  field,
  oldValue,
  newValue,
  changedBy = null,
  source
}) => {
  return AuditLogModel.create({
    recordId,
    uploadJobId,
    targetUserId,
    entityType,
    field,
    oldValue,
    newValue,
    changedBy,
    source
  });
};

export const createFieldChangeAuditLogs = async ({
  recordBefore,
  recordAfter,
  changedBy,
  source
}) => {
  const trackedFields = ["transactionId", "amount", "referenceNumber", "transactionDate"];
  const writes = [];

  for (const field of trackedFields) {
    const oldValue = recordBefore[field];
    const newValue = recordAfter[field];

    if (String(oldValue) !== String(newValue)) {
      writes.push(
        createAuditLog({
          recordId: recordAfter._id,
          uploadJobId: recordAfter.uploadJobId,
          field,
          oldValue,
          newValue,
          changedBy,
          source
        })
      );
    }
  }

  if (writes.length > 0) {
    await Promise.all(writes);
  }
};
