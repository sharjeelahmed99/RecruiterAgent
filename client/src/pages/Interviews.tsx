import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PlusIcon, FilterIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Interviews() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: interviews, isLoading } = useQuery<any[]>({
    queryKey: ["/api/interviews"],
  });

  const { data: candidates } = useQuery<any[]>({
    queryKey: ["/api/candidates"],
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
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  const filteredInterviews = interviews?.filter(interview => {
    const candidateName = getCandidateName(interview.candidateId);
    const searchTermLower = searchTerm.toLowerCase();
    
    return (
      interview.title.toLowerCase().includes(searchTermLower) ||
      candidateName.toLowerCase().includes(searchTermLower) ||
      interview.status.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Interviews</h1>
          <Button asChild>
            <Link href="/generate-questions">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              New Interview
            </Link>
          </Button>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="w-full max-w-sm flex items-center relative">
              <Input
                className="pl-10"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterIcon className="h-4 w-4 text-gray-400 absolute left-3" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredInterviews && filteredInterviews.length > 0 ? (
                  filteredInterviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell className="font-medium">{interview.title}</TableCell>
                      <TableCell>{getCandidateName(interview.candidateId)}</TableCell>
                      <TableCell>{formatDate(interview.date)}</TableCell>
                      <TableCell>{getStatusBadge(interview.status)}</TableCell>
                      <TableCell>
                        {interview.overallScore !== null ? 
                          `${interview.overallScore}/5` : 
                          <span className="text-gray-400">-</span>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/interviews/${interview.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 
                        "No interviews match your search. Try different keywords." : 
                        "No interviews found. Create your first interview to get started."
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
