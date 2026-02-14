import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { GET_AUDIT_LOGS } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import AuditTimeline from "@/components/AuditTimeline";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(GET_AUDIT_LOGS, {
        withCredentials: true
      });
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      const message = err?.response?.data?.message || "Failed to load audit logs";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const groupedTimelines = useMemo(() => {
    const grouped = {};
    for (const log of logs) {
      const recordObject =
        typeof log.recordId === "object" && log.recordId !== null ? log.recordId : null;
      const targetUserObject =
        typeof log.targetUserId === "object" && log.targetUserId !== null
          ? log.targetUserId
          : null;

      const key =
        recordObject?._id
          ? `RECORD:${recordObject._id}`
          : targetUserObject?._id
          ? `USER:${targetUserObject._id}`
          : `MISC:${log._id}`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    }

    return Object.entries(grouped).map(([key, timeline]) => ({
      groupKey: key,
      record: timeline[0]?.recordId && typeof timeline[0].recordId === "object" ? timeline[0].recordId : null,
      uploadJob: timeline[0]?.uploadJobId && typeof timeline[0].uploadJobId === "object" ? timeline[0].uploadJobId : null,
      targetUser:
        timeline[0]?.targetUserId && typeof timeline[0].targetUserId === "object"
          ? timeline[0].targetUserId
          : null,
      timeline: [...timeline].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }));
  }, [logs]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Audit Logs</h1>

      <div className="flex gap-2">
        <Button onClick={fetchLogs} className="flex-1 md:flex-none">Refresh</Button>
      </div>

      {loading ? (
        <p>Loading audit logs...</p>
      ) : groupedTimelines.length === 0 ? (
        <div className="border rounded-md p-6 text-sm text-muted-foreground">
          No audit logs found. If this data existed before audit tracking was added, click
          `Generate Missing Logs`.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTimelines.map((group) => (
            <Card key={group.groupKey}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">
                  {group.record?.transactionId
                    ? `Transaction: ${group.record.transactionId}`
                    : group.targetUser?.name || group.targetUser?.email
                    ? `User: ${group.targetUser?.name || group.targetUser?.email}`
                    : "Audit Group"}
                </CardTitle>
                <div className="text-xs text-muted-foreground space-y-1">
                  {group.record ? (
                    <>
                      <p>
                        Reference: {group.record.referenceNumber || "N/A"} | Amount: {group.record.amount ?? "N/A"}
                      </p>
                      <p>
                        CSV File: {group.uploadJob?.originalFileName || "Unknown file"}
                      </p>
                      {group.uploadJob?._id && <p>Upload Job ID: {group.uploadJob._id}</p>}
                    </>
                  ) : (
                    <>
                      <p>Email: {group.targetUser?.email || "N/A"}</p>
                      <p>Role: {group.targetUser?.role || "N/A"}</p>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <AuditTimeline timeline={group.timeline} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
