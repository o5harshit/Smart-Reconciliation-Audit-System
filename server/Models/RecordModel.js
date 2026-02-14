import mongoose from "mongoose";

const recordSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    index: true // ✅ mandatory index
  },
  amount: {
    type: Number,
    required: true
  },
  referenceNumber: {
    type: String,
    required: true,
    index: true // ✅ mandatory index
  },
  transactionDate: {
    type: Date,
    required: true
  },
  uploadJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UploadJob",
    index: true // ✅ mandatory index
  }
}, { timestamps: true });

const RecordModel =  mongoose.model("Record", recordSchema);

export default RecordModel;
