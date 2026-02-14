import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatValue = (value) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

const getImpactText = (entry) => {
  if (entry.field === "reconciliationStatus") {
    return "Impact: Reconciliation outcome changed for this record.";
  }
  if (entry.field === "role") {
    return "Impact: User access role changed.";
  }
  if (entry.field === "isActive") {
    return "Impact: User account enabled/disabled.";
  }
  if (entry.field === "recordDeleted") {
    return "Impact: Record removed from dataset and global/file summaries.";
  }
  if (entry.field === "recordCreated") {
    return "Impact: Record added and included in reconciliation.";
  }
  return "Impact: Record value updated and reconciliation may change.";
};

export default function AuditTimeline({ timeline }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit entries for this record.</p>
        ) : (
          <ol className="relative border-s pl-6 space-y-6">
            {timeline.map((entry) => (
              <li key={entry._id} className="relative">
                <span className="absolute -left-[31px] mt-1.5 h-3 w-3 rounded-full bg-blue-600" />
                <div className="rounded-md border p-3 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{entry.field}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Changed by: {entry.changedBy?.name || entry.changedBy?.email || "System"} | Source: {entry.source}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{getImpactText(entry)}</p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p className="rounded bg-red-50 p-2">Old: {formatValue(entry.oldValue)}</p>
                    <p className="rounded bg-green-50 p-2">New: {formatValue(entry.newValue)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
