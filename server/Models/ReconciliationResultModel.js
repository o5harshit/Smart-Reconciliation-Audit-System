import mongoose from "mongoose";


const reconciliationResultSchema = new mongoose.Schema(
  {
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      required: true,
    },
    status: {
      type: String,
      enum: ["MATCHED", "PARTIAL", "UNMATCHED", "DUPLICATE"],
      required: true,
    },
    uploadJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadJob",
      index: true,
    },
  },
  { timestamps: true },
);

const ReconciliationResultModel = mongoose.model(
  "ReconciliationResult",
  reconciliationResultSchema,
);

export default ReconciliationResultModel;
