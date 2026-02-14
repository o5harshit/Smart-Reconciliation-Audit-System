import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import {
  DELETE_RECORD,
  GET_RECORDS,
  UPDATE_RECORD
} from "@/utils/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecordSectionTable from "@/components/RecordSectionTable";

export default function RecordsPage() {
  const user = useSelector((state) => state.auth.user);
  const canEdit = user?.role === "admin" || user?.role === "analyst";

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingRecordId, setSavingRecordId] = useState(null);
  const [deletingRecordId, setDeletingRecordId] = useState(null);

  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(GET_RECORDS, {
        withCredentials: true
      });
      setSections(res.data.sections || []);
    } catch (err) {
      console.error("Failed to load records", err);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  const handleUpdate = async (recordId, payload) => {
    try {
      setSavingRecordId(recordId);
      await apiClient.patch(UPDATE_RECORD(recordId), payload, {
        withCredentials: true
      });
      toast.success("Record updated. Reconciliation and audit log updated.");
      await fetchSections();
    } catch (err) {
      console.error("Failed to update record", err);
      const message = err?.response?.data?.message || "Failed to update record";
      toast.error(message);
    } finally {
      setSavingRecordId(null);
    }
  };

  const handleDelete = async (recordId) => {
    try {
      setDeletingRecordId(recordId);
      await apiClient.delete(DELETE_RECORD(recordId), {
        withCredentials: true
      });
      toast.success("Record deleted. Reconciliation and audit log updated.");
      await fetchSections();
    } catch (err) {
      console.error("Failed to delete record", err);
      const message = err?.response?.data?.message || "Failed to delete record";
      toast.error(message);
    } finally {
      setDeletingRecordId(null);
    }
  };

  if (loading) return <p className="p-6">Loading records...</p>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Records</h1>
        <p className="text-sm text-muted-foreground">
          Records are grouped by uploaded file. Update/delete triggers re-reconciliation and audit logging.
        </p>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            No records found.
          </CardContent>
        </Card>
      ) : (
        sections.map((section) => (
          <Card key={section.uploadJobId}>
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg">{section.fileName}</CardTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Uploaded by: {section.uploadedBy?.name || section.uploadedBy?.email || "Unknown"}</p>
                <p>Uploaded at: {new Date(section.uploadedAt).toLocaleString()}</p>
                {section.documentUrl && (
                  <a
                    href={section.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View document
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <RecordSectionTable
                records={section.records || []}
                canEdit={canEdit}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                savingRecordId={savingRecordId}
                deletingRecordId={deletingRecordId}
              />
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

