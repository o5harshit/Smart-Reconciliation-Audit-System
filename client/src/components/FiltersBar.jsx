import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const EMPTY_FILTERS = {
  startDate: "",
  endDate: "",
  status: "",
  uploadedBy: ""
};

export default function FiltersBar({ filters, setFilters }) {
  const currentFilters = { ...EMPTY_FILTERS, ...filters };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
        <Input
          type="date"
          value={currentFilters.startDate}
          onChange={(e) => updateFilter("startDate", e.target.value)}
        />

        <Input
          type="date"
          value={currentFilters.endDate}
          onChange={(e) => updateFilter("endDate", e.target.value)}
        />

        <Select
          value={currentFilters.status || "ALL"}
          onValueChange={(value) =>
            updateFilter("status", value === "ALL" ? "" : value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="MATCHED">Matched</SelectItem>
            <SelectItem value="PARTIAL">Partially Matched</SelectItem>
            <SelectItem value="UNMATCHED">Not Matched</SelectItem>
            <SelectItem value="DUPLICATE">Duplicate</SelectItem>
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}
