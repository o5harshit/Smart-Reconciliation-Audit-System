import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const toDateInputValue = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

export default function RecordSectionTable({
  records,
  canEdit,
  onUpdate,
  onDelete,
  savingRecordId,
  deletingRecordId
}) {
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [formState, setFormState] = useState({
    transactionId: "",
    amount: "",
    referenceNumber: "",
    transactionDate: ""
  });

  const startEdit = (record) => {
    setEditingRecordId(record._id);
    setFormState({
      transactionId: record.transactionId,
      amount: String(record.amount),
      referenceNumber: record.referenceNumber,
      transactionDate: toDateInputValue(record.transactionDate)
    });
  };

  const cancelEdit = () => {
    setEditingRecordId(null);
    setFormState({
      transactionId: "",
      amount: "",
      referenceNumber: "",
      transactionDate: ""
    });
  };

  const handleSave = async () => {
    if (!editingRecordId) return;
    await onUpdate(editingRecordId, {
      transactionId: formState.transactionId,
      amount: Number(formState.amount),
      referenceNumber: formState.referenceNumber,
      transactionDate: formState.transactionDate
    });
    cancelEdit();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Transaction ID</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          {canEdit && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((record) => {
          const isEditing = editingRecordId === record._id;
          const isSaving = savingRecordId === record._id;
          const isDeleting = deletingRecordId === record._id;

          return (
            <TableRow key={record._id}>
              <TableCell>
                {isEditing ? (
                  <Input
                    value={formState.transactionId}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, transactionId: e.target.value }))
                    }
                  />
                ) : (
                  record.transactionId
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formState.amount}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, amount: e.target.value }))
                    }
                  />
                ) : (
                  record.amount
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    value={formState.referenceNumber}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, referenceNumber: e.target.value }))
                    }
                  />
                ) : (
                  record.referenceNumber
                )}
              </TableCell>
              <TableCell>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formState.transactionDate}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, transactionDate: e.target.value }))
                    }
                  />
                ) : (
                  new Date(record.transactionDate).toLocaleDateString()
                )}
              </TableCell>
              <TableCell>{record.status}</TableCell>

              {canEdit && (
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} disabled={isSaving}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEdit(record)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(record._id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  )}
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

