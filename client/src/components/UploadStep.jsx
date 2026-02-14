import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, FileText, Loader2 } from "lucide-react";

export default function UploadStep({ file, setFile, loading, onUpload }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Upload CSV</CardTitle>
        <CardDescription>
          Upload transaction file to preview and map columns
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <label
          htmlFor="csv-upload"
          className="flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted"
        >
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop CSV here or click to browse
          </p>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </label>

        {file && (
          <div className="flex items-center gap-3 border rounded-md p-3 bg-muted/50">
            <FileText className="h-5 w-5" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        )}

        <Button className= "cursor-pointer" onClick={onUpload} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload & Preview"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
