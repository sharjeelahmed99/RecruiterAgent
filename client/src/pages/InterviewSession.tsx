import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import InterviewHeader from "@/components/interviews/InterviewHeader";
import QuestionFilters from "@/components/questions/QuestionFilters";
import QuestionsList from "@/components/questions/QuestionsList";
import InterviewSummary from "@/components/interviews/InterviewSummary";
import { QuestionFilter } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import QuestionFilterUI from "@/components/QuestionFilter";
import InterviewTimer from "@/components/interviews/InterviewTimer";
import { PlayIcon, XCircleIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function InterviewSession() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const interviewId = parseInt(id || "0");
  const { user } = useAuth();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { data: interview, isLoading } = useQuery<any>({
    queryKey: [`/api/interviews/${interviewId}/details`],
  });

  const { mutate: generateSummary, isPending: isGeneratingReport } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/interviews/${interviewId}/summary`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${interviewId}/details`] });
      toast({
        title: "Report generated",
        description: "Interview summary has been generated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating report",
        description: error.message || "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: generateMoreQuestions, isPending: isGeneratingQuestions } = useMutation({
    mutationFn: async (filter: QuestionFilter) => {
      // 1. Generate new questions
      const questionsResponse = await apiRequest("POST", "/api/questions/generate", filter);
      const questions = await questionsResponse.json();
      
      // 2. Add them to the interview
      await Promise.all(questions.map((question: { id: number }) => 
        apiRequest("POST", "/api/interview-questions", {
          interviewId,
          questionId: question.id,
          score: null,
          notes: ""
        })
      ));
      
      return questions;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${interviewId}/details`] });
      toast({
        title: "Questions added",
        description: `${data.length} new questions have been added to the interview.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding questions",
        description: error.message || "Failed to add questions. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateQuestionScore, isPending: isUpdatingScore } = useMutation({
    mutationFn: async ({ id, score, notes }: { id: number, score: number, notes: string }) => {
      const response = await apiRequest("PUT", `/api/interview-questions/${id}`, { score, notes });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${interviewId}/details`] });
    },
    onError: (error) => {
      toast({
        title: "Error updating score",
        description: error.message || "Failed to update score. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const { mutate: toggleSkipQuestion, isPending: isTogglingSkip } = useMutation({
    mutationFn: async ({ id, skipped }: { id: number, skipped: boolean }) => {
      const response = await apiRequest("PUT", `/api/interview-questions/${id}`, { skipped });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${interviewId}/details`] });
      toast({
        title: data.skipped ? "Question skipped" : "Question restored",
        description: data.skipped ? 
          "This question will not be included in the final report." : 
          "This question will now be included in the final report.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating question",
        description: error.message || "Failed to update question status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateInterviewStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PUT", `/api/interviews/${id}`, { status });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${interviewId}/details`] });
      toast({
        title: "Interview status updated",
        description: `Interview status has been updated to ${status}.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating interview status",
        description: error.message || "Failed to update interview status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [interviewStartTime, setInterviewStartTime] = useState<Date | undefined>(undefined);

  const handleScoreChange = (id: number, score: number, notes: string) => {
    console.log(`Updating score for question ${id} to ${score} with notes: ${notes}`);
    updateQuestionScore({ id, score, notes });
  };
  
  const handleSkipToggle = (id: number, skipped: boolean) => {
    console.log(`${skipped ? 'Skipping' : 'Restoring'} question ${id}`);
    toggleSkipQuestion({ id, skipped });
  };

  const handleGenerateReport = () => {
    generateSummary();
  };

  const handleGenerateMoreQuestions = (filter: QuestionFilter) => {
    generateMoreQuestions(filter);
  };

  const handleSaveSummary = (data: any) => {
    queryClient.invalidateQueries({ queryKey: [`/api/interviews/${interviewId}/details`] });
  };

  const handleStartInterview = () => {
    if (interview.status === "scheduled") {
      // Update interview status to in_progress
      updateInterviewStatus({
        id: interviewId,
        status: "in_progress"
      });
      setInterviewStartTime(new Date());
    }
  };

  const handleCancelInterview = () => {
    updateInterviewStatus({
      id: interviewId,
      status: "cancelled"
    });
    setIsCancelDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-32 w-full mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
          <Skeleton className="h-64 w-full mb-6" />
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Interview Not Found</h1>
          <p className="mt-4">The interview you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Interview Session</h1>
          <div className="flex items-center gap-2">
            {interview.status === "in_progress" && (
              <InterviewTimer startTime={interviewStartTime} />
            )}
            {(user?.role === "HR" || user?.role === "admin") && 
             (interview.status === "scheduled" || interview.status === "in_progress") && (
              <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="bg-red-50 text-red-700 hover:bg-red-100">
                    <XCircleIcon className="mr-2 h-4 w-4" />
                    Cancel Interview
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Interview</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this interview? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                      No, Keep Interview
                    </Button>
                    <Button variant="destructive" onClick={handleCancelInterview}>
                      Yes, Cancel Interview
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <InterviewHeader
          title={interview.title}
          candidateName={interview.candidate.name}
          date={interview.date}
          status={interview.status}
          onGenerateReport={handleGenerateReport}
          isGeneratingReport={isGeneratingReport}
        />
        
        {interview.status === "scheduled" && (
          <div className="mt-6">
            <Button
              onClick={handleStartInterview}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <PlayIcon className="mr-2 h-4 w-4" />
              Start Interview
            </Button>
          </div>
        )}
        
        <div className="mt-6">
          <QuestionFilters 
            onGenerateQuestions={handleGenerateMoreQuestions} 
            isGenerating={isGeneratingQuestions}
            showStartButton={false}
          />
        </div>
        
        <QuestionsList
          questions={interview.questions}
          onScoreChange={handleScoreChange}
          onSkipToggle={handleSkipToggle}
          onGenerateMore={() => handleGenerateMoreQuestions({
            count: 3
          })}
          isGenerating={isGeneratingQuestions}
        />
        
        <InterviewSummary
          interviewId={interview.id}
          technicalScore={interview.technicalScore}
          problemSolvingScore={interview.problemSolvingScore}
          communicationScore={interview.communicationScore}
          overallScore={interview.overallScore}
          notes={interview.notes}
          recommendation={interview.recommendation}
          onSaveSummary={handleSaveSummary}
          status={interview.status}
        />
      </div>
    </div>
  );
}
