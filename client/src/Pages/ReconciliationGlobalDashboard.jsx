import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import SummaryCards from "@/components/SummaryCards";
import ReconciliationChart from "@/components/ReconciliationChart";
import FiltersBar from "@/components/FiltersBar";
import {
  GET_ALL_JOBS,
  GET_GLOBAL_RECONCILIATION_DATA,
  GET_RECONCILIATION_BY_JOB_ID
} from "@/utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const formatJobLabel = (job) => {
  const fileName =
    job.originalFileName ||
    (job.createdAt ? `Upload on ${new Date(job.createdAt).toLocaleDateString()}` : "Uploaded file");
  const uploaderName = job.uploadedBy?.name || "Unknown uploader";
  const uploadedAt = job.createdAt ? new Date(job.createdAt).toLocaleString() : "";
  const base = `${fileName} - ${uploaderName}`;
  return uploadedAt ? `${base} (${uploadedAt})` : base;
};

export default function ReconciliationGlobalDashboard() {
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({});
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const activeFilters = useMemo(() => {
    const normalized = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== "" && value !== null && value !== undefined)
    );

    const { startDate, endDate, ...rest } = normalized;

    // Apply date filter only when both dates are selected.
    if (startDate && endDate) {
      return { ...rest, startDate, endDate };
    }

    return rest;
  }, [filters]);

  const activeFiltersKey = useMemo(
    () => JSON.stringify(activeFilters),
    [activeFilters]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await apiClient.get(GET_ALL_JOBS, {
          withCredentials: true
        });
        setJobs(res.data || []);
      } catch (err) {
        console.error("Failed to fetch upload jobs", err);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res =
          selectedJobId === "ALL"
            ? await apiClient.get(GET_GLOBAL_RECONCILIATION_DATA, {
                params: JSON.parse(activeFiltersKey),
                withCredentials: true
              })
            : await apiClient.get(GET_RECONCILIATION_BY_JOB_ID(selectedJobId), {
                withCredentials: true
              });

        if (isMounted) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [activeFiltersKey, selectedJobId]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (!data) return null;

  const completedJobs = jobs.filter((job) => job.status === "COMPLETED");
  const selectedJob =
    selectedJobId === "ALL" ? null : completedJobs.find((job) => job._id === selectedJobId) || null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Reconciliation Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Select a specific upload file for file-level reconciliation, or keep all files for global summary.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Upload File</p>
        <Select value={selectedJobId} onValueChange={setSelectedJobId}>
          <SelectTrigger className="w-full md:w-[420px]">
            <SelectValue placeholder="Select upload file" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Files (Global)</SelectItem>
            {completedJobs.map((job) => {
              return (
                <SelectItem key={job._id} value={job._id}>
                  {formatJobLabel(job)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {selectedJob && (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>Uploaded By: {selectedJob.uploadedBy?.name || selectedJob.uploadedBy?.email || "Unknown"}</p>
            {selectedJob.cloudinaryUrl ? (
              <Button asChild variant="outline" className="w-fit">
                <a href={selectedJob.cloudinaryUrl} target="_blank" rel="noreferrer">
                  View Document
                </a>
              </Button>
            ) : (
              <p>Document URL not available for this upload.</p>
            )}
          </div>
        )}
      </div>

      {selectedJobId === "ALL" && <FiltersBar filters={filters} setFilters={setFilters} />}
      <SummaryCards summary={data.summary} />
      <ReconciliationChart chartData={data.chart} />
    </div>
  );
}
