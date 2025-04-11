import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Filter, SearchIcon } from "lucide-react";
import InterviewReport from "@/components/reports/InterviewReport";
import { useAuth } from "@/hooks/use-auth";

export default function Reports() {
  const [selectedInterview, setSelectedInterview] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();
  
  const { data: interviews, isLoading: isLoadingInterviews } = useQuery<any[]>({
    queryKey: ["/api/interviews", user?.role],
    staleTime: 0, // Always consider the data stale
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
  
  const { data: candidates } = useQuery<any[]>({
    queryKey: ["/api/candidates"],
  });
  
  const { data: selectedInterviewDetails, isLoading: isLoadingDetails } = useQuery<any>({
    queryKey: [`/api/interviews/${selectedInterview}/details`],
    enabled: selectedInterview !== null,
  });

  const getCandidateName = (candidateId: number) => {
    if (!candidates) return "Loading...";
    const candidate = candidates.find(c => c.id === candidateId);
    return candidate?.name || "Unknown";
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  const filteredInterviews = interviews?.filter(interview => {
    // Filter by status
    if (statusFilter !== "all" && interview.status !== statusFilter) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const candidateName = getCandidateName(interview.candidateId);
      const searchTermLower = searchTerm.toLowerCase();
      
      return (
        interview.title.toLowerCase().includes(searchTermLower) ||
        candidateName.toLowerCase().includes(searchTermLower)
      );
    }
    
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleInterviewSelect = (interviewId: number) => {
    setSelectedInterview(interviewId);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Interview List Panel */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Interview Reports</CardTitle>
                <CardDescription>Select an interview to view its report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search and Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search interviews..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status-filter" className="sr-only">Filter by Status</Label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger id="status-filter" className="w-full">
                          <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Interview List */}
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {isLoadingInterviews ? (
                      Array(5).fill(0).map((_, i) => (
                        <div key={i} className="p-3 rounded-md border border-gray-200">
                          <Skeleton className="h-5 w-36 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))
                    ) : filteredInterviews && filteredInterviews.length > 0 ? (
                      filteredInterviews.map((interview) => (
                        <div 
                          key={interview.id}
                          className={`p-3 rounded-md border hover:border-indigo-300 cursor-pointer transition-colors ${
                            selectedInterview === interview.id ? 
                            'border-indigo-500 bg-indigo-50' : 
                            'border-gray-200'
                          }`}
                          onClick={() => handleInterviewSelect(interview.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium truncate">{interview.title}</div>
                            {getStatusBadge(interview.status)}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {getCandidateName(interview.candidateId)} • {formatDate(interview.date)}
                          </div>
                          {interview.assignee && (
                            <div className="text-sm text-gray-500 mt-1">
                              Interviewer: {interview.assignee.name}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {searchTerm || statusFilter !== "all" ? 
                          "No interviews match your filters." : 
                          "No interviews found."
                        }
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Report Details Panel */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Interview Report Details</CardTitle>
                <CardDescription>View and generate reports for the selected interview</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingDetails ? (
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <div className="grid grid-cols-3 gap-4 my-6">
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                      <Skeleton className="h-24" />
                    </div>
                    <Skeleton className="h-32" />
                  </div>
                ) : selectedInterviewDetails ? (
                  <InterviewReport interview={selectedInterviewDetails} />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-96">
                    <div className="rounded-full bg-gray-100 p-6 mb-4">
                      <Filter className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Interview Selected</h3>
                    <p className="text-gray-500 max-w-md">
                      Select an interview from the list on the left to view and generate its report.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
