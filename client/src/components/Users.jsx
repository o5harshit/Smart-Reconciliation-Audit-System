import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import UsersTable from "./UsersTable";
import {
  GET_ALL_USERS,
  TOGGLE_USER_STATUS,
  UPDATE_USER_ROLE
} from "@/utils/constants";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get(GET_ALL_USERS, {
        withCredentials: true,
      });

      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (userId, newRole) => {
    try {
      await apiClient.patch(
        UPDATE_USER_ROLE(userId),
        { role: newRole },
        { withCredentials: true }
      );
      toast.success("User role updated");
      await fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };

  const toggleStatus = async (userId) => {
    try {
      await apiClient.patch(
        TOGGLE_USER_STATUS(userId),
        {},
        { withCredentials: true }
      );
      toast.success("User status updated");
      fetchUsers();
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return <p className="p-6">Loading users...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">User Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage system users and roles
        </p>
      </div>

      <UsersTable
        users={users}
        onChangeRole={changeRole}
        onToggleStatus={toggleStatus}
      />
    </div>
  );
};

export default Users;
