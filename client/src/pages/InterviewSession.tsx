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

export default function InterviewSession() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const interviewId = parseInt(id || "0");

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
      await Promise.all(questions.map(question => 
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

  const handleScoreChange = (id: number, score: number, notes: string) => {
    console.log(`Updating score for question ${id} to ${score} with notes: ${notes}`);
    updateQuestionScore({ id, score, notes });
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
        <h1 className="text-2xl font-semibold text-gray-900">Interview Session</h1>
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
        
        <QuestionFilters 
          onGenerateQuestions={handleGenerateMoreQuestions} 
          isGenerating={isGeneratingQuestions}
        />
        
        <QuestionsList
          questions={interview.questions}
          onScoreChange={handleScoreChange}
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
        />
      </div>
    </div>
  );
}
