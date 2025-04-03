import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, BarChartIcon, ClipboardListIcon, HelpCircleIcon, UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: interviews, isLoading: isLoadingInterviews } = useQuery<any[]>({
    queryKey: ["/api/interviews"],
  });

  const { data: candidates, isLoading: isLoadingCandidates } = useQuery<any[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: questions, isLoading: isLoadingQuestions } = useQuery<any[]>({
    queryKey: ["/api/questions"],
  });

  const getInterviewStatusCounts = () => {
    if (!interviews) return { scheduled: 0, in_progress: 0, completed: 0 };
    
    return interviews.reduce((acc, interview) => {
      acc[interview.status] = (acc[interview.status] || 0) + 1;
      return acc;
    }, { scheduled: 0, in_progress: 0, completed: 0 });
  };

  const stats = getInterviewStatusCounts();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="my-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Interviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Interviews</CardTitle>
                <ClipboardListIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingInterviews ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{interviews?.length || 0}</div>
                )}
              </CardContent>
            </Card>
            
            {/* Active Interviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                <BarChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingInterviews ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stats.in_progress}</div>
                )}
              </CardContent>
            </Card>
            
            {/* Total Candidates */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Candidates</CardTitle>
                <UserIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingCandidates ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{candidates?.length || 0}</div>
                )}
              </CardContent>
            </Card>
            
            {/* Total Questions */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Questions</CardTitle>
                <HelpCircleIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingQuestions ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{questions?.length || 0}</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 my-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Questions</CardTitle>
              <CardDescription>Create questions based on experience, technology, and type</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Quickly generate relevant technical interview questions tailored to your needs.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/generate-questions">
                  Get Started
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>View and manage your recent interview sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInterviews ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : interviews && interviews.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {interviews.slice(0, 3).map(interview => (
                    <li key={interview.id} className="flex justify-between">
                      <span className="text-muted-foreground">{interview.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        interview.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        interview.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {interview.status.replace('_', ' ')}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No interviews found.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild className="w-full">
                <Link href="/interviews">
                  View All
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Start New Interview</CardTitle>
              <CardDescription>Create and conduct a new interview session</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Set up a new interview with custom questions for your candidate.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/generate-questions">
                  New Interview
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
