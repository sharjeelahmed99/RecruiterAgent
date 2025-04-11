import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { JobApplication } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ApplicationWithDetails extends JobApplication {
  candidate: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    technologies: string[];
    appliedAt: string;
  };
  job: {
    id: number;
    title: string;
    requirements: string[];
  };
}

export default function JobApplicants() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const { toast } = useToast();

  const { data: applications = [], isLoading: isLoadingApplications } = useQuery<ApplicationWithDetails[]>({
    queryKey: ["applications"],
    queryFn: async () => {
      try {
        const response = await api.get("/applications");
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
      }
    },
  });

  const { data: jobPositions = [], isLoading: isLoadingJobs } = useQuery<any[]>({
    queryKey: ["job-positions"],
    queryFn: async () => {
      try {
        const response = await api.get("/job-positions");
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error("Error fetching job positions:", error);
        return [];
      }
    },
  });

  const queryClient = useQueryClient();

  const filteredApplications = applications.filter(
    (app) => {
      const matchesSearch = 
        app.candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
      const matchesPosition = selectedPosition === "all" || app.job.title === selectedPosition;

      return matchesSearch && matchesStatus && matchesPosition;
    }
  );

  const calculateMatchScore = (application: ApplicationWithDetails) => {
    // Return a fixed dummy percentage of 70%
    return 70;
  };

  const handleStatusUpdate = async (applicationId: number, newStatus: 'accepted' | 'rejected') => {
    try {
      await api.put(`/applications/${applicationId}/status`, { status: newStatus });
      await queryClient.invalidateQueries({ queryKey: ["applications"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Status Updated",
        description: `Application has been ${newStatus}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Pending</Badge>;
      case "accepted":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">Accepted</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
    }
  };

  if (isLoadingApplications || isLoadingJobs) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Job Applicants</h1>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="w-full max-w-sm flex items-center relative">
                <Input
                  className="pl-10"
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FilterIcon className="h-4 w-4 text-gray-400 absolute left-3" />
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center">
                      <FilterIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48">
                <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center min-w-0">
                      <FilterIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <div className="truncate">
                        <SelectValue placeholder="Filter by position" />
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Positions</SelectItem>
                    {jobPositions.map((job) => (
                      <SelectItem key={job.id} value={job.title} className="truncate">
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Job Position</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.candidate.fullName}</div>
                          <div className="text-sm text-gray-500">
                            {Array.isArray(application.candidate.technologies) 
                              ? application.candidate.technologies.join(", ") 
                              : ""}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.job.title}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{application.candidate.email}</div>
                          <div className="text-sm text-gray-500">{application.candidate.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>
                        {application.candidate.appliedAt
                          ? format(new Date(application.candidate.appliedAt), "MMM d, yyyy")
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
                            onClick={() => setSelectedApplication(application)}
                          >
                            View Match Score
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200"
                            onClick={() => handleStatusUpdate(application.id, 'accepted')}
                            disabled={application.status === 'accepted'}
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border-red-200"
                            onClick={() => handleStatusUpdate(application.id, 'rejected')}
                            disabled={application.status === 'rejected'}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm ? 
                        "No applicants match your search. Try different keywords." : 
                        "No job applications found."
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Candidate Match Score</DialogTitle>
            <DialogDescription>
              Review the candidate's skills match with job requirements
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 overflow-y-auto" style={{ height: "calc(90vh - 130px)" }}>
            {selectedApplication && (
              <div className="space-y-6 pb-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">
                    {Math.round(calculateMatchScore(selectedApplication))}%
                  </div>
                  <div className="text-sm text-gray-500">Match Score</div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Job Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedApplication.job.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Candidate Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.candidate.technologies.map((tech) => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Application Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedApplication.candidate.fullName}</p>
                      <p><span className="font-medium">Email:</span> {selectedApplication.candidate.email}</p>
                      <p><span className="font-medium">Phone:</span> {selectedApplication.candidate.phone}</p>
                    </div>
                    <div className="space-y-2">
                      <p><span className="font-medium">Position:</span> {selectedApplication.job.title}</p>
                      <p><span className="font-medium">Applied Date:</span> {new Date(selectedApplication.candidate.appliedAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Status:</span> {selectedApplication.status}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Cover Letter</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resume</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedApplication.resume}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Interview Notes</h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{selectedApplication.interview_notes || "No interview notes available."}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={() => setSelectedApplication(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 