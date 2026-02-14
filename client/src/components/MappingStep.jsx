import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export default function MappingStep({ headers, mapping, setMapping, requiredFields }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Column Mapping</CardTitle>
        <CardDescription>
          Map CSV columns to system fields (mandatory)
        </CardDescription>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requiredFields.map((f) => (
          <div key={f.key} className="space-y-2">
            <label className="text-sm font-medium">{f.label}</label>
            <Select
              value={mapping[f.key] || ""}
              onValueChange={(v) =>
                setMapping((prev) => ({ ...prev, [f.key]: v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select CSV column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
