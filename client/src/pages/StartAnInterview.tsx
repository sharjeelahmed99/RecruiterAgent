import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

interface InterviewFormData {
  title: string;
  candidateId: number;
  date: string;
  assigneeId: number;
  questions: number[];
}

const initialFormData: InterviewFormData = {
  title: "",
  candidateId: 0,
  date: "",
  assigneeId: 0,
  questions: [],
};

export default function StartAnInterview() {
  const [formData, setFormData] = useState<InterviewFormData>(initialFormData);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get candidateId from URL if present
  const candidateId = searchParams.get("candidateId");

  // Fetch candidates, users, and questions
  const { data: candidates } = useQuery({
    queryKey: ["/api/candidates"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/candidates");
      return response.json();
    },
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return response.json();
    },
  });

  const { data: questions } = useQuery({
    queryKey: ["/api/questions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/questions");
      return response.json();
    },
  });

  // Fetch candidate data if candidateId is present
  const { data: candidateData } = useQuery({
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
    if (candidateData) {
      setFormData((prev) => ({
        ...prev,
        candidateId: candidateData.id,
        title: `Interview with ${candidateData.name}`,
      }));
    }
  }, [candidateData]);

  const createInterviewMutation = useMutation({
    mutationFn: async (data: InterviewFormData) => {
      const response = await apiRequest("POST", "/api/interviews", {
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Interview scheduled successfully",
      });
      navigate(`/interviews/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule interview. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInterviewMutation.mutate(formData);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Schedule New Interview</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Interview Title</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Enter interview title..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="candidateId">Candidate</Label>
          <Select
            value={formData.candidateId.toString()}
            onValueChange={(value) => handleSelectChange("candidateId", value)}
            disabled={!!candidateId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select candidate" />
            </SelectTrigger>
            <SelectContent>
              {candidates?.map((candidate: { id: number; name: string }) => (
                <SelectItem key={candidate.id} value={candidate.id.toString()}>
                  {candidate.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {candidateId && (
            <p className="text-sm text-muted-foreground">
              Candidate is pre-selected from URL
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Interview Date</Label>
          <Input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assigneeId">Interviewer</Label>
          <Select
            value={formData.assigneeId.toString()}
            onValueChange={(value) => handleSelectChange("assigneeId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interviewer" />
            </SelectTrigger>
            <SelectContent>
              {users?.map((user: { id: number; name: string }) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={createInterviewMutation.isPending}
        >
          {createInterviewMutation.isPending ? "Scheduling..." : "Schedule Interview"}
        </Button>
      </form>
    </div>
  );
} 