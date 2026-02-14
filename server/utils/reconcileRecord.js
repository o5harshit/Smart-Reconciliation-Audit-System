import RecordModel from "../Models/RecordModel.js";

export const reconcileRecord = async (recordData, rules, options = {}) => {
  const { transactionId, amount, referenceNumber } = recordData;
  const { seenTransactionIds = new Set(), excludeRecordId = null } = options;
  const baseFilter = excludeRecordId ? { _id: { $ne: excludeRecordId } } : {};

  if (rules.duplicateCheck.enabled) {
    const exists = await RecordModel.findOne({
      transactionId,
      ...baseFilter
    });
    if (exists || seenTransactionIds.has(transactionId)) {
      return "DUPLICATE";
    }
  }

  if (rules.exactMatch.enabled) {
    const exact = await RecordModel.findOne({
      transactionId,
      amount,
      ...baseFilter
    });
    if (exact) return "MATCHED";
  }

  if (rules.partialMatch.enabled) {
    const tolerance = amount * rules.partialMatch.tolerancePercent;
    const partial = await RecordModel.findOne({
      referenceNumber,
      amount: {
        $gte: amount - tolerance,
        $lte: amount + tolerance
      },
      ...baseFilter
    });
    if (partial) return "PARTIAL";
  }

  return "UNMATCHED";
};

