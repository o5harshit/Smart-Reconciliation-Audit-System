import mongoose from "mongoose";

const uploadJobSchema = new mongoose.Schema({
  filePath: String,
  originalFileName: String,
  fileHash: {
    type: String,
    index: true
  },
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },
  status: {
    type: String,
    enum: ["UPLOADED", "PROCESSING", "COMPLETED", "FAILED"],
    default: "UPLOADED"
  },
  mappingHash: {
    type: String,
    index: true
  },
  reusedFromJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UploadJob",
    default: null,
    index: true
  },
  mapping: Object,
}, { timestamps: true });

const UploadModel =  mongoose.model("UploadJob", uploadJobSchema);

export default UploadModel;
