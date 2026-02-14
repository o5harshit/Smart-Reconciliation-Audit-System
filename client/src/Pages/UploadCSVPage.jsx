import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import UploadStep from "@/components/UploadStep";
import MappingStep from "@/components/MappingStep";
import PreviewStep from "@/components/PreviewStep";
import {
  GET_UPLOAD_JOB_BY_ID,
  UPLOAD_MAPPING,
  UPLOAD_PREVIEW
} from "@/utils/constants";

const REQUIRED = [
  { key: "transactionId", label: "Transaction ID" },
  { key: "amount", label: "Amount" },
  { key: "referenceNumber", label: "Reference Number" },
  { key: "date", label: "Date" }
];

export default function UploadCSVPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [preview, setPreview] = useState([]);
  const [mapping, setMapping] = useState({});
  const [jobId, setJobId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [startingReconciliation, setStartingReconciliation] = useState(false);
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [reconciliationStatus, setReconciliationStatus] = useState(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  const handleUpload = async () => {
    if (!file) return toast.error("Select a CSV file");

    const fd = new FormData();
    fd.append("file", file);

    try {
      setUploading(true);
      const res = await apiClient.post(UPLOAD_PREVIEW, fd, {
        withCredentials: true
      });
      setHeaders(res.data.headers);
      setPreview(res.data.preview);
      setJobId(res.data.uploadJobId);
      setReconciliationStatus(null);
      setHasRedirected(false);
      toast.success("CSV uploaded successfully");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submitMapping = async () => {
    for (const field of REQUIRED) {
      if (!mapping[field.key]) {
        return toast.error(`${field.label} is required`);
      }
    }

    try {
      setStartingReconciliation(true);
      const res = await apiClient.post(
        UPLOAD_MAPPING,
        { uploadJobId: jobId, mapping },
        {
          withCredentials: true
        }
      );

      if (res.data?.reused) {
        setReconciliationStatus("COMPLETED");
        toast.success(res.data.message || "Existing reconciliation reused. Redirecting...");
        navigate(`/reconciliation/${jobId}`);
        return;
      }

      setReconciliationStatus("PROCESSING");
      setIsPollingStatus(true);
      toast.message(res.data?.message || "Reconciliation started. We will redirect once completed.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to start reconciliation");
    } finally {
      setStartingReconciliation(false);
    }
  };

  useEffect(() => {
    if (!jobId || !isPollingStatus || hasRedirected) return undefined;

    const pollStatus = async () => {
      try {
        const res = await apiClient.get(GET_UPLOAD_JOB_BY_ID(jobId), {
          withCredentials: true
        });
        const nextStatus = res.data?.job?.status;
        if (!nextStatus) return;

        setReconciliationStatus(nextStatus);

        if (nextStatus === "COMPLETED") {
          setIsPollingStatus(false);
          setHasRedirected(true);
          toast.success("Reconciliation completed. Redirecting to your document results.");
          navigate(`/reconciliation/${jobId}`);
        }

        if (nextStatus === "FAILED") {
          setIsPollingStatus(false);
          toast.error("Reconciliation failed. Please review the upload and try again.");
        }
      } catch (err) {
        console.error("Failed to poll reconciliation status:", err);
      }
    };

    pollStatus();
    const intervalId = setInterval(pollStatus, 3000);
    return () => clearInterval(intervalId);
  }, [jobId, isPollingStatus, hasRedirected, navigate]);

  const confirmDisabled =
    startingReconciliation || uploading || isPollingStatus || !jobId;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <UploadStep
        file={file}
        setFile={setFile}
        loading={uploading}
        onUpload={handleUpload}
      />

      {headers.length > 0 && (
        <MappingStep
          headers={headers}
          mapping={mapping}
          setMapping={setMapping}
          requiredFields={REQUIRED}
        />
      )}

      {preview.length > 0 && <PreviewStep headers={headers} preview={preview} />}

      {jobId && (
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full cursor-pointer"
            onClick={submitMapping}
            disabled={confirmDisabled}
          >
            {startingReconciliation
              ? "Starting Reconciliation..."
              : isPollingStatus
              ? "Reconciliation in Progress..."
              : "Confirm Mapping & Start Reconciliation"}
          </Button>

          {reconciliationStatus === "PROCESSING" && (
            <p className="text-sm text-amber-700">
              Reconciliation is processing for this uploaded document. You will be redirected automatically once it completes.
            </p>
          )}

          {reconciliationStatus === "FAILED" && (
            <p className="text-sm text-red-600">
              Reconciliation failed for this document. Please check the file and mapping, then try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
