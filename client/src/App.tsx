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
import Layout from "@/components/layout/Layout";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/start-interview" component={StartAnInterview} />
        <Route path="/custom-questions" component={CustomQuestions} />
        <Route path="/interviews" component={Interviews} />
        <Route path="/interviews/:id" component={InterviewSession} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
