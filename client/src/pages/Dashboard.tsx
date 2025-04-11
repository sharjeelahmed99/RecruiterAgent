import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, BarChartIcon, ClipboardListIcon, UserIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: interviews, isLoading: isLoadingInterviews } = useQuery<any[]>({
    queryKey: ["/api/interviews", user?.role],
    staleTime: 0, // Always consider the data stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });

  const { data: candidates, isLoading: isLoadingCandidates } = useQuery<any[]>({
    queryKey: ["/api/candidates"],
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 my-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interviews</CardTitle>
              <CardDescription>Your last 5 completed interviews</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInterviews ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : interviews && interviews.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {interviews
                    .filter(interview => interview.status === 'completed')
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 5)
                    .map(interview => (
                      <li key={interview.id} className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-medium truncate mr-4">{interview.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(interview.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            interview.status === 'completed' ? 'bg-purple-100 text-purple-800' : 
                            interview.status === 'in_progress' ? 'bg-green-100 text-green-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {interview.status.replace('_', ' ')}
                          </span>
                          {interview.overallScore !== null && (
                            <span className="ml-2 text-xs text-gray-500">
                              Score: {interview.overallScore}/5
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No completed interviews found.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/interviews">
                  View All Interviews
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Interviews</CardTitle>
              <CardDescription>Your next 5 scheduled interviews</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInterviews ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ) : interviews && interviews.length > 0 ? (
                <ul className="space-y-3 text-sm">
                  {interviews
                    .filter(interview => interview.status === 'scheduled')
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5)
                    .map(interview => (
                      <li key={interview.id} className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-900 font-medium truncate mr-4">{interview.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(interview.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                            Scheduled
                          </span>
                          {interview.assignee && (
                            <span className="ml-2 text-xs text-gray-500">
                              Interviewer: {interview.assignee.name}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming interviews found.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/schedule-interview">
                  Schedule New Interview
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
