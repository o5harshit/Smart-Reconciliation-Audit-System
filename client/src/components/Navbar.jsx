import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { logout } from "@/redux/slices/authSlice";
import { LOGOUT_USER } from "@/utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "sonner";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    try {
      const response = await apiClient.get(LOGOUT_USER, {
        withCredentials: true,
      });

      if (response.data.success) {
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/auth");
      } else {
        toast.error("Logout failed. Try again.");
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <nav className="w-full bg-white border-b px-6 py-4 flex items-center justify-between">

      {/* LEFT: Brand */}
      <div
        onClick={() => navigate("/dashboard")}
        className="text-xl font-semibold tracking-tight text-slate-800 cursor-pointer"
      >
        Smart Bank Reconciliation
      </div>

      {/* CENTER: Navigation */}
      {user && (
        <div className="hidden md:flex items-center gap-6">

          {/* Global Dashboard */}
          <NavLink
            to="/reconciliation-dashboard"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-slate-900" : "text-slate-500"
              } hover:text-slate-900`
            }
          >
            Reconciliation Dashboard
          </NavLink>

          {/* Records */}
          <NavLink
            to="/records"
            className={({ isActive }) =>
              `text-sm font-medium ${
                isActive ? "text-slate-900" : "text-slate-500"
              } hover:text-slate-900`
            }
          >
            Records
          </NavLink>

          {/* Upload CSV (Admin + Analyst) */}
          {(user.role === "admin" || user.role === "analyst") && (
            <NavLink
              to="/upload-csv"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? "text-slate-900" : "text-slate-500"
                } hover:text-slate-900`
              }
            >
              Upload CSV
            </NavLink>
          )}

          {/* Users (Admin Only) */}
          {user.role === "admin" && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? "text-slate-900" : "text-slate-500"
                } hover:text-slate-900`
              }
            >
              Users
            </NavLink>
          )}

          {/* Audit Logs (Admin + Analyst) */}
          {(user.role === "admin" || user.role === "analyst") && (
            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? "text-slate-900" : "text-slate-500"
                } hover:text-slate-900`
              }
            >
              Audit Logs
            </NavLink>
          )}

        </div>
      )}

      {/* RIGHT: User Info + Logout */}
      {user && (
        <div className="flex items-center gap-4">

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-medium text-slate-800">
              {user.name}
            </span>

            <Badge
              variant={
                user.role === "admin"
                  ? "destructive"
                  : user.role === "analyst"
                  ? "default"
                  : "secondary"
              }
              className="capitalize w-fit ml-auto"
            >
              {user.role}
            </Badge>
          </div>

          <Button
            variant="outline"
            className="text-sm cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </Button>

        </div>
      )}

    </nav>
  );
};

export default Navbar;
