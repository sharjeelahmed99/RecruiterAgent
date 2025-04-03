import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InterviewSummaryProps {
  interviewId: number;
  technicalScore: number | null;
  problemSolvingScore: number | null;
  communicationScore: number | null;
  overallScore: number | null;
  notes: string | null;
  recommendation: string | null;
  onSaveSummary: (data: any) => void;
}

export default function InterviewSummary({
  interviewId,
  technicalScore = 0,
  problemSolvingScore = 0,
  communicationScore = 0,
  overallScore = 0,
  notes = "",
  recommendation = "consider",
  onSaveSummary
}: InterviewSummaryProps) {
  const [interviewNotes, setInterviewNotes] = useState(notes || "");
  const [selectedRecommendation, setSelectedRecommendation] = useState(recommendation || "consider");
  const { toast } = useToast();

  const { mutate: saveInterview, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/interviews/${interviewId}`, {
        notes: data.notes,
        recommendation: data.recommendation
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save interview");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      onSaveSummary(data);
      toast({
        title: "Summary saved",
        description: "The interview summary has been saved successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error saving interview:", error);
      toast({
        title: "Error saving summary",
        description: "There was an error saving the interview summary. Please try again.",
        variant: "destructive",
      });
    }
  });

  const { mutate: submitEvaluation, isPending: isSubmitting } = useMutation({
    mutationFn: async (data: any) => {
      // First save the interview data
      const updateResponse = await apiRequest("PUT", `/api/interviews/${interviewId}`, { 
        notes: data.notes,
        recommendation: data.recommendation,
        status: "completed" 
      });
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.message || "Failed to submit evaluation");
      }
      
      const updatedInterview = await updateResponse.json();
      
      // Then return the complete interview
      const getResponse = await apiRequest("GET", `/api/interviews/${interviewId}`);
      return await getResponse.json();
    },
    onSuccess: (data) => {
      onSaveSummary(data);
      toast({
        title: "Evaluation submitted",
        description: "The interview evaluation has been submitted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Error submitting evaluation:", error);
      toast({
        title: "Error submitting evaluation",
        description: "There was an error submitting the evaluation. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSaveDraft = () => {
    const data = {
      notes: interviewNotes,
      recommendation: selectedRecommendation,
      technicalScore,
      problemSolvingScore,
      communicationScore,
      overallScore
    };
    
    saveInterview(data);
  };

  const handleSubmitEvaluation = () => {
    const data = {
      notes: interviewNotes,
      recommendation: selectedRecommendation,
      technicalScore,
      problemSolvingScore,
      communicationScore,
      overallScore
    };
    
    submitEvaluation(data);
  };

  const formatScore = (score: number | null) => {
    if (score === null) return "N/A";
    return score.toString();
  };

  const getScorePercentage = (score: number | null) => {
    if (score === null) return "0%";
    return `${(score / 5) * 100}%`;
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scoring Overview */}
        <div className="col-span-2">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Scoring Overview</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-4">
              {/* Technical Knowledge */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Technical Knowledge</div>
                  <div className="text-sm font-medium text-gray-900">{formatScore(technicalScore)}/5</div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: getScorePercentage(technicalScore) }}
                  ></div>
                </div>
              </div>
              
              {/* Problem Solving */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Problem Solving</div>
                  <div className="text-sm font-medium text-gray-900">{formatScore(problemSolvingScore)}/5</div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: getScorePercentage(problemSolvingScore) }}
                  ></div>
                </div>
              </div>
              
              {/* Communication */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-500">Communication</div>
                  <div className="text-sm font-medium text-gray-900">{formatScore(communicationScore)}/5</div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: getScorePercentage(communicationScore) }}
                  ></div>
                </div>
              </div>
              
              {/* Overall Score */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">Overall Score</div>
                  <div className="text-sm font-medium text-gray-900">{formatScore(overallScore)}/5</div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: getScorePercentage(overallScore) }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interviewer Notes */}
        <div className="col-span-1">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Interviewer Notes</h4>
          <Textarea
            rows={8}
            className="block w-full"
            placeholder="Add your overall assessment and notes here..."
            value={interviewNotes}
            onChange={(e) => setInterviewNotes(e.target.value)}
          />
          
          <div className="mt-4">
            <Label htmlFor="recommendation" className="block text-sm font-medium text-gray-700 mb-1">
              Recommendation
            </Label>
            <Select
              value={selectedRecommendation}
              onValueChange={setSelectedRecommendation}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select recommendation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strong_hire">Strong Hire</SelectItem>
                <SelectItem value="hire">Hire</SelectItem>
                <SelectItem value="consider">Consider</SelectItem>
                <SelectItem value="pass">Pass</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={isPending || isSubmitting}
        >
          Save Draft
        </Button>
        <Button
          variant="default"
          onClick={handleSubmitEvaluation}
          disabled={isPending || isSubmitting}
        >
          Submit Evaluation
        </Button>
      </div>
    </div>
  );
}
