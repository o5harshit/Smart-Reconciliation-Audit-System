import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const ROLE_OPTIONS = ["admin", "analyst", "viewer"];

const UserActions = ({ user, onChangeRole, onToggleStatus }) => {
  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [updatingRole, setUpdatingRole] = useState(false);

  if (user.role === "admin") return null;

  const handleRoleSave = async () => {
    if (selectedRole === user.role) {
      setShowRoleEditor(false);
      return;
    }

    try {
      setUpdatingRole(true);
      await onChangeRole(user._id, selectedRole);
      setShowRoleEditor(false);
    } finally {
      setUpdatingRole(false);
    }
  };

  if (showRoleEditor) {
    return (
      <div className="flex justify-end items-center gap-2">
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={handleRoleSave} disabled={updatingRole}>
          {updatingRole ? "Saving..." : "Save"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedRole(user.role);
            setShowRoleEditor(false);
          }}
          disabled={updatingRole}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setSelectedRole(user.role);
          setShowRoleEditor(true);
        }}
      >
        Change Role
      </Button>

      <Button
        size="sm"
        variant={user.isActive ? "destructive" : "default"}
        onClick={() => onToggleStatus(user._id)}
      >
        {user.isActive ? "Disable" : "Enable"}
      </Button>
    </div>
  );
};

export default UserActions;

