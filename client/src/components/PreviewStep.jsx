import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function PreviewStep({ headers, preview }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Preview (First 20 Rows)</CardTitle>
        <CardDescription>
          Verify data before starting reconciliation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="max-h-[300px] overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {preview.map((row, i) => (
                <TableRow key={i}>
                  {headers.map((h) => (
                    <TableCell key={h}>{row[h]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
