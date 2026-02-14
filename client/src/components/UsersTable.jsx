import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import UserActions from "./UserActions";

const UsersTable = ({ users, onChangeRole, onToggleStatus }) => {
  return (
    <div className="rounded-xl border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">
                {user.name}
              </TableCell>

              <TableCell>{user.email}</TableCell>

              <TableCell>
                <Badge
                  variant={
                    user.role === "admin"
                      ? "destructive"
                      : user.role === "analyst"
                      ? "default"
                      : "secondary"
                  }
                  className="capitalize"
                >
                  {user.role}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge variant={user.isActive ? "success" : "outline"}>
                  {user.isActive ? "Active" : "Disabled"}
                </Badge>
              </TableCell>

              <TableCell>
                {new Date(user.createdAt).toLocaleDateString()}
              </TableCell>

              <TableCell className="text-right">
                <UserActions
                  user={user}
                  onChangeRole={onChangeRole}
                  onToggleStatus={onToggleStatus}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
