import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import JobPositionForm from '@/components/jobs/JobPositionForm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, UsersIcon, Building2Icon, MapPinIcon, BriefcaseIcon, ToggleLeftIcon, ToggleRightIcon } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from "sonner";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface JobPosition {
  id: number;
  title: string;
  department: string;
  location: string;
  level: string;
  active: boolean;
  description?: string;
  requirements?: string[];
}

export default function OpenJobs() {
  const { user } = useAuth();
  const [showInactive, setShowInactive] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error } = useQuery<JobPosition[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const response = await fetch("/api/job-positions");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      return response.json();
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await fetch(`/api/job-positions/${jobId}/toggle-active`, {
        method: "PUT",
      });
      if (!response.ok) {
        throw new Error("Failed to toggle job status");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job status updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update job status");
    },
  });

  const filteredJobs = jobs.filter((job: JobPosition) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === "all" || job.department === selectedDepartment;
    const matchesLevel = selectedLevel === "all" || job.level === selectedLevel;
    const matchesLocation = selectedLocation === "all" || job.location === selectedLocation;
    const matchesActiveStatus = showInactive ? !job.active : job.active;
    return matchesSearch && matchesDepartment && matchesLevel && matchesLocation && matchesActiveStatus;
  });

  const { data: applications = [] } = useQuery<any[]>({
    queryKey: ["applications"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/applications');
        return response.json();
      } catch (error) {
        console.error("Error fetching applications:", error);
        return [];
      }
    },
  });

  // Count applications per job
  const getApplicationCount = (jobId: number) => {
    return applications.filter(app => app.jobId === jobId).length;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">Error loading jobs</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Open Positions</h1>
            {(user?.role === "hr" || user?.role === "admin") && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add New Position
              </Button>
            )}
          </div>

          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-4">
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
              />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {Array.from(new Set(jobs.map((job: JobPosition) => job.department))).map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {Array.from(new Set(jobs.map((job: JobPosition) => job.level))).map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {Array.from(new Set(jobs.map((job: JobPosition) => job.location))).map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showInactive"
                  checked={showInactive}
                  onCheckedChange={(checked) => setShowInactive(checked as boolean)}
                />
                <Label htmlFor="showInactive">Show Inactive Jobs</Label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job: JobPosition) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{job.title}</h2>
                  <div className="flex items-center gap-3">
                    {!job.active && (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                    {(user?.role === "hr" || user?.role === "admin") && (
                      <button
                        onClick={() => toggleActiveMutation.mutate(job.id)}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          job.active 
                            ? "bg-green-500 focus:ring-green-500" 
                            : "bg-gray-200 focus:ring-gray-400"
                        }`}
                        title={job.active ? "Deactivate job" : "Activate job"}
                      >
                        <span
                          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            job.active ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md flex items-center">
                      <UsersIcon className="h-4 w-4 mr-1" />
                      <span className="font-medium">{getApplicationCount(job.id)} applicants</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building2Icon className="h-4 w-4 mr-2" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <BriefcaseIcon className="h-4 w-4 mr-2" />
                    <span>{job.level}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setIsEditModalOpen(true);
                    }}
                    className="text-blue-500 hover:text-blue-600"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Job Details Modal */}
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedJob?.title}</DialogTitle>
              </DialogHeader>
              {selectedJob && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-500">Department</h3>
                      <p>{selectedJob.department}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Level</h3>
                      <p>{selectedJob.level}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Location</h3>
                      <p>{selectedJob.location}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Status</h3>
                      <Badge variant={selectedJob.active ? "default" : "secondary"}>
                        {selectedJob.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-500 mb-2">Description</h3>
                    <p className="whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>

                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-500 mb-2">Requirements</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedJob.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Create Job Modal */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Job Position</DialogTitle>
              </DialogHeader>
              <JobPositionForm onSuccess={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
}