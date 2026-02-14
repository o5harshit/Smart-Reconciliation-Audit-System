import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import AuthRoutes from "./Routes/AuthRoutes.js";
import UploadRoutes from "./Routes/UploadRoutes.js";
import reconciliationRoutes from "./Routes/ReconciliationRoutes.js";
import auditRoutes from "./Routes/AuditRoutes.js";
import RecordRoutes from "./Routes/RecordRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.ORIGIN, // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // If using cookies/auth headers
}))

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`app is listening on port ${PORT}`);
});

async function main() {
  await mongoose.connect(process.env.DB_URL);
}

main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log("error connecting to database", err);
});


app.use("/api/auth",AuthRoutes);
app.use("/api/uploads", UploadRoutes);
app.use("/api/reconciliation", reconciliationRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/record",RecordRoutes);
