import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { GET_ALL_JOBS } from "@/utils/constants";
import { useNavigate } from "react-router-dom";

export default function ReconciliationDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ React Router

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(GET_ALL_JOBS, {
          withCredentials: true,
        });
        setJobs(res.data);
      } catch (err) {
        console.error("Failed to fetch uploads", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
  

  if (loading) return <p className="p-6">Loading uploads...</p>;

  const getDisplayName = (job) => {
    if (job.originalFileName) return job.originalFileName;
    if (job.createdAt) {
      return `Upload on ${new Date(job.createdAt).toLocaleDateString()}`;
    }
    return "Uploaded file";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Uploaded Documents</h1>

      <div className="border rounded-md">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">File</th>
              <th className="p-3 text-left">Uploaded By</th>
              <th className="p-3">Status</th>
              <th className="p-3">Uploaded At</th>
              <th className="p-3">Document</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((job) => (
              <tr key={job._id} className="border-t">
                <td className="p-3">{getDisplayName(job)}</td>
                <td className="p-3">{job.uploadedBy?.name || job.uploadedBy?.email || "Unknown"}</td>
                <td className="p-3 text-center">{job.status}</td>
                <td className="p-3 text-center">
                  {new Date(job.createdAt).toLocaleString()}
                </td>
                <td className="p-3 text-center">
                  {job.cloudinaryUrl ? (
                    <a
                      href={job.cloudinaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Document
                    </a>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  {job.status === "COMPLETED" && (
                    <button
                      onClick={() => navigate(`/reconciliation/${job._id}`)}
                      className="
      inline-flex items-center justify-center
      px-4 py-2
      text-sm font-medium
      text-white
      bg-blue-600
      rounded-md
      hover:bg-black-700
      focus:outline-none
      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      transition cursor-pointer
    "
                    >
                      View Reconciliation
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
