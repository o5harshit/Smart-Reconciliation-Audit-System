import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { Toaster } from "./components/ui/sonner";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import Auth from "./Pages/Auth";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import Users from "./components/Users";
import UploadCSVPage from "./Pages/UploadCSVPage";
import ReconciliationDashboard from "./Pages/ReconciliationDashboard";
import ReconciliationView from "./Pages/ReonciliationView";
import ReconciliationGlobalDashboard from "./Pages/ReconciliationGlobalDashboard";
import AuditLogsPage from "./Pages/AuditLogsPage";
import ProtectedAuthRoute from "./lib/ProtectedAuthRoute";
import { PrivateRoute } from "./lib/PrivateRoute";
import RecordsPage from "./Pages/RecordsPage";
import RoleRoute from "./lib/RoleRoute";

const BrowseRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "auth",
        element: (
          <ProtectedAuthRoute>
            <Auth />
          </ProtectedAuthRoute>
        ),
      },
      {
        path: "Users",
        element: (
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin"]}>
              <Users />
            </RoleRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "upload-csv",
        element: (
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin", "analyst"]}>
              <UploadCSVPage />
            </RoleRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "reconciliation-dashboard",
        element: (
          <PrivateRoute>
            <ReconciliationGlobalDashboard />
          </PrivateRoute>
        ),
      },
      {
        path: "records",
        element: (
          <PrivateRoute>
            <RecordsPage />
          </PrivateRoute>
        ),
      },
      {
        path: "audit-logs",
        element: (
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin", "analyst"]}>
              <AuditLogsPage />
            </RoleRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "/reconciliation/:uploadJobId",
        element: (
          <PrivateRoute>
            <RoleRoute allowedRoles={["admin", "analyst", "viewer"]}>
              <ReconciliationView />
            </RoleRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "/",
        element: <Navigate to="/auth" replace />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth" replace />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={BrowseRouter} />
      <Toaster closeButton />
    </Provider>
  </StrictMode>,
);
