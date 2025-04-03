import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import QuestionFilters from "@/components/questions/QuestionFilters";
import QuestionsList from "@/components/questions/QuestionsList";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QuestionFilter } from "@shared/schema";

export default function GenerateQuestions() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [candidateName, setCandidateName] = useState("");
  const [interviewTitle, setInterviewTitle] = useState("");
  const [showCreateInterview, setShowCreateInterview] = useState(false);

  const { data: candidates, isLoading: isLoadingCandidates } = useQuery<any[]>({
    queryKey: ["/api/candidates"],
  });

  const { mutate: generateQuestions, isPending: isGenerating } = useMutation({
    mutationFn: async (filter: QuestionFilter) => {
      const response = await apiRequest("POST", "/api/questions/generate", filter);
      return response.json();
    },
    onSuccess: (data) => {
      setQuestions(data);
      if (data.length > 0) {
        setShowCreateInterview(true);
      } else {
        toast({
          title: "No questions found",
          description: "No questions match your criteria. Try adjusting your filters.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error generating questions",
        description: error.message || "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: createCandidate, isPending: isCreatingCandidate } = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/candidates", {
        name,
        email: "",
        notes: ""
      });
      return response.json();
    },
    onSuccess: (data) => {
      startInterview(data.id);
    },
    onError: (error) => {
      toast({
        title: "Error creating candidate",
        description: error.message || "Failed to create candidate. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: createInterview, isPending: isCreatingInterview } = useMutation({
    mutationFn: async ({ candidateId, title, questionIds }: { candidateId: number, title: string, questionIds: number[] }) => {
      // Create new interview
      const createResponse = await apiRequest("POST", "/api/interviews", {
        title,
        candidateId,
        date: new Date(),
        status: "in_progress",
        notes: ""
      });
      const interview = await createResponse.json();
      
      // Add questions to the interview
      await Promise.all(questionIds.map(questionId => 
        apiRequest("POST", "/api/interview-questions", {
          interviewId: interview.id,
          questionId,
          score: null,
          notes: ""
        })
      ));
      
      return interview;
    },
    onSuccess: (data) => {
      toast({
        title: "Interview created",
        description: "Your interview has been created successfully.",
        variant: "default",
      });
      
      // Navigate to the interview page
      navigate(`/interviews/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error creating interview",
        description: error.message || "Failed to create interview. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateQuestions = (filter: QuestionFilter) => {
    generateQuestions(filter);
  };

  const handleStartInterview = () => {
    // Check if we need to create a new candidate
    if (!candidateName) {
      toast({
        title: "Missing candidate name",
        description: "Please enter a candidate name to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if we have an interview title
    if (!interviewTitle) {
      toast({
        title: "Missing interview title",
        description: "Please enter an interview title to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Find if candidate already exists by name
    const existingCandidate = candidates?.find(
      c => c.name.toLowerCase() === candidateName.toLowerCase()
    );
    
    if (existingCandidate) {
      startInterview(existingCandidate.id);
    } else {
      // Create new candidate
      createCandidate(candidateName);
    }
  };
  
  const startInterview = (candidateId: number) => {
    const questionIds = questions.map(q => q.id);
    createInterview({
      candidateId,
      title: interviewTitle,
      questionIds
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Generate Questions</h1>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <QuestionFilters onGenerateQuestions={handleGenerateQuestions} isGenerating={isGenerating} />
        
        {questions.length > 0 && (
          <div className="mb-6">
            <QuestionsList 
              questions={questions.map((q, index) => ({ 
                id: `temp_${index}`, // Use deterministic values for temporary IDs
                question: {
                  ...q,
                  technology: { name: "Technology" },
                  experienceLevel: { name: "Experience Level" },
                  questionType: { name: "Question Type" }
                },
                score: null,
                notes: ""
              }))}
              onScoreChange={() => {}}
              onGenerateMore={() => handleGenerateQuestions({
                count: 3
              })}
              isGenerating={isGenerating}
            />
          </div>
        )}
        
        {showCreateInterview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create Interview Session</CardTitle>
              <CardDescription>Start an interview with these questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Interview Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Senior React Developer Interview"
                    value={interviewTitle}
                    onChange={(e) => setInterviewTitle(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="candidate">Candidate Name</Label>
                  <Input 
                    id="candidate" 
                    placeholder="Enter candidate name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleStartInterview}
                disabled={isCreatingCandidate || isCreatingInterview || !candidateName || !interviewTitle}
                className="w-full"
              >
                Start Interview
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
