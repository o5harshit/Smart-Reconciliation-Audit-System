import { Card } from "@/components/ui/card";

export default function SummaryCards({ summary }) {
  const cards = [
    { label: "Total Records", value: summary.totalRecords },
    { label: "Matched", value: summary.matched },
    { label: "Partially Matched", value: summary.partial ?? 0 },
    { label: "Unmatched", value: summary.unmatched },
    { label: "Duplicates", value: summary.duplicate },
    { label: "Accuracy", value: `${summary.accuracy}%` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="p-4 text-center">
          <p className="text-sm text-muted-foreground">{c.label}</p>
          <p className="text-2xl font-semibold">{c.value}</p>
        </Card>
      ))}
    </div>
  );
}
