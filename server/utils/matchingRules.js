export const MATCHING_RULES = {
  exactMatch: {
    enabled: true,
    fields: ["transactionId", "amount"]
  },

  partialMatch: {
    enabled: true,
    field: "referenceNumber",
    tolerancePercent: 0.02
  },

  duplicateCheck: {
    enabled: true,
    field: "transactionId"
  }
};
