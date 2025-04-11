import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { type Question, type QuestionFilter, type Candidate } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const TECHNOLOGIES = [
  "JavaScript",
  "TypeScript",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "SQL",
  "MongoDB",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "Git",
];

interface TechnicalInterviewer {
  id: number;
  name: string;
  email: string;
  techStack: Array<{ name: string; level: string }>;
  yearsOfExperience: number;
  totalInterviews: number;
  successRate: number;
  preferredTimeZone: string;
  languages: string[];
  specializations: string[];
  availabilitySlots: Array<{ date: string; time: string; duration: number }>;
}

interface RecommendedInterviewer extends TechnicalInterviewer {
  matchScore: number;
  matchingTechs: Array<{ name: string; level: string }>;
}

export default function ScheduleInterview() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<number | null>(null);
  const [showRecommended, setShowRecommended] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);

  // Get candidateId from URL if present
  const candidateId = new URLSearchParams(window.location.search).get("candidateId");

  // Candidate form state
  const [candidateData, setCandidateData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    position: '',
    resumeFile: null as File | null,
  });
  const [interviewTitle, setInterviewTitle] = useState('');

  // Fetch candidate data if candidateId is present
  const { data: existingCandidate } = useQuery({
    queryKey: ["/api/candidates", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      const response = await apiRequest("GET", `/api/candidates/${candidateId}`);
      return response.json();
    },
    enabled: !!candidateId,
  });

  // Pre-fill form with candidate data when available
  useEffect(() => {
    if (existingCandidate) {
      setCandidateData({
        name: existingCandidate.name,
        email: existingCandidate.email,
        phone: existingCandidate.phone,
        notes: existingCandidate.notes,
        position: existingCandidate.position,
        resumeFile: null, // We don't pre-fill the resume file
      });
      setSelectedTech(existingCandidate.technologies || []);
      setInterviewTitle(`Interview with ${existingCandidate.name}`);
    }
  }, [existingCandidate]);

  const { data: jobPositions } = useQuery<any>({
    queryKey: ["/api/job-positions"],
  });

  const { data: technicalInterviewers } = useQuery<TechnicalInterviewer[]>({
    queryKey: ["/api/users/technical-interviewers"],
    queryFn: async () => {
      const response = await fetch("/api/users/technical-interviewers");
      if (!response.ok) {
        throw new Error("Failed to fetch technical interviewers");
      }
      const data = await response.json();
      console.log('Technical interviewers fetched:', data);
      return data;
    }
  });

  // Get recommended interviewers based on tech stack matching
  const getRecommendedInterviewers = (): RecommendedInterviewer[] => {
    console.log('Selected tech:', selectedTech);
    console.log('Technical interviewers:', technicalInterviewers);
    
    if (!technicalInterviewers || selectedTech.length === 0) return [];
    
    return technicalInterviewers
      .map((interviewer) => {
        const techStack = interviewer.techStack || [];
        console.log('Interviewer tech stack:', interviewer.name, techStack);
        
        const matchingTechs = techStack.filter((tech) => 
          selectedTech.includes(tech.name)
        );
        const matchScore = matchingTechs.length / selectedTech.length;
        
        console.log('Matching techs for', interviewer.name, ':', matchingTechs);
        console.log('Match score:', matchScore);
        
        return {
          ...interviewer,
          matchScore,
          matchingTechs
        };
      })
      .filter((interviewer) => interviewer.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const recommendedInterviewers = getRecommendedInterviewers();
  console.log('Recommended interviewers:', recommendedInterviewers);

  // File upload mutation
  const { mutate: uploadResume, isPending: isUploading } = useMutation<{ resumeFile: string }, Error, File>({
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

  // Create interview mutation
  const { mutate: createInterview, isPending: isCreatingInterview } = useMutation({
    mutationFn: async (data: typeof candidateData) => {
      let candidateIdToUse: number;

      if (candidateId) {
        // Use existing candidate ID
        candidateIdToUse = parseInt(candidateId);
      } else {
        // Create new candidate
        let resumePath = '';
        if (data.resumeFile) {
          const formData = new FormData();
          formData.append('resume', data.resumeFile);
          const response = await fetch('/api/upload/resume', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Failed to upload resume');
          }
          const uploadResult = await response.json();
          resumePath = uploadResult.resumeFile;
        }

        // Create new candidate
        const candidateResponse = await apiRequest('POST', '/api/candidates', {
          ...data,
          resumeFile: resumePath,
          technologies: selectedTech,
        });
        const candidate = await candidateResponse.json();
        candidateIdToUse = candidate.id;
      }

      // Create the interview
      const interviewResponse = await apiRequest('POST', '/api/interviews', {
        title: interviewTitle,
        candidateId: candidateIdToUse,
        date: new Date(),
        status: "scheduled",
        assigneeId: selectedAssignee,
        notes: "",
      });
      return await interviewResponse.json();
    },
    onSuccess: (interview) => {
      // Invalidate both candidates and interviews queries to refresh the lists
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });
      
      toast({
        title: 'Success',
        description: 'Interview has been created successfully.',
        variant: 'default',
      });
      setLocation(`/interviews/${interview.id}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create interview. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    if (!candidateData.name || !interviewTitle) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    createInterview(candidateData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCandidateData(prev => ({ ...prev, resumeFile: file }));
      
      // Auto-populate candidate information from the resume filename
      const fileName = file.name;
      const nameFromFile = fileName.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' ');
      
      // Only update if the name field is empty or if we're not editing an existing candidate
      if (!candidateData.name || !candidateId) {
        setCandidateData(prev => ({ 
          ...prev, 
          name: nameFromFile,
          email: `${nameFromFile.toLowerCase().replace(/\s+/g, '.')}@example.com`
        }));
      }
      
      // Set placeholder technologies based on the file name
      const techKeywords = {
        'javascript': ['JavaScript', 'React', 'Node.js'],
        'typescript': ['TypeScript', 'React', 'Node.js'],
        'react': ['React', 'JavaScript', 'TypeScript'],
        'angular': ['Angular', 'TypeScript', 'JavaScript'],
        'vue': ['Vue', 'JavaScript', 'TypeScript'],
        'python': ['Python', 'Django', 'Flask'],
        'java': ['Java', 'Spring', 'Hibernate'],
        'csharp': ['C#', '.NET', 'ASP.NET'],
        'php': ['PHP', 'Laravel', 'MySQL'],
        'ruby': ['Ruby', 'Rails', 'PostgreSQL'],
        'go': ['Go', 'Gin', 'Docker'],
        'rust': ['Rust', 'Cargo', 'WebAssembly'],
        'sql': ['SQL', 'PostgreSQL', 'MySQL'],
        'mongodb': ['MongoDB', 'Node.js', 'Express'],
        'aws': ['AWS', 'Docker', 'Kubernetes'],
        'azure': ['Azure', 'Docker', 'Kubernetes'],
        'docker': ['Docker', 'Kubernetes', 'CI/CD'],
        'kubernetes': ['Kubernetes', 'Docker', 'Helm'],
        'git': ['Git', 'GitHub', 'CI/CD']
      };
      
      // Check if any tech keywords are in the filename
      const fileNameLower = fileName.toLowerCase();
      const matchedTechs = Object.entries(techKeywords)
        .filter(([keyword]) => fileNameLower.includes(keyword))
        .flatMap(([_, techs]) => techs);
      
      if (matchedTechs.length > 0) {
        setSelectedTech(matchedTechs.slice(0, 5)); // Limit to 5 technologies
      }
      
      toast({
        title: "Resume uploaded",
        description: "Candidate information has been auto-populated from the resume.",
        variant: "default",
      });
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Schedule an Interview</h1>
            <p className="text-gray-500 mt-1">
              {isAdmin 
                ? "Set up a new interview session with a candidate as an administrator"
                : "Set up a new interview session with a candidate"
              }
            </p>
            {candidateId && (
              <p className="text-sm text-blue-600 mt-1">
                Pre-filling information for existing candidate
              </p>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-4 space-y-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Candidate Information</CardTitle>
                <CardDescription>
                  {candidateId ? "Review and update candidate details" : "Enter the candidate's details"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter candidate's full name"
                        value={candidateData.name}
                        onChange={(e) => setCandidateData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!!candidateId}
                      />
                      {candidateId && (
                        <p className="text-sm text-gray-500">Name cannot be changed for existing candidates</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter candidate's email"
                        value={candidateData.email}
                        onChange={(e) => setCandidateData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="Enter candidate's phone number"
                        value={candidateData.phone}
                        onChange={(e) => setCandidateData(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="resume">Resume</Label>
                      <Input
                        id="resume"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <p className="text-sm text-gray-500">Accepted formats: PDF, DOC, DOCX</p>
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800 font-medium">Auto-populate feature</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Uploading a resume will automatically populate candidate information such as name, email, and suggest relevant technologies based on the resume filename.
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Add any notes about the candidate"
                        value={candidateData.notes}
                        onChange={(e) => setCandidateData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Interview Setup</CardTitle>
                <CardDescription>Configure the interview settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="jobPosition">Job Position *</Label>
                      <Select onValueChange={(value) => setCandidateData(prev => ({ ...prev, position: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Position" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobPositions?.map((position: any) => (
                            <SelectItem key={position.id} value={position.title}>
                              {position.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="interviewTitle">Interview Title *</Label>
                      <Input
                        id="interviewTitle"
                        placeholder="Enter interview title"
                        value={interviewTitle}
                        onChange={(e) => setInterviewTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="technologies">Technologies</Label>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                          >
                            {selectedTech.length > 0
                              ? `${selectedTech.length} technologies selected`
                              : "Select technologies"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search technologies..." />
                            <CommandEmpty>No technology found.</CommandEmpty>
                            <CommandGroup>
                              {TECHNOLOGIES.map((tech) => (
                                <CommandItem
                                  key={tech}
                                  value={tech}
                                  onSelect={() => {
                                    setSelectedTech((current) =>
                                      current.includes(tech)
                                        ? current.filter((t) => t !== tech)
                                        : [...current, tech]
                                    );
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedTech.includes(tech) ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {tech}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {selectedTech.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedTech.map((tech) => (
                            <div
                              key={tech}
                              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                            >
                              {tech}
                              <button
                                onClick={() => setSelectedTech((current) => current.filter((t) => t !== tech))}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="assignee">Assign To</Label>
                        {selectedTech.length > 0 && (
                          <Dialog open={showMatchingModal} onOpenChange={setShowMatchingModal}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                View Matching Interviewers
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Matching Technical Interviewers</DialogTitle>
                                <p className="text-sm text-gray-500 mt-2">
                                  Interviewers are matched based on their expertise in the selected technologies. 
                                  The match score indicates how well their skills align with the required tech stack.
                                </p>
                              </DialogHeader>
                              <div className="space-y-6 py-4">
                                {recommendedInterviewers.length > 0 ? (
                                  recommendedInterviewers.map((interviewer) => (
                                    <div key={interviewer.id} className="border rounded-lg p-4 space-y-4">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h3 className="font-medium text-lg">{interviewer.name}</h3>
                                          <p className="text-sm text-gray-500">{interviewer.email}</p>
                                          <div className="mt-1 flex gap-2">
                                            {interviewer.specializations?.map((spec: string) => (
                                              <Badge key={spec} variant="outline" className="text-xs">
                                                {spec}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        <Badge variant="secondary" className="text-lg">
                                          {Math.round(interviewer.matchScore * 100)}% match
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <p className="text-gray-500">Experience</p>
                                          <p className="font-medium">{interviewer.yearsOfExperience} years</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500">Interviews</p>
                                          <p className="font-medium">{interviewer.totalInterviews} conducted</p>
                                        </div>
                                        <div>
                                          <p className="text-gray-500">Success Rate</p>
                                          <p className="font-medium">{interviewer.successRate}%</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">Matching Technologies:</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {interviewer.matchingTechs.map((tech: { name: string; level: string }) => (
                                            <span 
                                              key={tech.name} 
                                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                            >
                                              {tech.name} ({tech.level})
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <div className="flex justify-between items-center mb-2">
                                          <h4 className="text-sm font-medium">Available Slots:</h4>
                                          <span className="text-xs text-gray-500">Timezone: {interviewer.preferredTimeZone}</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                                          {interviewer.availabilitySlots.map((slot: { date: string; time: string; duration: number }, index: number) => (
                                            <div 
                                              key={index}
                                              className="flex items-center gap-2 text-sm p-2 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
                                              onClick={() => {
                                                setSelectedAssignee(interviewer.id);
                                                setShowMatchingModal(false);
                                              }}
                                            >
                                              <div>
                                                <div className="font-medium">{format(new Date(slot.date), 'MMM dd, yyyy')}</div>
                                                <div className="text-gray-500">
                                                  {slot.time} ({slot.duration} mins)
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="flex gap-2 mt-4">
                                        <Button 
                                          variant="secondary" 
                                          className="flex-1"
                                          onClick={() => {
                                            setSelectedAssignee(interviewer.id);
                                            setShowMatchingModal(false);
                                          }}
                                        >
                                          Select Interviewer
                                        </Button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-6 text-gray-500">
                                    No matching interviewers found for the selected technologies.
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                      <Select
                        value={selectedAssignee?.toString()}
                        onValueChange={(value) => setSelectedAssignee(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select interviewer" />
                        </SelectTrigger>
                        <SelectContent>
                          {technicalInterviewers?.map((interviewer) => (
                            <SelectItem key={interviewer.id} value={interviewer.id.toString()}>
                              {interviewer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedAssignee && (
                        <div className="mt-2 text-sm text-gray-600">
                          {recommendedInterviewers
                            .find(i => i.id === selectedAssignee)
                            ?.matchingTechs?.map((tech: { name: string; level: string }) => (
                              <span key={tech.name} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                                {tech.name} ({tech.level})
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleSubmit}
              disabled={isCreatingInterview || !candidateData.name || !interviewTitle || !candidateData.position}
              className="w-full"
            >
              {isAdmin ? "Schedule Interview (Admin)" : "Schedule Interview"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}