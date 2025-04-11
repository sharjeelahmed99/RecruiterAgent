import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, SearchIcon, CalendarIcon, UserIcon, MailIcon, PhoneIcon, FilterIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  technologies?: string[];
  notes?: string;
  status: 'new' | 'in_progress' | 'hired' | 'rejected';
  lastInterviewDate?: string;
}

interface CreateCandidateData {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  technologies?: string[];
  resumeFile?: File | null;
}

export default function Candidates() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState<CreateCandidateData>({
    name: "",
    email: "",
    phone: "",
    notes: "",
    technologies: [],
    resumeFile: null
  });

  // Fetch candidates
  const { data: candidates, isLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  // File upload mutation
  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }
      return response.json();
    },
  });

  // Create candidate mutation
  const createCandidateMutation = useMutation({
    mutationFn: async (data: CreateCandidateData) => {
      let resumePath = '';
      if (data.resumeFile) {
        const uploadResult = await uploadResumeMutation.mutateAsync(data.resumeFile);
        resumePath = uploadResult.resumeFile;
      }

      const response = await apiRequest("POST", "/api/candidates", {
        ...data,
        resumeFile: resumePath,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      setIsCreateDialogOpen(false);
      setNewCandidate({
        name: "",
        email: "",
        phone: "",
        notes: "",
        technologies: [],
        resumeFile: null
      });
      toast({
        title: "Candidate created",
        description: "The candidate has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating candidate",
        description: error.message || "Failed to create candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewCandidate(prev => ({ ...prev, resumeFile: file }));
      
      // Auto-populate fields based on resume upload
      // This is a placeholder implementation that will be enhanced in the future
      const fileName = file.name.toLowerCase();
      
      // Extract name from filename (remove extension and replace hyphens/underscores with spaces)
      const nameFromFile = fileName
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Set a placeholder email based on the name
      const emailFromName = nameFromFile
        .toLowerCase()
        .replace(/\s+/g, '.') + '@example.com';
      
      // Update candidate data with extracted information
      setNewCandidate(prev => ({
        ...prev,
        name: prev.name || nameFromFile,
        email: prev.email || emailFromName,
        // Add some placeholder technologies based on common resume keywords
        technologies: prev.technologies?.length ? prev.technologies : ['JavaScript', 'React', 'Node.js']
      }));
      
      toast({
        title: "Resume uploaded",
        description: "Candidate information has been auto-populated based on the resume. Please review and edit as needed.",
      });
    }
  };

  const handleCreateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandidate.name || !newCandidate.email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createCandidateMutation.mutate(newCandidate);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">New</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 whitespace-nowrap">In Progress</Badge>;
      case "hired":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Hired</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredCandidates = candidates?.filter(candidate => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.technologies?.some(tech => tech.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === "all" || candidate.status === statusFilter;
    
    // Always exclude candidates with 'new' status
    return matchesSearch && matchesStatus && candidate.status !== 'new';
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Candidate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateCandidate}>
                <DialogHeader>
                  <DialogTitle>Add New Candidate</DialogTitle>
                  <DialogDescription>
                    Create a new candidate profile. You can schedule interviews later.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
                      placeholder="Enter candidate's full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCandidate.email}
                      onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                      placeholder="Enter candidate's email"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={newCandidate.phone}
                      onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                      placeholder="Enter candidate's phone number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="resume">Resume</Label>
                    <div className="space-y-2">
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <p className="text-sm text-gray-500">Accepted formats: PDF, DOC, DOCX</p>
                      <p className="text-sm text-blue-600">
                        Uploading a resume will auto-populate candidate information.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newCandidate.notes}
                      onChange={(e) => setNewCandidate({ ...newCandidate, notes: e.target.value })}
                      placeholder="Add any notes about the candidate"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createCandidateMutation.isPending}>
                    {createCandidateMutation.isPending ? "Creating..." : "Create Candidate"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search candidates by name, email, or technology..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidates List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredCandidates && filteredCandidates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Technologies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Interview</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((candidate) => (
                    <TableRow key={candidate.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">{candidate.name}</div>
                            <div className="text-sm text-gray-500">
                              {candidate.technologies?.join(", ") || "No technologies specified"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <MailIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {candidate.email}
                          </div>
                          {candidate.phone && (
                            <div className="flex items-center text-sm">
                              <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {candidate.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {candidate.technologies?.map((tech, index) => (
                            <Badge key={index} variant="outline" className="bg-gray-100">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(candidate.status)}
                      </TableCell>
                      <TableCell>
                        {candidate.lastInterviewDate ? (
                          <div className="text-sm text-gray-500">
                            {new Date(candidate.lastInterviewDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400">No interviews yet</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/candidates/${candidate.id}`}>
                              View Profile
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/schedule-interview?candidateId=${candidate.id}`}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              Schedule Interview
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400">
                  <UserIcon className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm
                    ? "No candidates match your search. Try different keywords."
                    : "Get started by adding a new candidate."}
                </p>
                <div className="mt-6">
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add New Candidate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 