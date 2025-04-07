import { useAuth } from "@/hooks/use-auth";
import { USER_ROLES } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type AllowedRoles = string[];

export function ProtectedRoute({
  path,
  allowedRoles = [USER_ROLES.HR, USER_ROLES.TECHNICAL_INTERVIEWER, USER_ROLES.DIRECTOR],
  component: Component,
}: {
  path: string;
  allowedRoles?: AllowedRoles;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // If not logged in, redirect to auth page
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check if the user is inactive
  if (user && !user.active) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Account Not Activated</h1>
          <p className="mb-4">Your account needs to be activated by an administrator before you can access the system.</p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => window.location.href = "/auth"}
          >
            Return to Login
          </button>
        </div>
      </Route>
    );
  }

  // If user doesn't have the required role, redirect to the home page
  if (allowedRoles.length > 0 && user.role && !allowedRoles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-4">You don't have permission to access this page.</p>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => window.location.href = "/"}
          >
            Return to Dashboard
          </button>
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}