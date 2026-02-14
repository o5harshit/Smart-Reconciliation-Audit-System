import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "@/lib/api-client";
import SummaryCards from "@/components/SummaryCards";
import ReconciliationChart from "@/components/ReconciliationChart";
import AuditTimeline from "@/components/AuditTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  GET_RECONCILIATION_BY_JOB_ID,
  GET_RECORD_AUDIT_TIMELINE,
  MANUAL_CORRECT_RECORD
} from "@/utils/constants";
import { DashboardShimmer, TimelineShimmer } from "@/components/Shimmer";

export default function ReconciliationView() {
  const { uploadJobId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [formState, setFormState] = useState({
    transactionId: "",
    amount: "",
    referenceNumber: "",
    transactionDate: ""
  });
  const [saving, setSaving] = useState(false);

  const selectedRecord = useMemo(
    () => data?.records?.find((record) => record.recordId === selectedRecordId) || null,
    [data, selectedRecordId]
  );

  const fetchReconciliation = useCallback(async () => {
    if (!uploadJobId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(GET_RECONCILIATION_BY_JOB_ID(uploadJobId), {
        withCredentials: true
      });
      setData(res.data);

      const firstRecordId = res.data?.records?.[0]?.recordId ?? null;
      setSelectedRecordId((prev) => prev || firstRecordId);
    } catch (err) {
      console.error("Failed to load reconciliation", err);
      toast.error("Failed to load reconciliation");
    } finally {
      setLoading(false);
    }
  }, [uploadJobId]);

  useEffect(() => {
    fetchReconciliation();
  }, [fetchReconciliation]);

  useEffect(() => {
    if (!selectedRecord) return;
    setFormState({
      transactionId: selectedRecord.transactionId,
      amount: String(selectedRecord.amount),
      referenceNumber: selectedRecord.referenceNumber,
      transactionDate: new Date(selectedRecord.transactionDate).toISOString().slice(0, 10)
    });
  }, [selectedRecord]);

  useEffect(() => {
    if (!selectedRecordId) {
      setTimeline([]);
      return;
    }

    const fetchTimeline = async () => {
      try {
        setTimelineLoading(true);
        const res = await apiClient.get(GET_RECORD_AUDIT_TIMELINE(selectedRecordId), {
          withCredentials: true
        });
        setTimeline(res.data.timeline || []);
      } catch (err) {
        console.error("Failed to fetch timeline", err);
        toast.error("Failed to fetch record timeline");
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimeline();
  }, [selectedRecordId]);

  const handleManualSave = async () => {
    if (!selectedRecordId) return;

    try {
      setSaving(true);
      await apiClient.patch(
        MANUAL_CORRECT_RECORD(selectedRecordId),
        {
          transactionId: formState.transactionId,
          amount: Number(formState.amount),
          referenceNumber: formState.referenceNumber,
          transactionDate: formState.transactionDate
        },
        {
          withCredentials: true
        }
      );
      toast.success("Record updated and audit log captured");
      await fetchReconciliation();

      const res = await apiClient.get(GET_RECORD_AUDIT_TIMELINE(selectedRecordId), {
        withCredentials: true
      });
      setTimeline(res.data.timeline || []);
    } catch (err) {
      console.error("Manual correction failed", err);
      toast.error("Manual correction failed");
    } finally {
      setSaving(false);
    }
  };

  if (!uploadJobId) return <p className="p-6">No upload selected</p>;
  if (loading) return <DashboardShimmer />;
  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">Reconciliation View</h1>
      <SummaryCards summary={data.summary} />
      <ReconciliationChart chartData={data.chart} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Records</h2>
          <div className="border rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Txn ID</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Reference</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.records?.map((record) => (
                  <tr
                    key={record.recordId}
                    className={`border-t cursor-pointer ${selectedRecordId === record.recordId ? "bg-blue-50" : ""}`}
                    onClick={() => setSelectedRecordId(record.recordId)}
                  >
                    <td className="p-2">{record.transactionId}</td>
                    <td className="p-2">{record.amount}</td>
                    <td className="p-2">{record.referenceNumber}</td>
                    <td className="p-2">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedRecord && (
            <div className="border rounded-md p-4 space-y-3">
              <h3 className="font-medium">Manual Correction</h3>
              <Input
                placeholder="Transaction ID"
                value={formState.transactionId}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, transactionId: e.target.value }))
                }
              />
              <Input
                type="number"
                placeholder="Amount"
                value={formState.amount}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, amount: e.target.value }))
                }
              />
              <Input
                placeholder="Reference Number"
                value={formState.referenceNumber}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, referenceNumber: e.target.value }))
                }
              />
              <Input
                type="date"
                value={formState.transactionDate}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, transactionDate: e.target.value }))
                }
              />
              <Button onClick={handleManualSave} disabled={saving}>
                {saving ? "Saving..." : "Save Correction"}
              </Button>
            </div>
          )}
        </div>

        <div>
          {timelineLoading ? <TimelineShimmer /> : <AuditTimeline timeline={timeline} />}
        </div>
      </div>
    </div>
  );
}
