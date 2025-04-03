import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";

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
  const [technicalScoreValue, setTechnicalScoreValue] = useState<number>(technicalScore !== null ? technicalScore : 0);
  const [problemSolvingScoreValue, setProblemSolvingScoreValue] = useState<number>(problemSolvingScore !== null ? problemSolvingScore : 0);
  const [communicationScoreValue, setCommunicationScoreValue] = useState<number>(communicationScore !== null ? communicationScore : 0);
  const [calculatedOverallScore, setCalculatedOverallScore] = useState<number>(overallScore !== null ? overallScore : 0);
  const { toast } = useToast();
  
  // Update calculated overall score when individual scores change
  useEffect(() => {
    const validScores = [technicalScoreValue, problemSolvingScoreValue, communicationScoreValue].filter(score => score > 0);
    const newOverallScore = validScores.length > 0
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : 0;
    setCalculatedOverallScore(newOverallScore);
    
    // Update recommendation based on overall score
    let newRecommendation = "consider";
    if (newOverallScore >= 5) {
      newRecommendation = "strong_hire";
    } else if (newOverallScore >= 4) {
      newRecommendation = "hire";
    } else if (newOverallScore >= 3) {
      newRecommendation = "consider";
    } else {
      newRecommendation = "pass";
    }
    setSelectedRecommendation(newRecommendation);
  }, [technicalScoreValue, problemSolvingScoreValue, communicationScoreValue]);
  
  // Update local state when props change
  useEffect(() => {
    setTechnicalScoreValue(technicalScore !== null ? technicalScore : 0);
    setProblemSolvingScoreValue(problemSolvingScore !== null ? problemSolvingScore : 0);
    setCommunicationScoreValue(communicationScore !== null ? communicationScore : 0);
    setInterviewNotes(notes || "");
    setSelectedRecommendation(recommendation || "consider");
  }, [technicalScore, problemSolvingScore, communicationScore, notes, recommendation]);

  const { mutate: saveInterview, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/interviews/${interviewId}`, {
        notes: data.notes,
        recommendation: data.recommendation,
        technicalScore: data.technicalScore,
        problemSolvingScore: data.problemSolvingScore,
        communicationScore: data.communicationScore,
        overallScore: data.overallScore
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
        technicalScore: data.technicalScore,
        problemSolvingScore: data.problemSolvingScore,
        communicationScore: data.communicationScore,
        overallScore: data.overallScore,
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
      technicalScore: technicalScoreValue,
      problemSolvingScore: problemSolvingScoreValue,
      communicationScore: communicationScoreValue,
      overallScore: calculatedOverallScore
    };
    
    saveInterview(data);
  };

  const handleSubmitEvaluation = () => {
    const data = {
      notes: interviewNotes,
      recommendation: selectedRecommendation,
      technicalScore: technicalScoreValue,
      problemSolvingScore: problemSolvingScoreValue,
      communicationScore: communicationScoreValue,
      overallScore: calculatedOverallScore
    };
    
    submitEvaluation(data);
  };
  
  const handleScoreChange = (value: string, setter: (value: number) => void) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 5) {
      setter(numValue);
    }
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
      
      <div className="flex items-center gap-2 mb-4 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
        <Info className="h-4 w-4" />
        <span>Scores are calculated based on questions in the interview but can be manually adjusted below to reflect other discussions.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Scoring Overview */}
        <div className="col-span-2">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Scoring Overview</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-4">
              {/* Technical Knowledge */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-500">Technical Knowledge</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={technicalScoreValue}
                      onChange={(e) => handleScoreChange(e.target.value, setTechnicalScoreValue)}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-sm text-gray-500">/5</span>
                  </div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${(technicalScoreValue / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Auto-calculated: {formatScore(technicalScore)}/5
                </div>
              </div>
              
              {/* Problem Solving */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-500">Problem Solving</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={problemSolvingScoreValue}
                      onChange={(e) => handleScoreChange(e.target.value, setProblemSolvingScoreValue)}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-sm text-gray-500">/5</span>
                  </div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${(problemSolvingScoreValue / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Auto-calculated: {formatScore(problemSolvingScore)}/5
                </div>
              </div>
              
              {/* Communication */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-500">Communication</div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      value={communicationScoreValue}
                      onChange={(e) => handleScoreChange(e.target.value, setCommunicationScoreValue)}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-sm text-gray-500">/5</span>
                  </div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ width: `${(communicationScoreValue / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Auto-calculated: {formatScore(communicationScore)}/5
                </div>
              </div>
              
              {/* Overall Score */}
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">Overall Score</div>
                  <div className="text-sm font-medium text-gray-900">{calculatedOverallScore}/5</div>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${(calculatedOverallScore / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Auto-calculated: {formatScore(overallScore)}/5
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
