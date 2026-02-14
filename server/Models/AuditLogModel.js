import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Record",
      default: null,
      index: true
    },
    uploadJobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadJob",
      default: null,
      index: true
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true
    },
    entityType: {
      type: String,
      enum: ["RECORD", "USER"],
      default: "RECORD",
      required: true
    },
    field: {
      type: String,
      required: true
    },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    source: {
      type: String,
      enum: ["MANUAL_EDIT", "SYSTEM", "UPLOAD", "RECONCILIATION", "USER_MANAGEMENT"],
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

auditLogSchema.index({ recordId: 1, createdAt: -1 });
auditLogSchema.index({ uploadJobId: 1, createdAt: -1 });

const immutableError = () =>
  new Error("Audit logs are immutable. Update/Delete operations are not allowed.");

auditLogSchema.pre("updateOne", function (next) {
  next(immutableError());
});
auditLogSchema.pre("updateMany", function (next) {
  next(immutableError());
});
auditLogSchema.pre("findOneAndUpdate", function (next) {
  next(immutableError());
});
auditLogSchema.pre("replaceOne", function (next) {
  next(immutableError());
});
auditLogSchema.pre("findOneAndDelete", function (next) {
  next(immutableError());
});
auditLogSchema.pre("deleteOne", function (next) {
  next(immutableError());
});
auditLogSchema.pre("deleteMany", function (next) {
  next(immutableError());
});
auditLogSchema.pre("remove", function (next) {
  next(immutableError());
});

const AuditLogModel = mongoose.model("AuditLog", auditLogSchema);

export default AuditLogModel;
