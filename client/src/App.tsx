import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import StartAnInterview from "@/pages/StartAnInterview";
import InterviewSession from "@/pages/InterviewSession";
import Interviews from "@/pages/Interviews";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import CustomQuestions from "@/pages/CustomQuestions";
import ManageUsers from "@/pages/ManageUsers";
import Layout from "@/components/layout/Layout";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { USER_ROLES } from "@shared/schema";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return <Layout>{children}</Layout>;
};

function ProtectedDashboard() {
  return <ProtectedLayout><Dashboard /></ProtectedLayout>;
}

function ProtectedStartInterview() {
  return <ProtectedLayout><StartAnInterview /></ProtectedLayout>;
}

function ProtectedCustomQuestions() {
  return <ProtectedLayout><CustomQuestions /></ProtectedLayout>;
}

function ProtectedInterviews() {
  return <ProtectedLayout><Interviews /></ProtectedLayout>;
}

function ProtectedInterviewSession() {
  return <ProtectedLayout><InterviewSession /></ProtectedLayout>;
}

function ProtectedReports() {
  return <ProtectedLayout><Reports /></ProtectedLayout>;
}

function ProtectedSettings() {
  return <ProtectedLayout><Settings /></ProtectedLayout>;
}

function ProtectedManageUsers() {
  return <ProtectedLayout><ManageUsers /></ProtectedLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <ProtectedRoute path="/" component={ProtectedDashboard} />
      <ProtectedRoute 
        path="/start-interview" 
        allowedRoles={[USER_ROLES.HR]} 
        component={ProtectedStartInterview} 
      />
      <ProtectedRoute path="/custom-questions" component={ProtectedCustomQuestions} />
      <ProtectedRoute path="/interviews" component={ProtectedInterviews} />
      <ProtectedRoute path="/interviews/:id" component={ProtectedInterviewSession} />
      <ProtectedRoute path="/reports" component={ProtectedReports} />
      <ProtectedRoute path="/settings" component={ProtectedSettings} />
      <ProtectedRoute path="/open-jobs" component={OpenJobs} />
      <ProtectedRoute 
        path="/manage-users" 
        allowedRoles={[USER_ROLES.ADMIN]} 
        component={ProtectedManageUsers} 
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
