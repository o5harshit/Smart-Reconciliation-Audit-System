import fs from "fs";
import csv from "csv-parser";
import { processCSV } from "../utils/csvProcessor.js";
import UploadModel from "../Models/UploadModel.js";
import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import { getFileHash, getObjectHash } from "../utils/hash.js";

/* ================== UPLOAD + PREVIEW ================== */
export const uploadPreview = async (req, res) => {
  try {
    const filePath = req.file.path;
    const originalFileName = req.file.originalname;
    const fileHash = await getFileHash(filePath);
    const headers = [];
    const preview = [];
    let cloudinaryResult = null;

    try {
      cloudinaryResult = await uploadFileToCloudinary(filePath, originalFileName);
    } catch (cloudinaryError) {
      console.error("Cloudinary upload failed:", cloudinaryError.message);
    }

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("headers", (h) => headers.push(...h))
      .on("data", (row) => {
        if (preview.length < 20) preview.push(row);
      })
      .on("end", async () => {
        const job = await UploadModel.create({
          filePath,
          originalFileName,
          fileHash,
          cloudinaryUrl: cloudinaryResult?.secure_url,
          cloudinaryPublicId: cloudinaryResult?.public_id,
          uploadedBy: req.userId
        });

        res.json({
          success: true,
          uploadJobId: job._id,
          headers,
          preview
        });
      });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

/* ================== SAVE MAPPING + PROCESS ================== */
export const submitMapping = async (req, res) => {
  const { uploadJobId, mapping } = req.body;
  const mappingHash = getObjectHash(mapping);

  const currentJob = await UploadModel.findById(uploadJobId);
  if (!currentJob) {
    return res.status(404).json({
      success: false,
      message: "Upload job not found"
    });
  }

  // Idempotency: reuse prior completed job if same file + same mapping
  const reusableJob = await UploadModel.findOne({
    _id: { $ne: currentJob._id },
    fileHash: currentJob.fileHash,
    mappingHash,
    status: "COMPLETED"
  }).sort({ createdAt: -1 });

  if (reusableJob) {
    await UploadModel.findByIdAndUpdate(uploadJobId, {
      mapping,
      mappingHash,
      status: "COMPLETED",
      reusedFromJobId: reusableJob._id
    });

    return res.json({
      success: true,
      reused: true,
      reusedFromJobId: reusableJob._id,
      message: "Processing reused existing results (no duplicate records created)"
    });
  }

  await UploadModel.findByIdAndUpdate(uploadJobId, {
    mapping,
    mappingHash,
    reusedFromJobId: null,
    status: "PROCESSING"
  });

  // async processing
  processCSV(uploadJobId);

  res.json({
    success: true,
    message: "Processing started"
  });
};

export const getAllUploadJobs = async (req, res) => {
  const jobs = await UploadModel.find()
    .sort({ createdAt: -1 })
    .select("_id filePath originalFileName cloudinaryUrl status createdAt uploadedBy reusedFromJobId")
    .populate("uploadedBy", "name email");

  res.json(jobs);
};

export const getUploadJobById = async (req, res) => {
  try {
    const { uploadJobId } = req.params;
    const job = await UploadModel.findById(uploadJobId)
      .select("_id originalFileName cloudinaryUrl status createdAt uploadedBy reusedFromJobId")
      .populate("uploadedBy", "name email");

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Upload job not found"
      });
    }

    return res.json({
      success: true,
      job
    });
  } catch (err) {
    console.error("Failed to fetch upload job:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch upload job"
    });
  }
};
