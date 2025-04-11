import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import ScheduleInterview from "@/pages/ScheduleInterview";
import InterviewSession from "@/pages/InterviewSession";
import Interviews from "@/pages/Interviews";
import CustomQuestions from "@/pages/CustomQuestions";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import OpenJobs from "@/pages/OpenJobs";
import PublicJobs from "@/pages/PublicJobs";
import Apply from "@/pages/Apply";
import GenerateQuestions from "@/pages/GenerateQuestions";
import Candidates from "@/pages/Candidates";
import ManageUsers from "@/pages/ManageUsers";
import JobApplicants from "@/pages/JobApplicants";
import Layout from "@/components/layout/Layout";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { USER_ROLES } from "@shared/schema";
import CandidateProfile from "@/pages/CandidateProfile";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return <Layout>{children}</Layout>;
};

function ProtectedDashboard() {
  return <ProtectedLayout><Dashboard /></ProtectedLayout>;
}

function ProtectedScheduleInterview() {
  return <ProtectedLayout><ScheduleInterview /></ProtectedLayout>;
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

function ProtectedGenerateQuestions() {
  return <ProtectedLayout><GenerateQuestions /></ProtectedLayout>;
}

function ProtectedCandidates() {
  return <ProtectedLayout><Candidates /></ProtectedLayout>;
}

function ProtectedCandidateProfile() {
  return <ProtectedLayout><CandidateProfile /></ProtectedLayout>;
}

function ProtectedJobApplicants() {
  return <ProtectedLayout><JobApplicants /></ProtectedLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/jobs" component={PublicJobs} />
      <Route path="/apply" component={Apply} />
      <ProtectedRoute path="/" component={ProtectedDashboard} />
      <ProtectedRoute 
        path="/schedule-interview" 
        allowedRoles={[USER_ROLES.HR, USER_ROLES.ADMIN]} 
        component={ProtectedScheduleInterview} 
      />
      <ProtectedRoute 
        path="/custom-questions" 
        allowedRoles={[USER_ROLES.HR, USER_ROLES.ADMIN, USER_ROLES.TECHNICAL_INTERVIEWER]} 
        component={ProtectedCustomQuestions} 
      />
      <ProtectedRoute 
        path="/interviews" 
        allowedRoles={[USER_ROLES.HR, USER_ROLES.ADMIN, USER_ROLES.TECHNICAL_INTERVIEWER, USER_ROLES.DIRECTOR]} 
        component={ProtectedInterviews} 
      />
      <ProtectedRoute 
        path="/interviews/:id" 
        allowedRoles={[USER_ROLES.HR, USER_ROLES.ADMIN, USER_ROLES.TECHNICAL_INTERVIEWER, USER_ROLES.DIRECTOR]} 
        component={ProtectedInterviewSession} 
      />
      <ProtectedRoute 
        path="/reports" 
        allowedRoles={[USER_ROLES.HR, USER_ROLES.ADMIN, USER_ROLES.DIRECTOR]} 
        component={ProtectedReports} 
      />
      <ProtectedRoute 
        path="/settings" 
        allowedRoles={[USER_ROLES.HR, USER_ROLES.ADMIN]} 
        component={ProtectedSettings} 
      />
      <ProtectedRoute 
        path="/open-jobs" 
        allowedRoles={[USER_ROLES.HR, USER_ROLES.ADMIN]} 
        component={OpenJobs} 
      />
      <ProtectedRoute 
        path="/manage-users" 
        allowedRoles={[USER_ROLES.ADMIN]} 
        component={ProtectedManageUsers} 
      />
      <ProtectedRoute 
        path="/generate-questions" 
        component={ProtectedGenerateQuestions} 
      />
      <ProtectedRoute 
        path="/candidates" 
        component={ProtectedCandidates} 
      />
      <ProtectedRoute 
        path="/job-applicants" 
        allowedRoles={[USER_ROLES.HR, USER_ROLES.ADMIN]} 
        component={ProtectedJobApplicants} 
      />
      <Route path="/candidates/:id" component={ProtectedCandidateProfile} />
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
